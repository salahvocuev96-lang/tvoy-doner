-- =============================================================
-- Твой Донер — основная схема базы данных
-- =============================================================

-- ---------- Типы ----------
create type public.order_status as enum (
  'new',        -- Новый
  'accepted',   -- Принят
  'preparing',  -- Готовится
  'ready',      -- Готов к выдаче
  'completed',  -- Выполнен
  'cancelled'   -- Отменён
);

create type public.payment_method as enum ('cash', 'card');

create type public.review_status as enum ('pending', 'approved', 'rejected', 'hidden');

create type public.notify_status as enum ('pending', 'sent', 'failed', 'disabled');

-- ---------- Общий триггер updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================
-- profiles: роли пользователей (admin / user)
-- =============================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text check (char_length(full_name) <= 120),
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Автоматически создаём профиль для каждого нового пользователя Auth (роль user).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Проверка роли администратора. security definer — чтобы не было рекурсии RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- =============================================================
-- store_settings: данные заведения (одна строка)
-- =============================================================
create table public.store_settings (
  id                int primary key default 1 check (id = 1),
  name              text not null check (char_length(name) between 1 and 80),
  phone             text not null check (char_length(phone) between 5 and 40),
  address           text not null check (char_length(address) between 5 and 200),
  address_note      text check (char_length(address_note) <= 200),
  postal_code       text check (char_length(postal_code) <= 12),
  hours_text        text not null check (char_length(hours_text) between 1 and 120),
  open_time         time not null default '10:00',
  close_time        time not null default '23:00',
  ordering_enabled  boolean not null default true,
  combos_enabled    boolean not null default false,
  updated_at        timestamptz not null default now()
);

create trigger store_settings_updated_at before update on public.store_settings
  for each row execute function public.set_updated_at();

-- =============================================================
-- Каталог
-- =============================================================
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  name        text not null check (char_length(name) between 1 and 60),
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  category_id         uuid not null references public.categories (id) on delete restrict,
  name                text not null check (char_length(name) between 1 and 100),
  description         text check (char_length(description) <= 600),
  weight              text check (char_length(weight) <= 30),       -- «300 г», «0,5 л»
  price               int  not null check (price between 0 and 100000), -- в рублях
  image_url           text check (char_length(image_url) <= 500),
  is_active           boolean not null default true,  -- показывать на сайте
  is_available        boolean not null default true,  -- есть в наличии
  is_featured         boolean not null default false, -- «Популярные блюда»
  needs_verification  boolean not null default false, -- данные нужно сверить с меню
  sort_order          int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index products_category_idx on public.products (category_id, sort_order);
create index products_featured_idx on public.products (is_featured) where is_featured;

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- Дополнительные ингредиенты конкретного товара
create table public.product_options (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  price       int  not null default 0 check (price between 0 and 10000),
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index product_options_product_idx on public.product_options (product_id, sort_order);

-- =============================================================
-- Заказы
-- =============================================================
create sequence public.order_number_seq start with 1001;

create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique default ('TD-' || nextval('public.order_number_seq')),
  idempotency_key    uuid not null unique,
  customer_name      text not null check (char_length(customer_name) between 2 and 60),
  customer_phone     text not null check (customer_phone ~ '^\+7\d{10}$'),
  comment            text check (char_length(comment) <= 500),
  fulfillment        text not null default 'pickup' check (fulfillment = 'pickup'),
  payment_method     public.payment_method not null,
  status             public.order_status not null default 'new',
  is_paid            boolean not null default false,
  total              int not null check (total >= 0),
  notify_status      public.notify_status not null default 'pending',
  notify_attempts    int not null default 0,
  notify_error       text,
  notified_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter sequence public.order_number_seq owned by public.orders.order_number;

create index orders_created_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);
create index orders_notify_idx on public.orders (notify_status) where notify_status <> 'sent';

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders (id) on delete cascade,
  product_id     uuid references public.products (id) on delete set null,
  product_name   text not null,          -- снимок названия на момент заказа
  unit_price     int not null check (unit_price >= 0),
  options        jsonb not null default '[]'::jsonb, -- [{id,name,price}]
  options_price  int not null default 0 check (options_price >= 0),
  quantity       int not null check (quantity between 1 and 50),
  line_total     int not null check (line_total >= 0)
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

create table public.order_status_history (
  id          bigint generated always as identity primary key,
  order_id    uuid not null references public.orders (id) on delete cascade,
  status      public.order_status not null,
  changed_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index order_status_history_order_idx on public.order_status_history (order_id, created_at);

-- Каждое изменение статуса пишется в историю. Выполненный заказ считается оплаченным
-- (оплата при получении), отменённый — неоплаченным.
create or replace function public.orders_before_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'completed' then
      new.is_paid = true;
    elsif new.status = 'cancelled' then
      new.is_paid = false;
    end if;
  end if;
  return new;
end;
$$;

create trigger orders_status_before before update of status on public.orders
  for each row execute function public.orders_before_status();

create or replace function public.orders_log_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;

create trigger orders_status_log after insert or update of status on public.orders
  for each row execute function public.orders_log_status();

-- =============================================================
-- Отзывы
-- =============================================================
create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  author_name   text not null check (char_length(author_name) between 2 and 60),
  rating        smallint not null check (rating between 1 and 5),
  body          text not null check (char_length(body) between 10 and 1000),
  status        public.review_status not null default 'pending',
  created_at    timestamptz not null default now(),
  published_at  timestamptz,
  moderated_at  timestamptz,
  moderated_by  uuid references auth.users (id) on delete set null
);

create index reviews_status_idx on public.reviews (status, published_at desc);

create or replace function public.reviews_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.moderated_at = now();
    new.moderated_by = (select auth.uid());
    if new.status = 'approved' and new.published_at is null then
      new.published_at = now();
    end if;
  end if;
  return new;
end;
$$;

create trigger reviews_before_update before update on public.reviews
  for each row execute function public.reviews_before_update();

-- =============================================================
-- Ограничение частоты запросов (только сервер)
-- =============================================================
create table public.rate_limits (
  id          bigint generated always as identity primary key,
  action      text not null,
  key_hash    text not null,
  created_at  timestamptz not null default now()
);

create index rate_limits_lookup_idx on public.rate_limits (action, key_hash, created_at desc);
