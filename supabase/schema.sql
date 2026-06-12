-- tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  due_date date,
  category text,
  tags text[],
  memo text,
  completed_at timestamptz,
  recurrence_type text check (recurrence_type in ('none','daily','weekly','monthly')) default 'none',
  recurrence_day_of_week int,
  recurrence_day_of_month int,
  recurrence_end_date date,
  created_at timestamptz default now()
);

-- task_completions（繰り返しタスクの日別完了記録）
create table if not exists task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks on delete cascade not null,
  completed_date date not null,
  unique(task_id, completed_date)
);

-- events（予定）
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  memo text,
  created_at timestamptz default now()
);

-- RLS
alter table tasks enable row level security;
alter table task_completions enable row level security;
alter table events enable row level security;

create policy "users can only access own tasks"
  on tasks for all using (auth.uid() = user_id);

create policy "users can only access own completions"
  on task_completions for all using (
    task_id in (select id from tasks where user_id = auth.uid())
  );

create policy "users can only access own events"
  on events for all using (auth.uid() = user_id);
