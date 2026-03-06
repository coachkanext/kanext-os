-- ============================================================================
-- Seed Data: Lincoln University — Men's Basketball 2025-26
-- Roster starts empty; players added through the app.
-- ============================================================================

-- Organization
insert into public.organizations (id, name, slug, mode)
values (
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Lincoln University',
  'lincoln-university',
  'sports'
) on conflict (slug) do nothing;

-- Program: Men's Basketball
insert into public.programs (id, org_id, name, sport, gender, division, conference)
values (
  'a1b2c3d4-0002-4000-8000-000000000001',
  'a1b2c3d4-0001-4000-8000-000000000001',
  'Men''s Basketball',
  'basketball',
  'mens',
  'NCAA D2',
  'MIAA'
) on conflict do nothing;

-- Season: 2025-26
insert into public.seasons (id, program_id, label, start_date, end_date, is_current)
values (
  'a1b2c3d4-0003-4000-8000-000000000001',
  'a1b2c3d4-0002-4000-8000-000000000001',
  '2025-26',
  '2025-10-01',
  '2026-04-30',
  true
) on conflict do nothing;
