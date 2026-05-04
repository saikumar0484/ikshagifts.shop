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
  currency text not null default 'INR',
  items jsonb not null default '[]'::jsonb,
  status text not null default 'order_placed',
  payment_status text not null default 'pending',
  payment_id text,
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

update public.products
set category = case
  when lower(category) = 'men' then 'men'
  else 'customized_gifts'
end
where category not in ('men', 'customized_gifts');

alter table public.products
  drop constraint if exists products_category_check;

alter table public.products
  add constraint products_category_check check (category in ('men', 'customized_gifts'));

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
  ('forever-bouquet', 'Forever Bouquet', 'customized_gifts', 'Bestseller', 'Hand-crocheted blooms wrapped with ribbon, made to stay bright forever.', null, 1200, 1450, 4.9, 'Ships in 4-6 days', 8, true, true, 10),
  ('sweet-pea-bow', 'Sweet Pea Bow', 'customized_gifts', 'New', 'Soft pastel crochet bow for bags, clips, gifts, and everyday cozy looks.', null, 250, 320, 4.8, 'Ships in 2-3 days', 20, true, true, 20),
  ('pocket-pals', 'Pocket Pals', 'men', 'Cute', 'Tiny crochet bears, bunnies, and charms to clip onto bags and keys.', null, 350, null, 4.7, 'Ships in 3-5 days', 15, true, true, 30),
  ('blue-lily', 'Blue Lily Stem', 'men', 'Studio Pick', 'A bright blue crochet flower stem for shelves, desks, and gift bundles.', null, 420, null, 4.8, 'Ships in 5-7 days', 6, true, false, 40),
  ('bunny-charm', 'Bunny Charm', 'customized_gifts', 'Loved', 'A tiny bunny friend with soft details and a handmade ribbon finish.', null, 520, 650, 4.9, 'Ships in 5-7 days', 6, true, false, 50),
  ('sunny-stem', 'Sunny Stem', 'customized_gifts', 'Giftable', 'A sunflower crochet stem that brings a little warmth to any corner.', null, 480, null, 4.8, 'Ships in 4-6 days', 10, true, false, 60)
on conflict (id) do nothing;

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;
