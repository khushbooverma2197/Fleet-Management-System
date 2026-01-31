create table vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text unique not null,
  allowed_passengers int not null,
  isAvailable boolean default true,
  driver_id uuid references users(id),
  created_at timestamp default now()
);