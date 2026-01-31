create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  role text check (role in ('customer', 'owner', 'driver')) not null,
  created_at timestamp default now()
);