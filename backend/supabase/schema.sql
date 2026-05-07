-- Njangi-Sure Supabase schema for PostgreSQL

-- Enable extensions used by Supabase and UUID generation
create extension if not exists "pgcrypto";

-- Users table linked to auth.users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email citext not null unique,
  phone text unique,
  role text not null default 'member' check (role in ('admin', 'leader', 'member')),
  created_at timestamptz not null default now()
);

-- Njangi groups
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  leader_id uuid not null references public.users(id) on delete cascade,
  contribution_amount numeric(12,2) not null check (contribution_amount > 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'bi-weekly', 'monthly')),
  total_members int not null check (total_members > 0),
  start_date date not null,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamptz not null default now()
);

-- Membership table
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  payout_position int not null check (payout_position >= 0),
  joined_at timestamptz not null default now(),
  unique (user_id, group_id),
  unique (group_id, payout_position)
);

-- Contribution records
create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  commission_amount numeric(12,2) not null default 0 check (commission_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  payment_reference text unique,
  external_id text unique,
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Transaction ledger
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  amount numeric(12,2) not null,
  type text not null check (type in ('deposit', 'commission', 'payout', 'refund')),
  status text not null check (status in ('success', 'failed', 'pending')),
  reference text unique,
  note text,
  created_at timestamptz not null default now()
);

-- Group chat messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

-- User notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_groups_leader_id on public.groups (leader_id);
create index if not exists idx_groups_status on public.groups (status);
create index if not exists idx_members_user_id on public.members (user_id);
create index if not exists idx_members_group_id on public.members (group_id);
create index if not exists idx_contributions_user_id on public.contributions (user_id);
create index if not exists idx_contributions_group_id on public.contributions (group_id);
create index if not exists idx_contributions_status on public.contributions (status);
create index if not exists idx_transactions_user_id on public.transactions (user_id);
create index if not exists idx_transactions_group_id on public.transactions (group_id);
create index if not exists idx_transactions_type on public.transactions (type);
create index if not exists idx_transactions_status on public.transactions (status);
create index if not exists idx_messages_group_id on public.messages (group_id);
create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_notifications_is_read on public.notifications (is_read);

-- App activity logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null check (event_type in ('signup', 'login', 'logout', 'app_open', 'session', 'profile_update')),
  metadata text,
  duration_seconds int,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_user_id on public.activity_logs (user_id);
create index if not exists idx_activity_logs_event_type on public.activity_logs (event_type);
create index if not exists idx_activity_logs_created_at on public.activity_logs (created_at);

-- Auto-create user profile on auth signup
create or replace function public.create_user_profile() returns trigger as $$
begin
  insert into public.users (id, email, phone, role, created_at)
  values (new.id, new.email, new.phone, 'member', now())
  on conflict (id) do nothing;

  insert into public.activity_logs (user_id, event_type, metadata, created_at)
  values (new.id, 'signup', 'Account created', now())
  on conflict do nothing;

  return new;
end;
$$ language plpgsql security definer;

create trigger auth_user_created
  after insert on auth.users
  for each row execute function public.create_user_profile();

-- Enable row level security on all tables
alter table public.users enable row level security;
alter table public.groups enable row level security;
alter table public.members enable row level security;
alter table public.contributions enable row level security;
alter table public.transactions enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- Policies for users
create policy users_self_manage on public.users for select using (
  auth.uid() = id
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy users_self_update on public.users for update using (
  auth.uid() = id
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy users_profile_insert on public.users for insert with check (
  auth.uid() = id
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- Policies for groups
create policy groups_select_for_members on public.groups for select using (
  leader_id = auth.uid()
  or exists (select 1 from public.members m where m.group_id = public.groups.id and m.user_id = auth.uid())
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy groups_modify_by_leader on public.groups for update using (
  leader_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy groups_insert_by_leader on public.groups for insert with check (
  leader_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- Policies for members
create policy members_select_for_group on public.members for select using (
  user_id = auth.uid()
  or exists (select 1 from public.members m where m.group_id = public.members.group_id and m.user_id = auth.uid())
  or exists (select 1 from public.groups g where g.id = public.members.group_id and g.leader_id = auth.uid())
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy members_modify_own on public.members for update using (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy members_insert_by_leader on public.members for insert with check (
  exists (select 1 from public.groups g where g.id = new.group_id and g.leader_id = auth.uid())
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- Policies for contributions
create policy contributions_select_owner_or_leader on public.contributions for select using (
  user_id = auth.uid()
  or exists (select 1 from public.groups g where g.id = public.contributions.group_id and g.leader_id = auth.uid())
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy contributions_modify_owner_or_leader on public.contributions for update using (
  user_id = auth.uid()
  or exists (select 1 from public.groups g where g.id = public.contributions.group_id and g.leader_id = auth.uid())
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy contributions_insert_self on public.contributions for insert with check (
  user_id = auth.uid()
  or exists (select 1 from public.groups g where g.id = new.group_id and g.leader_id = auth.uid())
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- Policies for transactions
create policy transactions_select_owner_or_admin on public.transactions for select using (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy transactions_insert_owner_or_admin on public.transactions for insert with check (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy transactions_update_admin on public.transactions for update using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- Policies for messages
create policy messages_select_group on public.messages for select using (
  exists (select 1 from public.members m where m.group_id = public.messages.group_id and m.user_id = auth.uid())
  or exists (select 1 from public.groups g where g.id = public.messages.group_id and g.leader_id = auth.uid())
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy messages_insert_group_member on public.messages for insert with check (
  sender_id = auth.uid()
  and exists (select 1 from public.members m where m.group_id = new.group_id and m.user_id = auth.uid())
  or exists (select 1 from public.groups g where g.id = new.group_id and g.leader_id = auth.uid())
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- Policies for notifications
create policy notifications_select_owner on public.notifications for select using (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy notifications_insert_public on public.notifications for insert with check (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy notifications_update_owner on public.notifications for update using (
  user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- Policies for activity logs
create policy activity_logs_select_admin on public.activity_logs for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy activity_logs_insert_owner_or_admin on public.activity_logs for insert with check (
  new.user_id = auth.uid()
  or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);
create policy activity_logs_update_admin on public.activity_logs for update using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- Admin analytics views
create view if not exists public.admin_total_users as
select count(*) as total_users from public.users;

create view if not exists public.admin_total_groups as
select count(*) as total_groups from public.groups;

create view if not exists public.admin_total_transactions as
select count(*) as total_transactions from public.transactions;

create view if not exists public.admin_commission_revenue as
select coalesce(sum(amount), 0) as total_commission_revenue from public.transactions where type = 'commission' and status = 'success';

create view if not exists public.admin_monthly_user_growth as
select date_trunc('month', created_at) as month, count(*) as new_users
from public.users
group by 1
order by 1 desc;
