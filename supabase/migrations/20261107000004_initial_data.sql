-- =============================================================
-- Начальные данные: заведение и категории меню.
-- Товары НЕ добавляются здесь: их нужно перенести из фотографии
-- настоящего меню (см. supabase/seed.sql и README).
-- =============================================================

insert into public.store_settings (id, name, phone, address, address_note, postal_code,
                                   hours_text, open_time, close_time, combos_enabled)
values (1, 'Твой Донер', '+7 (966) 266-46-82',
        'Москва, проспект Маршала Жукова, 14, корп. 1', 'Первый этаж', '123308',
        'Ежедневно с 10:00 до 23:00', '10:00', '23:00', false)
on conflict (id) do nothing;

insert into public.categories (slug, name, sort_order, is_active) values
  ('shawarma', 'Шаурма',       10, true),
  ('extras',   'Добавки',      20, true),
  ('sides',    'Гарниры',      30, true),
  ('bakery',   'Выпечка',      40, true),
  ('drinks',   'Напитки',      50, true),
  ('combo',    'Комбо-наборы', 60, false)  -- включить после согласования с владельцем
on conflict (slug) do nothing;
