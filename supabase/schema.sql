-- EHR Prototype: Supabase schema
-- ------------------------------------------------------------
-- Run this file in the Supabase SQL Editor (Dashboard → SQL Editor).
-- It creates the two JSONB tables the app expects and opens read/write
-- access for the anonymous key (fine for a prototype with the demo login).
-- ------------------------------------------------------------

create extension if not exists pgcrypto;

-- Patients: one row per registered patient. The full Patient object
-- (including nested admission / emergency contact / allergy arrays) is
-- stored as a single JSONB document in the `data` column.
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists patients_created_at_idx
  on public.patients (created_at desc);

-- Clinical records: one row per patient holding the ClinicalRecords object
-- { complaints, diagnoses, orders, vitals, medications, administrations, ioEntries, progressNotes } as JSONB.
create table if not exists public.clinical_records (
  patient_id uuid primary key references public.patients (id) on delete cascade,
  data jsonb not null default '{"complaints":[],"diagnoses":[],"orders":[],"vitals":[],"medications":[],"administrations":[],"ioEntries":[],"progressNotes":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: the app uses the anonymous (anon) key with the demo
-- login, so allow full access for every operation.
alter table public.patients enable row level security;
alter table public.clinical_records enable row level security;

create policy "prototype full access"
  on public.patients
  for all
  using (true)
  with check (true);

create policy "prototype full access"
  on public.clinical_records
  for all
  using (true)
  with check (true);
