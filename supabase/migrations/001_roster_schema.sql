-- ============================================================================
-- KaNeXT OS — Roster Domain Schema
-- Run in Supabase SQL Editor (or via supabase db push)
-- ============================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================================
-- CORE TABLES (Org Structure)
-- ============================================================================

create table if not exists public.organizations (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text not null unique,
  mode       text not null default 'sports',
  logo_url   text,
  created_at timestamptz not null default now()
);

create table if not exists public.programs (
  id         uuid primary key default uuid_generate_v4(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  name       text not null,
  sport      text not null default 'basketball',
  gender     text not null default 'mens',
  division   text,
  conference text,
  created_at timestamptz not null default now()
);

create table if not exists public.seasons (
  id          uuid primary key default uuid_generate_v4(),
  program_id  uuid not null references public.programs(id) on delete cascade,
  label       text not null,
  start_date  date not null,
  end_date    date not null,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.memberships (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  org_id       uuid not null references public.organizations(id) on delete cascade,
  role_lens    text not null default 'R10',
  display_name text,
  created_at   timestamptz not null default now(),
  unique(user_id, org_id)
);

-- ============================================================================
-- ROSTER TABLES
-- ============================================================================

create table if not exists public.players (
  id         uuid primary key default uuid_generate_v4(),
  full_name  text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.roster_entries (
  id              uuid primary key default uuid_generate_v4(),
  player_id       uuid not null references public.players(id) on delete cascade,
  program_id      uuid not null references public.programs(id) on delete cascade,
  season_id       uuid not null references public.seasons(id) on delete cascade,
  jersey_number   text,
  position        text,
  height          text,
  weight          integer,
  class_year      text,
  status          text not null default 'available',
  scholarship_pct numeric(5,2),
  nil_amount      numeric(10,2),
  gpa             numeric(3,2),
  notes           text,
  flagged         boolean not null default false,
  hometown        text,
  previous_school text,
  headshot_url    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(player_id, program_id, season_id)
);

create table if not exists public.player_ratings (
  id               uuid primary key default uuid_generate_v4(),
  roster_entry_id  uuid not null references public.roster_entries(id) on delete cascade unique,
  kr               numeric(5,1),
  off_kr           numeric(5,1),
  def_kr           numeric(5,1),
  archetype        text,
  shooting         numeric(5,1),
  finishing        numeric(5,1),
  playmaking       numeric(5,1),
  on_ball_defense  numeric(5,1),
  team_defense     numeric(5,1),
  rebounding       numeric(5,1),
  physical         numeric(5,1),
  ppg              numeric(4,1),
  rpg              numeric(4,1),
  apg              numeric(4,1),
  spg              numeric(4,1),
  bpg              numeric(4,1),
  fg_pct           numeric(4,1),
  three_pct        numeric(4,1),
  ft_pct           numeric(4,1),
  gp               integer,
  minutes          numeric(4,1),
  usage            numeric(4,1),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.coaches (
  id               uuid primary key default uuid_generate_v4(),
  program_id       uuid not null references public.programs(id) on delete cascade,
  full_name        text not null,
  title            text not null,
  bio              text,
  offensive_system text,
  defensive_system text,
  tendencies       text,
  headshot_url     text,
  created_at       timestamptz not null default now()
);

create table if not exists public.depth_chart (
  id              uuid primary key default uuid_generate_v4(),
  program_id      uuid not null references public.programs(id) on delete cascade,
  season_id       uuid not null references public.seasons(id) on delete cascade,
  roster_entry_id uuid not null references public.roster_entries(id) on delete cascade,
  group_type      text not null,        -- 'starter', 'rotation', 'unit'
  group_name      text not null,        -- e.g. 'Starters', 'Guards', 'Small'
  slot            text,                 -- e.g. 'PG', 'CG', 'Wing', 'Forward', 'Big'
  sort_order      integer not null default 0,
  status          text not null default 'PROVISIONAL',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index if not exists idx_programs_org on public.programs(org_id);
create index if not exists idx_seasons_program on public.seasons(program_id);
create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_memberships_org on public.memberships(org_id);
create index if not exists idx_roster_entries_program_season on public.roster_entries(program_id, season_id);
create index if not exists idx_roster_entries_player on public.roster_entries(player_id);
create index if not exists idx_player_ratings_entry on public.player_ratings(roster_entry_id);
create index if not exists idx_coaches_program on public.coaches(program_id);
create index if not exists idx_depth_chart_program_season on public.depth_chart(program_id, season_id);

-- ============================================================================
-- AUTO-UPDATE updated_at
-- ============================================================================

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_roster_entries_updated
  before update on public.roster_entries
  for each row execute function public.update_updated_at();

create trigger trg_player_ratings_updated
  before update on public.player_ratings
  for each row execute function public.update_updated_at();

create trigger trg_depth_chart_updated
  before update on public.depth_chart
  for each row execute function public.update_updated_at();

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================

alter table public.organizations enable row level security;
alter table public.programs enable row level security;
alter table public.seasons enable row level security;
alter table public.memberships enable row level security;
alter table public.players enable row level security;
alter table public.roster_entries enable row level security;
alter table public.player_ratings enable row level security;
alter table public.coaches enable row level security;
alter table public.depth_chart enable row level security;

-- Helper: check if current user belongs to an org
create or replace function public.user_has_org_access(check_org_id uuid)
returns boolean as $$
  select exists(
    select 1 from public.memberships
    where user_id = auth.uid()
      and org_id = check_org_id
  );
$$ language sql security definer stable;

-- Helper: check if current user is coach/admin (R0-R4) in an org
create or replace function public.user_is_coach_or_admin(check_org_id uuid)
returns boolean as $$
  select exists(
    select 1 from public.memberships
    where user_id = auth.uid()
      and org_id = check_org_id
      and role_lens in ('R0', 'R1', 'R2', 'R3', 'R4')
  );
$$ language sql security definer stable;

-- Organizations: read for members
create policy "org_read" on public.organizations
  for select using (public.user_has_org_access(id));

-- Programs: read for org members
create policy "program_read" on public.programs
  for select using (public.user_has_org_access(org_id));

-- Seasons: read for org members (via program)
create policy "season_read" on public.seasons
  for select using (
    exists(
      select 1 from public.programs p
      where p.id = program_id and public.user_has_org_access(p.org_id)
    )
  );

-- Memberships: users can read their own memberships
create policy "membership_read_own" on public.memberships
  for select using (user_id = auth.uid());

-- Players: read for any authenticated user (players are shared entities)
create policy "player_read" on public.players
  for select using (auth.role() = 'authenticated');

-- Players: insert for coaches/admins
create policy "player_insert" on public.players
  for insert with check (auth.role() = 'authenticated');

-- Roster entries: read for org members
create policy "roster_read" on public.roster_entries
  for select using (
    exists(
      select 1 from public.programs p
      where p.id = program_id and public.user_has_org_access(p.org_id)
    )
  );

-- Roster entries: write for coaches/admins (R0-R4)
create policy "roster_write" on public.roster_entries
  for insert with check (
    exists(
      select 1 from public.programs p
      where p.id = program_id and public.user_is_coach_or_admin(p.org_id)
    )
  );

create policy "roster_update" on public.roster_entries
  for update using (
    exists(
      select 1 from public.programs p
      where p.id = program_id and public.user_is_coach_or_admin(p.org_id)
    )
  );

-- Player ratings: read for org members
create policy "ratings_read" on public.player_ratings
  for select using (
    exists(
      select 1 from public.roster_entries re
      join public.programs p on p.id = re.program_id
      where re.id = roster_entry_id and public.user_has_org_access(p.org_id)
    )
  );

-- Player ratings: write for coaches/admins
create policy "ratings_write" on public.player_ratings
  for insert with check (
    exists(
      select 1 from public.roster_entries re
      join public.programs p on p.id = re.program_id
      where re.id = roster_entry_id and public.user_is_coach_or_admin(p.org_id)
    )
  );

create policy "ratings_update" on public.player_ratings
  for update using (
    exists(
      select 1 from public.roster_entries re
      join public.programs p on p.id = re.program_id
      where re.id = roster_entry_id and public.user_is_coach_or_admin(p.org_id)
    )
  );

-- Coaches: read for org members
create policy "coaches_read" on public.coaches
  for select using (
    exists(
      select 1 from public.programs p
      where p.id = program_id and public.user_has_org_access(p.org_id)
    )
  );

-- Coaches: write for coaches/admins
create policy "coaches_write" on public.coaches
  for insert with check (
    exists(
      select 1 from public.programs p
      where p.id = program_id and public.user_is_coach_or_admin(p.org_id)
    )
  );

-- Depth chart: read for org members
create policy "depth_chart_read" on public.depth_chart
  for select using (
    exists(
      select 1 from public.programs p
      where p.id = program_id and public.user_has_org_access(p.org_id)
    )
  );

-- Depth chart: write for coaches/admins
create policy "depth_chart_write" on public.depth_chart
  for insert with check (
    exists(
      select 1 from public.programs p
      where p.id = program_id and public.user_is_coach_or_admin(p.org_id)
    )
  );

create policy "depth_chart_update" on public.depth_chart
  for update using (
    exists(
      select 1 from public.programs p
      where p.id = program_id and public.user_is_coach_or_admin(p.org_id)
    )
  );

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

alter publication supabase_realtime add table public.roster_entries;
alter publication supabase_realtime add table public.player_ratings;
alter publication supabase_realtime add table public.coaches;
alter publication supabase_realtime add table public.depth_chart;
