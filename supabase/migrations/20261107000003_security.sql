-- =============================================================
-- Права доступа и Row Level Security
-- =============================================================

-- Начинаем с нуля: публичные роли не получают ничего по умолчанию.
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

-- Сервер (service_role) — полный доступ (ключ хранится только на сервере).
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- ---------- Публичное чтение ----------
grant select on public.categories, public.products, public.product_options, public.store_settings
  to anon, authenticated;
-- Отзывы: анонимам только безопасные столбцы
grant select (id, author_name, rating, body, status, published_at) on public.reviews to anon;
grant select on public.reviews to authenticated;

grant execute on function public.is_admin()       to anon, authenticated;
grant execute on function public.review_summary() to anon, authenticated;
grant execute on function public.admin_dashboard_stats() to authenticated;

-- ---------- Права администратора (дополнительно ограничены RLS) ----------
grant insert, update, delete on public.categories, public.products, public.product_options
  to authenticated;
grant update (name, phone, address, address_note, postal_code, hours_text, open_time, close_time,
              ordering_enabled, combos_enabled)
  on public.store_settings to authenticated;
grant select on public.orders, public.order_items, public.order_status_history, public.profiles
  to authenticated;
grant update (status, is_paid) on public.orders to authenticated;
grant update (status), delete on public.reviews to authenticated;

-- ---------- RLS ----------
alter table public.profiles             enable row level security;
alter table public.store_settings       enable row level security;
alter table public.categories           enable row level security;
alter table public.products             enable row level security;
alter table public.product_options      enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.order_status_history enable row level security;
alter table public.reviews              enable row level security;
alter table public.rate_limits          enable row level security; -- без политик: только сервер

-- profiles
create policy "profiles: own or admin read" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- store_settings
create policy "settings: public read" on public.store_settings
  for select to anon, authenticated using (true);
create policy "settings: admin update" on public.store_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- categories
create policy "categories: public read active" on public.categories
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "categories: admin insert" on public.categories
  for insert to authenticated with check ((select public.is_admin()));
create policy "categories: admin update" on public.categories
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "categories: admin delete" on public.categories
  for delete to authenticated using ((select public.is_admin()));

-- products
create policy "products: public read active" on public.products
  for select to anon, authenticated
  using (
    (is_active and exists (select 1 from public.categories c
                           where c.id = category_id and c.is_active))
    or (select public.is_admin())
  );
create policy "products: admin insert" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "products: admin update" on public.products
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "products: admin delete" on public.products
  for delete to authenticated using ((select public.is_admin()));

-- product_options
create policy "options: public read active" on public.product_options
  for select to anon, authenticated
  using (is_active or (select public.is_admin()));
create policy "options: admin insert" on public.product_options
  for insert to authenticated with check ((select public.is_admin()));
create policy "options: admin update" on public.product_options
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "options: admin delete" on public.product_options
  for delete to authenticated using ((select public.is_admin()));

-- orders (создание — только через сервер и create_order)
create policy "orders: admin read" on public.orders
  for select to authenticated using ((select public.is_admin()));
create policy "orders: admin update" on public.orders
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "order_items: admin read" on public.order_items
  for select to authenticated using ((select public.is_admin()));

create policy "order_history: admin read" on public.order_status_history
  for select to authenticated using ((select public.is_admin()));

-- reviews (создание — только через сервер, всегда со статусом pending)
create policy "reviews: public read approved" on public.reviews
  for select to anon, authenticated
  using (status = 'approved' or (select public.is_admin()));
create policy "reviews: admin update" on public.reviews
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "reviews: admin delete" on public.reviews
  for delete to authenticated using ((select public.is_admin()));

-- =============================================================
-- Хранилище фотографий товаров
-- =============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "product images: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product images: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "product images: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
