create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text unique,
  password_hash text not null,
  salt text not null,
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.pending_signups (
  id uuid primary key,
  name text not null,
  email text not null,
  phone text,
  password_hash text not null,
  salt text not null,
  email_otp_hash text not null,
  phone_otp_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_sessions (
  token text primary key,
  user_id uuid not null references public.customers(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  salt text not null,
  role text not null default 'owner',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.admin_sessions (
  token text primary key,
  admin_user_id uuid not null references public.admin_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.carts (
  user_id uuid primary key references public.customers(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  user_id uuid not null references public.customers(id) on delete cascade,
  amount integer not null,
  subtotal_amount integer,
  discount_amount integer not null default 0,
  coupon_code text,
  currency text not null default 'INR',
  items jsonb not null default '[]'::jsonb,
  status text not null default 'order_placed',
  payment_status text not null default 'pending',
  payment_method text not null default 'cod',
  customer_name text,
  customer_phone text,
  shipping_address text,
  pin_code text,
  payment_id text,
  razorpay_order_id text,
  tracking_number text,
  estimated_delivery date,
  status_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null default 'customized_gifts',
  tag text not null default 'New',
  description text not null default '',
  image_url text,
  price integer not null default 0,
  old_price integer,
  rating numeric not null default 4.8,
  delivery text not null default 'Ships in 4-6 days',
  stock_quantity integer not null default 0,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null
);

create table if not exists public.integration_settings (
  key text primary key,
  provider text not null,
  enabled boolean not null default false,
  public_config jsonb not null default '{}'::jsonb,
  encrypted_secrets jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.pending_signups enable row level security;
alter table public.customer_sessions enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.carts enable row level security;
alter table public.orders enable row level security;
alter table public.products enable row level security;
alter table public.inbox_messages enable row level security;
alter table public.rate_limits enable row level security;
alter table public.integration_settings enable row level security;

alter table public.customers
  alter column phone drop not null;

alter table public.pending_signups
  alter column phone drop not null;

alter table public.orders
  add column if not exists subtotal_amount integer,
  add column if not exists discount_amount integer not null default 0,
  add column if not exists coupon_code text,
  add column if not exists payment_method text not null default 'cod',
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists shipping_address text,
  add column if not exists pin_code text,
  add column if not exists razorpay_order_id text;

update public.products
set category = case
  when lower(category) = 'women' then 'women'
  when lower(category) = 'men' then 'men'
  else 'customized_gifts'
end
where category not in ('women', 'men', 'customized_gifts');

alter table public.products
  drop constraint if exists products_category_check;

alter table public.products
  add constraint products_category_check check (category in ('women', 'men', 'customized_gifts'));

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists pending_signups_expires_idx on public.pending_signups(expires_at);
create index if not exists admin_users_role_active_idx on public.admin_users(role, is_active);
create index if not exists admin_sessions_expires_idx on public.admin_sessions(expires_at);
create index if not exists products_available_sort_idx on public.products(is_available, sort_order, name);
create index if not exists products_category_available_idx on public.products(category, is_available, sort_order, name);
create index if not exists inbox_messages_created_idx on public.inbox_messages(created_at desc);
create index if not exists inbox_messages_read_idx on public.inbox_messages(is_read, created_at desc);
create index if not exists rate_limits_reset_idx on public.rate_limits(reset_at);
create index if not exists integration_settings_updated_idx on public.integration_settings(updated_at desc);

insert into public.products (
  id,
  name,
  category,
  tag,
  description,
  image_url,
  price,
  old_price,
  rating,
  delivery,
  stock_quantity,
  is_available,
  is_featured,
  sort_order
) values
  ('bracelet', 'Stylish Bracelet', 'women', 'New', 'A trendy bracelet designed to elevate your everyday look with elegance and charm.', 'https://via.placeholder.com/300?text=Bracelet', 5000, 6000, 4.8, '', 25, true, true, 10),
  ('couple-watches', 'Premium Couple Watches', 'customized_gifts', 'Couple', 'A perfect matching watch set for couples, symbolizing love and timeless bonding.', 'https://via.placeholder.com/300?text=Couple+Watches', 5000, 6000, 4.8, '', 25, true, true, 20),
  ('couple-bracelets', 'Couple Bracelets Set', 'customized_gifts', 'Couple', 'Beautiful matching bracelets crafted for couples to celebrate their connection.', 'https://via.placeholder.com/300?text=Couple+Bracelets', 5000, 6000, 4.8, '', 25, true, true, 30),
  ('women-watch', 'Elegant Women Watch', 'women', 'Elegant', 'A stylish and modern watch designed for women who love sophistication.', 'https://via.placeholder.com/300?text=Women+Watch', 5000, 6000, 4.8, '', 25, true, true, 40),
  ('men-watch', 'Classic Men Watch', 'men', 'Classic', 'A bold and classy watch built for men who appreciate timeless fashion.', 'https://via.placeholder.com/300?text=Men+Watch', 5000, 6000, 4.8, '', 25, true, true, 50),
  ('small-bouquet', 'Small Flower Bouquet', 'customized_gifts', 'Bouquet', 'A cute bouquet arrangement perfect for small surprises and sweet moments.', 'https://via.placeholder.com/300?text=Small+Bouquet', 5000, 6000, 4.8, '', 25, true, false, 60),
  ('large-bouquet', 'Grand Flower Bouquet', 'customized_gifts', 'Bouquet', 'A luxurious bouquet designed to make every occasion extra special.', 'https://via.placeholder.com/300?text=Large+Bouquet', 5000, 6000, 4.8, '', 25, true, false, 70),
  ('small-hamper', 'Small Gift Hamper', 'customized_gifts', 'Hamper', 'A compact hamper filled with delightful surprises for your loved ones.', 'https://via.placeholder.com/300?text=Small+Hamper', 5000, 6000, 4.8, '', 25, true, false, 80),
  ('large-hamper', 'Luxury Gift Hamper', 'customized_gifts', 'Hamper', 'A premium hamper packed with exclusive gifts to impress and delight.', 'https://via.placeholder.com/300?text=Large+Hamper', 5000, 6000, 4.8, '', 25, true, false, 90),
  ('magazine-gift', 'Customized Magazine Gift', 'customized_gifts', 'Custom', 'A unique magazine-style gift designed to capture memories creatively.', 'https://via.placeholder.com/300?text=Magazine+Gift', 5000, 6000, 4.8, '', 25, true, false, 100),
  ('women-couple-bracelet', 'Women Couple Bracelet', 'women', 'Couple', 'A stylish bracelet specially crafted for women in a couple set.', 'https://via.placeholder.com/300?text=Women+Bracelet', 5000, 6000, 4.8, '', 25, true, false, 110),
  ('men-couple-bracelet', 'Men Couple Bracelet', 'men', 'Couple', 'A bold and elegant bracelet designed for men in a couple set.', 'https://via.placeholder.com/300?text=Men+Bracelet', 5000, 6000, 4.8, '', 25, true, false, 120),
  ('women-couple-watches', 'Women Couple Watches', 'women', 'Couple', 'A beautifully designed watch set perfect for couples who love matching styles.', 'https://via.placeholder.com/300?text=Women+Couple+Watches', 5000, 6000, 4.8, '', 25, true, false, 130)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  tag = excluded.tag,
  description = excluded.description,
  image_url = excluded.image_url,
  price = excluded.price,
  old_price = excluded.old_price,
  rating = excluded.rating,
  delivery = excluded.delivery,
  stock_quantity = excluded.stock_quantity,
  is_available = excluded.is_available,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  updated_at = now();

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;
