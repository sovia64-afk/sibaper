-- ============================================================
-- SIBAPER - SUPABASE INITIAL SCHEMA
-- Run this in Supabase SQL Editor.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null default '',
    username text not null unique,
    email text,
    role text not null default 'user' check (role in ('admin','user')),
    status text not null default 'active' check (status in ('active','inactive')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.sibaper_app_storage (
    storage_key text primary key,
    storage_value jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.sibaper_app_storage enable row level security;

-- Helper: admin check based on profiles table.
create or replace function public.sibaper_is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
          and p.role = 'admin'
          and p.status = 'active'
    );
$$;

revoke all on function public.sibaper_is_admin() from public;
grant execute on function public.sibaper_is_admin() to authenticated;

-- Profiles: users can read their own profile; admins can read/update all profiles.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.sibaper_is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert to authenticated
with check (id = auth.uid() and role = 'user');

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles for update to authenticated
using (public.sibaper_is_admin())
with check (public.sibaper_is_admin());

-- App storage: authenticated users may read. Only admins may write/delete.
drop policy if exists "storage_read_authenticated" on public.sibaper_app_storage;
create policy "storage_read_authenticated"
on public.sibaper_app_storage for select to authenticated
using (true);

drop policy if exists "storage_insert_admin" on public.sibaper_app_storage;
create policy "storage_insert_admin"
on public.sibaper_app_storage for insert to authenticated
with check (public.sibaper_is_admin());

drop policy if exists "storage_update_admin" on public.sibaper_app_storage;
create policy "storage_update_admin"
on public.sibaper_app_storage for update to authenticated
using (public.sibaper_is_admin())
with check (public.sibaper_is_admin());

drop policy if exists "storage_delete_admin" on public.sibaper_app_storage;
create policy "storage_delete_admin"
on public.sibaper_app_storage for delete to authenticated
using (public.sibaper_is_admin());

-- Public bucket for documents. For production, private storage + signed URLs is preferable.
insert into storage.buckets (id, name, public)
values ('dokumen-sibaper', 'dokumen-sibaper', true)
on conflict (id) do update set public = true;

-- Storage policies: authenticated users may read; admins may upload/update/delete.
drop policy if exists "sibaper_storage_select" on storage.objects;
create policy "sibaper_storage_select"
on storage.objects for select to authenticated
using (bucket_id = 'dokumen-sibaper');

drop policy if exists "sibaper_storage_insert" on storage.objects;
create policy "sibaper_storage_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'dokumen-sibaper' and public.sibaper_is_admin());

drop policy if exists "sibaper_storage_update" on storage.objects;
create policy "sibaper_storage_update"
on storage.objects for update to authenticated
using (bucket_id = 'dokumen-sibaper' and public.sibaper_is_admin())
with check (bucket_id = 'dokumen-sibaper' and public.sibaper_is_admin());

drop policy if exists "sibaper_storage_delete" on storage.objects;
create policy "sibaper_storage_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'dokumen-sibaper' and public.sibaper_is_admin());

-- ============================================================
-- AFTER CREATING THE FIRST ADMIN USER IN SUPABASE AUTH:
-- replace ADMIN_USER_UUID below and run:
--
-- insert into public.profiles(id,name,username,email,role,status)
-- values ('ADMIN_USER_UUID','Administrator','admin','admin@your-domain.com','admin','active')
-- on conflict (id) do update set role='admin',status='active';
-- ============================================================
