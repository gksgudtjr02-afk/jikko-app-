create table if not exists partners (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table partners enable row level security;

create policy "Partners can view own profile"
  on partners for select
  using (auth.uid() = id);

create policy "Partners can insert own profile"
  on partners for insert
  with check (auth.uid() = id);

create policy "Partners can update own profile"
  on partners for update
  using (auth.uid() = id);
