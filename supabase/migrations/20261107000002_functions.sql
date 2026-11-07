-- =============================================================
-- Серверные функции
-- =============================================================

-- ---------- Оформление заказа ----------
-- Цены и состав всегда берутся из базы. Цена из браузера игнорируется.
-- Повторный вызов с тем же idempotency_key возвращает уже созданный заказ.
-- Вызывается только сервером (service_role).
create or replace function public.create_order(
  p_idempotency_key uuid,
  p_customer_name   text,
  p_customer_phone  text,
  p_comment         text,
  p_payment_method  public.payment_method,
  p_items           jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing    public.orders%rowtype;
  v_settings    public.store_settings%rowtype;
  v_item        jsonb;
  v_qty         int;
  v_product     record;
  v_opt_ids     uuid[];
  v_opts        jsonb;
  v_opts_price  int;
  v_opts_count  int;
  v_lines       jsonb := '[]'::jsonb;
  v_total       int := 0;
  v_order_id    uuid;
  v_number      text;
  v_now_local   time;
begin
  select * into v_existing from public.orders where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('order_id', v_existing.id, 'order_number', v_existing.order_number,
                              'total', v_existing.total, 'is_new', false);
  end if;

  select * into v_settings from public.store_settings where id = 1;
  if found and not v_settings.ordering_enabled then
    raise exception 'ORDERING_DISABLED';
  end if;

  -- Заказы принимаются только в часы работы (московское время).
  if found then
    v_now_local := (now() at time zone 'Europe/Moscow')::time;
    if (v_settings.open_time <= v_settings.close_time
          and not (v_now_local >= v_settings.open_time and v_now_local < v_settings.close_time))
       or (v_settings.open_time > v_settings.close_time
          and not (v_now_local >= v_settings.open_time or v_now_local < v_settings.close_time)) then
      raise exception 'STORE_CLOSED';
    end if;
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 then
    raise exception 'INVALID_ITEMS';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::int;
    if v_qty is null or v_qty < 1 or v_qty > 50 then
      raise exception 'INVALID_QUANTITY';
    end if;

    select p.id, p.name, p.price into v_product
    from public.products p
    join public.categories c on c.id = p.category_id
    where p.id = (v_item ->> 'product_id')::uuid
      and p.is_active and p.is_available and c.is_active
      and (c.slug <> 'combo' or coalesce(v_settings.combos_enabled, false));
    if not found then
      raise exception 'PRODUCT_UNAVAILABLE';
    end if;

    v_opt_ids := array(
      select distinct x::uuid
      from jsonb_array_elements_text(coalesce(v_item -> 'option_ids', '[]'::jsonb)) as x
    );

    select coalesce(jsonb_agg(jsonb_build_object('id', o.id, 'name', o.name, 'price', o.price)
                              order by o.sort_order, o.name), '[]'::jsonb),
           coalesce(sum(o.price), 0)::int,
           count(*)::int
      into v_opts, v_opts_price, v_opts_count
    from public.product_options o
    where o.product_id = v_product.id and o.is_active and o.id = any (v_opt_ids);

    if v_opts_count <> coalesce(cardinality(v_opt_ids), 0) then
      raise exception 'OPTION_UNAVAILABLE';
    end if;

    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'unit_price', v_product.price,
      'options', v_opts,
      'options_price', v_opts_price,
      'quantity', v_qty,
      'line_total', (v_product.price + v_opts_price) * v_qty
    ));
    v_total := v_total + (v_product.price + v_opts_price) * v_qty;
  end loop;

  insert into public.orders (idempotency_key, customer_name, customer_phone, comment,
                             payment_method, total)
  values (p_idempotency_key, btrim(p_customer_name), p_customer_phone,
          nullif(btrim(coalesce(p_comment, '')), ''), p_payment_method, v_total)
  on conflict (idempotency_key) do nothing
  returning id, order_number into v_order_id, v_number;

  if v_order_id is null then
    -- Параллельный запрос с тем же ключом успел раньше.
    select * into v_existing from public.orders where idempotency_key = p_idempotency_key;
    return jsonb_build_object('order_id', v_existing.id, 'order_number', v_existing.order_number,
                              'total', v_existing.total, 'is_new', false);
  end if;

  insert into public.order_items (order_id, product_id, product_name, unit_price, options,
                                  options_price, quantity, line_total)
  select v_order_id, l.product_id, l.product_name, l.unit_price, l.options,
         l.options_price, l.quantity, l.line_total
  from jsonb_to_recordset(v_lines) as l(product_id uuid, product_name text, unit_price int,
       options jsonb, options_price int, quantity int, line_total int);

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_number,
                            'total', v_total, 'is_new', true);
end;
$$;

-- ---------- Ограничение частоты (антиспам) ----------
create or replace function public.check_rate_limit(
  p_action text, p_key_hash text, p_max int, p_window_seconds int
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  perform pg_advisory_xact_lock(hashtext(p_action || ':' || p_key_hash));

  select count(*) into v_count
  from public.rate_limits
  where action = p_action and key_hash = p_key_hash
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max then
    return false;
  end if;

  insert into public.rate_limits (action, key_hash) values (p_action, p_key_hash);

  -- Периодическая очистка старых записей
  if random() < 0.05 then
    delete from public.rate_limits where created_at < now() - interval '2 days';
  end if;

  return true;
end;
$$;

-- ---------- Публичная сводка по отзывам ----------
create or replace function public.review_summary()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'count', count(*),
    'average', coalesce(round(avg(rating)::numeric, 1), 0)
  )
  from public.reviews where status = 'approved';
$$;

-- ---------- Статистика для админки ----------
-- Выручка = оплаченные (is_paid) и не отменённые заказы. Выполненный заказ
-- автоматически отмечается оплаченным. Время — московское.
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_tz           text := 'Europe/Moscow';
  v_today_start  timestamptz := date_trunc('day', now() at time zone v_tz) at time zone v_tz;
  v_month_start  timestamptz := date_trunc('month', now() at time zone v_tz) at time zone v_tz;
  v_orders       jsonb;
  v_popular      jsonb;
  v_reviews      jsonb;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'orders_total', count(*),
    'orders_today', count(*) filter (where created_at >= v_today_start),
    'orders_active', count(*) filter (where status in ('new', 'accepted', 'preparing', 'ready')),
    'notify_failed', count(*) filter (where notify_status = 'failed'),
    'revenue_total', coalesce(sum(total) filter (where is_paid and status <> 'cancelled'), 0),
    'revenue_today', coalesce(sum(total) filter (where is_paid and status <> 'cancelled'
                                                 and created_at >= v_today_start), 0),
    'revenue_month', coalesce(sum(total) filter (where is_paid and status <> 'cancelled'
                                                 and created_at >= v_month_start), 0)
  ) into v_orders
  from public.orders;

  select coalesce(jsonb_agg(t order by t.quantity desc), '[]'::jsonb) into v_popular
  from (
    select oi.product_name as name, sum(oi.quantity)::int as quantity,
           sum(oi.line_total)::int as revenue
    from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.status <> 'cancelled'
    group by oi.product_name
    order by sum(oi.quantity) desc
    limit 5
  ) t;

  select jsonb_build_object(
    'reviews_total', count(*),
    'reviews_pending', count(*) filter (where status = 'pending'),
    'reviews_published', count(*) filter (where status = 'approved'),
    'rating_average', coalesce(round(avg(rating) filter (where status = 'approved')::numeric, 1), 0)
  ) into v_reviews
  from public.reviews;

  return v_orders || v_reviews || jsonb_build_object('popular', v_popular);
end;
$$;
