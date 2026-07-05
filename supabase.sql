-- =====================================================================
-- QOZON — Supabase to'liq SQL sxema fayli
-- =====================================================================
-- Bu faylni Supabase Dashboard → SQL Editor ga to'liq nusxalab, "Run"
-- tugmasini bosing. Fayl mumkin qadar xavfsiz (idempotent) yozilgan —
-- "if not exists" / "on conflict" qo'llanilgan, shuning uchun uni
-- mavjud loyihada qayta ishga tushirish odatda xatolik bermaydi.
--
-- Tarkib:
--   1. profiles              — mavjud, kod ishlatadi
--   2. chefs                 — mavjud, kod ishlatadi
--   3. foods                 — mavjud, kod ishlatadi
--   4. orders                — mavjud (chefDashboard.html da yozilgan edi), kod ishlatadi
--   5. favorite_foods        — YANGI (hozir faqat localStorage'da: qz_favorites)
--   6. favorite_chefs        — YANGI (hozir faqat localStorage'da: qz_fav_chefs)
--   7. reviews                — YANGI (hozir faqat localStorage/hardcoded: sharh/reyting)
--   8. notifications         — YANGI (bildirishnoma.html hozircha soxta/statik)
--   9. conversations + chat_messages — YANGI (chat.js hozircha faqat xotirada)
--  10. promo_codes + promo_code_redemptions — YANGI (3 xil, mos kelmaydigan hardcoded ro'yxat o'rniga)
--  11. Storage bucket tavsiyalari (avatarlar/taom rasmlari hozir baza64 sifatida jadvalga yozilmoqda)
--
-- MUHIM ESLATMA (xavfsizlik): "orders" jadvaliga checkout.js/buyutma.js/
-- orderTracking.js kabi fayllar HAR DOIM anon (public) kalit bilan,
-- foydalanuvchi tizimga kirganligidan qat'iy nazar, to'g'ridan-to'g'ri
-- fetch(...) orqali yozadi/o'qiydi (auth.uid() ishlatilmaydi). Shu bois
-- "orders" jadvali uchun RLS qat'iylashtirilmagan (hammaga ochiq),
-- aks holda buyurtma qilish/kuzatish funksiyalari ishlamay qoladi.
-- Kelajakda checkout/tracking sahifalarini supabaseClient (auth session)
-- orqali ishlashga o'tkazsangiz, pastdagi izohlangan qat'iyroq
-- policy variantlariga o'tishingiz mumkin.
-- =====================================================================

begin;

create extension if not exists "pgcrypto";

-- umumiy: updated_at ustunini avtomatik yangilab turuvchi funksiya
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- =====================================================================
-- 1. PROFILES — har bir auth foydalanuvchi (mijoz yoki oshpaz) profili
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'mijoz' check (role in ('mijoz', 'oshpaz')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- "profiles" jadvali loyihada allaqachon mavjud bo'lgani uchun yuqoridagi
-- "create table if not exists" bu holda hech narsa qilmaydi (Postgres
-- mavjud jadvalga ustun qo'shib bermaydi). Shu sabab har bir ustunni
-- alohida, xavfsiz tarzda qo'shamiz — mavjud bo'lsa hech narsa
-- o'zgarmaydi, yo'q bo'lsa qo'shiladi:
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role text not null default 'mijoz';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Eslatma: role uchun qat'iy CHECK cheklovi ataylab QO'YILMADI — kod
-- ichida ba'zi joylarda eski/vaqtinchalik 'user' qiymati bilan solishtirish
-- uchraydi (masalan kirish.js), demak jadvalda 'mijoz'/'oshpaz'dan boshqa
-- qiymatli qatorlar bo'lishi mumkin. Qat'iy CHECK qo'ysak, shunday qator
-- mavjud bo'lganda butun skript yana xato berib to'xtab qolardi.

comment on table public.profiles is 'Har bir foydalanuvchi (mijoz yoki oshpaz) uchun profil maʼlumotlari';

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Ro'yxatdan o'tishda (auth.users) avtomatik profil qatori yaratish.
-- kirish.js/royhat.js hozir buni qo'lda (JS orqali) qilishga harakat
-- qiladi — bu trigger uni ishonchliroq, serverga bog'liq holga keltiradi
-- (client kodi shunchaki keyinroq shu qatorni yangilaydi, xato bo'lmaydi).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'mijoz')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =====================================================================
-- 2. CHEFS — ovqat tayyorlovchi oshpazlar (menyu egalari)
-- =====================================================================
create table if not exists public.chefs (
  id integer generated always as identity primary key,
  user_id uuid unique references public.profiles(id) on delete set null,
  full_name text not null,
  avatar_url text,
  location text,
  address text,
  bio text,
  speciality text,
  meal_count integer not null default 0,
  rating_score numeric(2,1) not null default 5.0 check (rating_score between 0 and 5),
  phone text,
  online boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- "chefs" jadvali loyihada allaqachon mavjud bo'lgani uchun (yuqoridagi
-- "create table if not exists" bu holda hech narsa qilmaydi) — har bir
-- yangi ustunni alohida, xavfsiz tarzda qo'shamiz:
alter table public.chefs add column if not exists user_id uuid;
alter table public.chefs add column if not exists full_name text not null default 'Oshpaz';
alter table public.chefs add column if not exists avatar_url text;
alter table public.chefs add column if not exists location text;
alter table public.chefs add column if not exists address text;
alter table public.chefs add column if not exists bio text;
alter table public.chefs add column if not exists speciality text;
alter table public.chefs add column if not exists meal_count integer not null default 0;
alter table public.chefs add column if not exists rating_score numeric(2,1) not null default 5.0;
alter table public.chefs add column if not exists phone text;
alter table public.chefs add column if not exists online boolean not null default false;
alter table public.chefs add column if not exists is_verified boolean not null default false;
alter table public.chefs add column if not exists created_at timestamptz not null default now();
alter table public.chefs add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table public.chefs add constraint chefs_user_id_key unique (user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.chefs
    add constraint chefs_user_id_fkey foreign key (user_id) references public.profiles(id) on delete set null not valid;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.chefs add constraint chefs_rating_score_check check (rating_score between 0 and 5) not valid;
exception when duplicate_object then null;
end $$;

comment on table public.chefs is 'Oshpazlar (menyu egalari) — profillar bilan user_id orqali bog''langan';

create index if not exists idx_chefs_user_id on public.chefs(user_id);
create index if not exists idx_chefs_full_name on public.chefs(full_name);

alter table public.chefs enable row level security;

drop policy if exists "chefs_select_all" on public.chefs;
create policy "chefs_select_all" on public.chefs for select using (true);

drop policy if exists "chefs_insert_own" on public.chefs;
create policy "chefs_insert_own" on public.chefs for insert with check (auth.uid() = user_id);

drop policy if exists "chefs_update_own" on public.chefs;
create policy "chefs_update_own" on public.chefs for update using (auth.uid() = user_id);

drop policy if exists "chefs_delete_own" on public.chefs;
create policy "chefs_delete_own" on public.chefs for delete using (auth.uid() = user_id);

drop trigger if exists set_updated_at on public.chefs;
create trigger set_updated_at before update on public.chefs
  for each row execute function public.set_updated_at();

-- profil "oshpaz" rolida yaratilsa/yangilansa — avtomatik chefs qatorini
-- ham yaratib/yangilab qo'yadi. Hozir buni hech kim qilmaydi (tekshiruv
-- natijasida topilgan kamchilik): oshpaz ro'yxatdan o'tsa ham, chefs
-- jadvalida qatori bo'lmagani uchun uning menyusi hech qayerda
-- ko'rinmas edi.
create or replace function public.handle_chef_profile()
returns trigger as $$
begin
  if new.role = 'oshpaz' then
    insert into public.chefs (user_id, full_name, avatar_url, phone)
    values (new.id, coalesce(nullif(new.full_name, ''), 'Oshpaz'), new.avatar_url, new.phone)
    on conflict (user_id) do update
      set full_name = coalesce(nullif(excluded.full_name, ''), public.chefs.full_name),
          avatar_url = coalesce(excluded.avatar_url, public.chefs.avatar_url),
          phone = coalesce(excluded.phone, public.chefs.phone);
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  after insert or update of role, full_name, phone, avatar_url on public.profiles
  for each row execute function public.handle_chef_profile();


-- =====================================================================
-- 3. FOODS — oshpazlar menyusidagi taomlar
-- =====================================================================
create table if not exists public.foods (
  id integer generated always as identity primary key,
  chef_id integer references public.chefs(id) on delete cascade,
  chef_name text not null,
  name text not null,
  category text,
  price integer not null default 0,
  image_url text,
  portions_left integer not null default 0,
  rating_score numeric(2,1) not null default 5.0 check (rating_score between 0 and 5),
  reviews_count integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- "foods" jadvali loyihada allaqachon mavjud bo'lgani uchun (yuqoridagi
-- "create table if not exists" bu holda hech narsa qilmaydi) — har bir
-- yangi ustunni alohida, xavfsiz tarzda qo'shamiz:
alter table public.foods add column if not exists chef_id integer;
alter table public.foods add column if not exists chef_name text not null default 'Oshpaz';
alter table public.foods add column if not exists name text not null default 'Taom';
alter table public.foods add column if not exists category text;
alter table public.foods add column if not exists price integer not null default 0;
alter table public.foods add column if not exists image_url text;
alter table public.foods add column if not exists portions_left integer not null default 0;
alter table public.foods add column if not exists rating_score numeric(2,1) not null default 5.0;
alter table public.foods add column if not exists reviews_count integer not null default 0;
alter table public.foods add column if not exists is_available boolean not null default true;
alter table public.foods add column if not exists created_at timestamptz not null default now();
alter table public.foods add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table public.foods
    add constraint foods_chef_id_fkey foreign key (chef_id) references public.chefs(id) on delete cascade not valid;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.foods add constraint foods_rating_score_check check (rating_score between 0 and 5) not valid;
exception when duplicate_object then null;
end $$;

comment on table public.foods is 'Oshpazlar menyusidagi taomlar (chef_name matn ko''rinishida ham saqlanadi — kod shu bo''yicha qidiradi)';

create index if not exists idx_foods_chef_name on public.foods(chef_name);
create index if not exists idx_foods_category on public.foods(category);
create index if not exists idx_foods_chef_id on public.foods(chef_id);

alter table public.foods enable row level security;

drop policy if exists "foods_select_all" on public.foods;
create policy "foods_select_all" on public.foods for select using (true);

drop policy if exists "foods_insert_own_chef" on public.foods;
create policy "foods_insert_own_chef" on public.foods
  for insert with check (
    chef_id is null or chef_id in (select id from public.chefs where user_id = auth.uid())
  );

drop policy if exists "foods_update_own_chef" on public.foods;
create policy "foods_update_own_chef" on public.foods
  for update using (
    chef_id in (select id from public.chefs where user_id = auth.uid())
  );

drop policy if exists "foods_delete_own_chef" on public.foods;
create policy "foods_delete_own_chef" on public.foods
  for delete using (
    chef_id in (select id from public.chefs where user_id = auth.uid())
  );

drop trigger if exists set_updated_at on public.foods;
create trigger set_updated_at before update on public.foods
  for each row execute function public.set_updated_at();


-- =====================================================================
-- 4. ORDERS — buyurtmalar (chefDashboard.html'dagi asl sxema bilan mos)
-- =====================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text,
  customer_name text default 'Mehmon',
  customer_phone text,
  food_id integer,
  food_name text,
  food_image text,
  chef_name text,
  quantity integer default 1,
  price integer default 0,
  total_price integer default 0,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- "orders" jadvali loyihada allaqachon mavjud bo'lgani uchun (yuqoridagi
-- "create table if not exists" bu holda hech narsa qilmaydi) — chefDashboard.html
-- ichidagi asl SQL aslida hech qachon ishga tushirilmagan bo'lishi mumkin,
-- shuning uchun har bir ustunni alohida, xavfsiz tarzda qo'shamiz:
alter table public.orders add column if not exists order_number text;
alter table public.orders add column if not exists customer_name text default 'Mehmon';
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists food_id integer;
alter table public.orders add column if not exists food_name text;
alter table public.orders add column if not exists food_image text;
alter table public.orders add column if not exists chef_name text;
alter table public.orders add column if not exists quantity integer default 1;
alter table public.orders add column if not exists price integer default 0;
alter table public.orders add column if not exists total_price integer default 0;
alter table public.orders add column if not exists status text default 'pending';
alter table public.orders add column if not exists created_at timestamptz default now();
alter table public.orders add column if not exists updated_at timestamptz default now();

-- Kod insert paytida yuboradigan, lekin asl jadvalda bo'lmagan ustun
-- (checkout.js, buyutma.js, bildirishnoma.js barchasi 'notes' yozadi —
-- bu ustun bo'lmasa yozuv jimgina saqlanmasligi/xato berishi mumkin edi):
alter table public.orders add column if not exists notes text;

-- Kelajakda foydalanuvchi/oshpazga to'g'ri bog'lash uchun (hozir kod
-- bularni to'ldirmaydi, shuning uchun ular NULL bo'lishi mumkin —
-- bu amaldagi ishlashga ta'sir qilmaydi):
alter table public.orders add column if not exists customer_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists chef_id integer references public.chefs(id) on delete set null;

do $$ begin
  alter table public.orders
    add constraint orders_food_id_fkey foreign key (food_id) references public.foods(id) on delete set null not valid;
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.orders
    add constraint orders_status_check check (status in ('pending','accepted','preparing','ready','picked_up','delivered','cancelled')) not valid;
exception when duplicate_object then null;
end $$;

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_chef_name on public.orders(chef_name);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

alter table public.orders enable row level security;

-- DIQQAT: checkout/tracking/chefDashboard hozir anon kalit bilan
-- to'g'ridan-to'g'ri fetch qiladi (auth.uid() mavjud emas), shuning
-- uchun policy hammaga ochiq qoldirilgan — aks holda buyurtma berish
-- va kuzatish sahifalari ishlamay qoladi.
drop policy if exists "allow_all" on public.orders;
create policy "allow_all" on public.orders for all using (true) with check (true);

-- --- Kelajak uchun (client kod authenticated supabaseClient orqali
-- ishlaydigan bo'lsa) qat'iyroq muqobil, hozircha o'chirilgan:
-- drop policy "allow_all" on public.orders;
-- create policy "orders_customer_select" on public.orders for select using (auth.uid() = customer_id or chef_id in (select id from public.chefs where user_id = auth.uid()));
-- create policy "orders_customer_insert" on public.orders for insert with check (auth.uid() = customer_id or customer_id is null);
-- create policy "orders_chef_update" on public.orders for update using (chef_id in (select id from public.chefs where user_id = auth.uid()));

drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;


-- =====================================================================
-- 5. FAVORITE_FOODS — sevimli taomlar (hozir localStorage: qz_favorites)
-- =====================================================================
create table if not exists public.favorite_foods (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id integer not null references public.foods(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, food_id)
);

create index if not exists idx_favorite_foods_user on public.favorite_foods(user_id);

alter table public.favorite_foods enable row level security;

drop policy if exists "favorite_foods_owner_all" on public.favorite_foods;
create policy "favorite_foods_owner_all" on public.favorite_foods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- =====================================================================
-- 6. FAVORITE_CHEFS — sevimli oshpazlar (hozir localStorage: qz_fav_chefs)
-- =====================================================================
create table if not exists public.favorite_chefs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  chef_id integer not null references public.chefs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, chef_id)
);

create index if not exists idx_favorite_chefs_user on public.favorite_chefs(user_id);

alter table public.favorite_chefs enable row level security;

drop policy if exists "favorite_chefs_owner_all" on public.favorite_chefs;
create policy "favorite_chefs_owner_all" on public.favorite_chefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- =====================================================================
-- 7. REVIEWS — taom/oshpaz uchun sharh + reyting
--    (hozir kirish.js "tn_cmts", buyurtmatarixi.js "mk_reviews",
--     rating.html kabi bir necha mos kelmaydigan, saqlanmaydigan
--     variantlar mavjud — bittasiga birlashtirildi)
-- =====================================================================
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id integer references public.foods(id) on delete cascade,
  chef_id integer references public.chefs(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  photo_url text,
  created_at timestamptz not null default now(),
  constraint reviews_target_check check (food_id is not null or chef_id is not null)
);

create index if not exists idx_reviews_food on public.reviews(food_id);
create index if not exists idx_reviews_chef on public.reviews(chef_id);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = user_id);

-- Sharh qo'shilsa/o'zgarsa/o'chirilsa — taom yoki oshpazning
-- rating_score (va reviews_count) ustunini avtomatik qayta hisoblaydi.
create or replace function public.refresh_rating()
returns trigger as $$
declare
  target_food_id integer := coalesce(new.food_id, old.food_id);
  target_chef_id integer := coalesce(new.chef_id, old.chef_id);
begin
  if target_food_id is not null then
    update public.foods
      set rating_score = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where food_id = target_food_id), 5.0),
          reviews_count = (select count(*) from public.reviews where food_id = target_food_id)
      where id = target_food_id;
  end if;
  if target_chef_id is not null then
    update public.chefs
      set rating_score = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where chef_id = target_chef_id), 5.0)
      where id = target_chef_id;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_rating();


-- =====================================================================
-- 8. NOTIFICATIONS — bildirishnomalar
--    (bildirishnoma.html hozir statik "3 ta buyurtma" degan qattiq
--     kodlangan matn ko'rsatadi, hech narsa saqlanmaydi)
-- =====================================================================
create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'info' check (type in ('info','order','promo','system')),
  order_id uuid references public.orders(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, is_read);

alter table public.notifications enable row level security;

drop policy if exists "notifications_owner_select" on public.notifications;
create policy "notifications_owner_select" on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "notifications_owner_update" on public.notifications;
create policy "notifications_owner_update" on public.notifications for update using (auth.uid() = user_id);

drop policy if exists "notifications_owner_delete" on public.notifications;
create policy "notifications_owner_delete" on public.notifications for delete using (auth.uid() = user_id);

do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;

-- Buyurtma holati o'zgarganda mijozga avtomatik bildirishnoma yaratadi.
-- Eslatma: bu faqat orders.customer_id to'ldirilgan buyurtmalar uchun
-- ishlaydi (yuqoridagi "4. ORDERS" bo'limidagi eslatmaga qarang).
create or replace function public.notify_order_status_change()
returns trigger as $$
begin
  if new.status is distinct from old.status and new.customer_id is not null then
    insert into public.notifications (user_id, title, body, type, order_id)
    values (
      new.customer_id,
      'Buyurtma holati yangilandi',
      'Buyurtmangiz #' || coalesce(new.order_number, new.id::text) || ' holati: ' || new.status,
      'order',
      new.id
    );
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_order_status_change on public.orders;
create trigger on_order_status_change
  after update on public.orders
  for each row execute function public.notify_order_status_change();


-- =====================================================================
-- 9. CONVERSATIONS + CHAT_MESSAGES — mijoz <-> oshpaz chat
--    (chat.js hozir hammasini xotirada (mockDatabase) saqlaydi,
--     sahifa yangilansa butun yozishma yo'qoladi)
-- =====================================================================
create table if not exists public.conversations (
  id bigint generated always as identity primary key,
  customer_id uuid not null references auth.users(id) on delete cascade,
  chef_id integer not null references public.chefs(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);

do $$ begin
  alter table public.conversations
    add constraint conversations_unique_pair unique (customer_id, chef_id, order_id);
exception when duplicate_object then null;
end $$;

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  conversation_id bigint not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message text,
  image_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_conversation on public.chat_messages(conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "conversations_participant_select" on public.conversations;
create policy "conversations_participant_select" on public.conversations
  for select using (
    auth.uid() = customer_id
    or auth.uid() in (select user_id from public.chefs where id = chef_id)
  );

drop policy if exists "conversations_participant_insert" on public.conversations;
create policy "conversations_participant_insert" on public.conversations
  for insert with check (
    auth.uid() = customer_id
    or auth.uid() in (select user_id from public.chefs where id = chef_id)
  );

drop policy if exists "chat_messages_participant_select" on public.chat_messages;
create policy "chat_messages_participant_select" on public.chat_messages
  for select using (
    conversation_id in (
      select id from public.conversations
      where customer_id = auth.uid()
         or chef_id in (select id from public.chefs where user_id = auth.uid())
    )
  );

drop policy if exists "chat_messages_participant_insert" on public.chat_messages;
create policy "chat_messages_participant_insert" on public.chat_messages
  for insert with check (
    sender_id = auth.uid()
    and conversation_id in (
      select id from public.conversations
      where customer_id = auth.uid()
         or chef_id in (select id from public.chefs where user_id = auth.uid())
    )
  );

do $$ begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null;
end $$;


-- =====================================================================
-- 10. PROMO_CODES + PROMO_CODE_REDEMPTIONS — aksiya/chegirma kodlari
--     (hozir promoChegirma.js, buyutma.js, bildirishnoma.js ichida
--      3 xil, bir-biriga mos kelmaydigan hardcoded ro'yxat mavjud)
-- =====================================================================
create table if not exists public.promo_codes (
  id bigint generated always as identity primary key,
  code text not null unique,
  discount_type text not null default 'percent' check (discount_type in ('percent','fixed')),
  discount_value numeric not null check (discount_value > 0),
  min_order_amount integer not null default 0,
  max_uses integer,
  used_count integer not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;

drop policy if exists "promo_codes_select_active" on public.promo_codes;
create policy "promo_codes_select_active" on public.promo_codes
  for select using (is_active = true and (valid_until is null or valid_until > now()));

create table if not exists public.promo_code_redemptions (
  id bigint generated always as identity primary key,
  promo_code_id bigint not null references public.promo_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  redeemed_at timestamptz not null default now(),
  unique (promo_code_id, user_id, order_id)
);

alter table public.promo_code_redemptions enable row level security;

drop policy if exists "promo_redemptions_owner_select" on public.promo_code_redemptions;
create policy "promo_redemptions_owner_select" on public.promo_code_redemptions
  for select using (auth.uid() = user_id);

drop policy if exists "promo_redemptions_owner_insert" on public.promo_code_redemptions;
create policy "promo_redemptions_owner_insert" on public.promo_code_redemptions
  for insert with check (auth.uid() = user_id);

-- Ilovada hozir kod ichida qattiq yozilgan promo kodlar — shu yerga
-- ham namuna sifatida joylashtirildi (xohlasangiz o'zgartiring):
insert into public.promo_codes (code, discount_type, discount_value, min_order_amount)
values
  ('BIRINCHI10', 'percent', 10, 0),
  ('QOZON20', 'percent', 20, 50000),
  ('FAMILYTIME', 'percent', 15, 0),
  ('BEPUL', 'fixed', 15000, 100000)
on conflict (code) do nothing;


-- =====================================================================
-- 11. STORAGE BUCKETS (tavsiya, ixtiyoriy)
-- =====================================================================
-- Hozir profil rasmi (profil.js) va boshqa rasmlar to'g'ridan-to'g'ri
-- baza64 satr sifatida jadval ustuniga (profiles.avatar_url) yozilmoqda.
-- Bu jadvalni keraksiz katta va sekin qiladi. Tavsiya: quyidagi
-- bucket'lardan foydalanib, faqat fayl URL manzilini saqlang.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('food-images', 'food-images', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "food_images_public_read" on storage.objects;
create policy "food_images_public_read" on storage.objects
  for select using (bucket_id = 'food-images');

drop policy if exists "food_images_chef_write" on storage.objects;
create policy "food_images_chef_write" on storage.objects
  for insert with check (bucket_id = 'food-images' and auth.role() = 'authenticated');

commit;

-- =====================================================================
-- TUGADI. Fayl oxiri.
-- =====================================================================
