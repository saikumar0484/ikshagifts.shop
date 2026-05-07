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

create table if not exists public.catalog_versions (
  key text primary key,
  reason text not null default 'manual',
  version uuid not null default gen_random_uuid(),
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

create table if not exists public.support_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null default 'support',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  wa_id text not null unique,
  customer_name text not null default 'WhatsApp customer',
  customer_phone text not null default '',
  status text not null default 'open' check (status in ('open', 'pending', 'resolved')),
  assigned_agent_id uuid references public.support_agents(id) on delete set null,
  unread_count integer not null default 0,
  last_message_preview text not null default '',
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  wa_message_id text unique,
  direction text not null check (direction in ('inbound', 'outbound')),
  message_type text not null default 'text',
  body text not null default '',
  template_name text,
  status text not null default 'received',
  raw_payload jsonb not null default '{}'::jsonb,
  sent_by_admin_id uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.support_notes (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations(id) on delete cascade,
  admin_user_id uuid references public.admin_users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.support_message_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  category text not null default 'support',
  body text not null,
  whatsapp_template_name text,
  language_code text not null default 'en_US',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.pending_signups enable row level security;
alter table public.customer_sessions enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.carts enable row level security;
alter table public.orders enable row level security;
alter table public.products enable row level security;
alter table public.catalog_versions enable row level security;
alter table public.inbox_messages enable row level security;
alter table public.rate_limits enable row level security;
alter table public.integration_settings enable row level security;
alter table public.support_agents enable row level security;
alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.support_notes enable row level security;
alter table public.support_message_templates enable row level security;

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

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_products_updated_at();

revoke execute on function public.set_products_updated_at() from public;

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists pending_signups_expires_idx on public.pending_signups(expires_at);
create index if not exists admin_users_role_active_idx on public.admin_users(role, is_active);
create index if not exists admin_sessions_expires_idx on public.admin_sessions(expires_at);
create index if not exists products_available_sort_idx on public.products(is_available, sort_order, name);
create index if not exists products_category_available_idx on public.products(category, is_available, sort_order, name);
create index if not exists catalog_versions_updated_idx on public.catalog_versions(updated_at desc);
create index if not exists inbox_messages_created_idx on public.inbox_messages(created_at desc);
create index if not exists inbox_messages_read_idx on public.inbox_messages(is_read, created_at desc);
create index if not exists rate_limits_reset_idx on public.rate_limits(reset_at);
create index if not exists integration_settings_updated_idx on public.integration_settings(updated_at desc);
create index if not exists support_agents_active_idx on public.support_agents(is_active, name);
create index if not exists whatsapp_conversations_last_idx on public.whatsapp_conversations(last_message_at desc);
create index if not exists whatsapp_conversations_status_idx on public.whatsapp_conversations(status, last_message_at desc);
create index if not exists whatsapp_conversations_agent_idx on public.whatsapp_conversations(assigned_agent_id, last_message_at desc);
create index if not exists whatsapp_messages_conversation_idx on public.whatsapp_messages(conversation_id, created_at asc);
create index if not exists whatsapp_messages_status_idx on public.whatsapp_messages(status, created_at desc);
create index if not exists support_notes_conversation_idx on public.support_notes(conversation_id, created_at desc);
create index if not exists support_message_templates_enabled_idx on public.support_message_templates(enabled, category, label);

drop policy if exists "Public can read catalog versions" on public.catalog_versions;
create policy "Public can read catalog versions"
  on public.catalog_versions
  for select
  to anon, authenticated
  using (true);

insert into public.catalog_versions (key, reason)
values ('products', 'initial')
on conflict (key) do nothing;

insert into public.support_agents (name, email, role)
values ('Owner', 'owner@ikshagifts.shop', 'owner')
on conflict (email) do nothing;

insert into public.support_message_templates (
  key,
  label,
  category,
  body,
  whatsapp_template_name,
  language_code
) values
  (
    'order_confirmation',
    'Order confirmation',
    'order',
    'Hi {{name}}, your iksha gifts order {{orderId}} has been received. We will share updates as your gift is prepared.',
    'order_confirmation',
    'en_US'
  ),
  (
    'shipping_update',
    'Shipping update',
    'shipping',
    'Hi {{name}}, your iksha gifts order {{orderId}} has been shipped. Tracking: {{trackingNumber}}.',
    'shipping_update',
    'en_US'
  ),
  (
    'delivery_notification',
    'Delivery notification',
    'delivery',
    'Hi {{name}}, your iksha gifts order {{orderId}} is out for delivery today.',
    'delivery_notification',
    'en_US'
  ),
  (
    'support_reply',
    'Support reply',
    'support',
    'Hi {{name}}, thanks for contacting iksha gifts. Our support team is checking this and will update you shortly.',
    'support_reply',
    'en_US'
  )
on conflict (key) do update set
  label = excluded.label,
  category = excluded.category,
  body = excluded.body,
  whatsapp_template_name = excluded.whatsapp_template_name,
  language_code = excluded.language_code,
  enabled = true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

do $$
begin
  alter publication supabase_realtime add table public.catalog_versions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

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
grant select on public.catalog_versions to anon, authenticated;
grant usage, select on all sequences in schema public to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;
