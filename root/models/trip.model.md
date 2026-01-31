create table trips(
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references users(id),
  vehicle_id uuid references vehicles(id),
  start_date date not null,
  end_date date,
  location text,
  distance_km numeric not null,
  passengers int not null,
  tripCost numeric,
  isCompleted boolean default false,
  created_at timestamp default now()
  );