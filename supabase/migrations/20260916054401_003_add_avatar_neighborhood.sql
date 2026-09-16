/*
# Add avatar_url and neighborhood to profiles

## Overview
Adds two columns to the existing profiles table:
- avatar_url: URL to the user's profile photo (stored in Supabase Storage)
- neighborhood: The user's neighborhood/quarter within their city

## Changes
1. ALTER TABLE profiles ADD COLUMN avatar_url text
2. ALTER TABLE profiles ADD COLUMN neighborhood text

## Security
No security changes needed — existing RLS policies already cover these columns.
The profiles_admin_all and profiles_select_own_or_admin policies use SELECT/UPDATE
without column restrictions, so the new columns are automatically covered.

## Notes
- Uses DO $$ ... END $$ to check if columns exist before adding (idempotent)
- No data is lost — columns are nullable with no default
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'neighborhood') THEN
    ALTER TABLE public.profiles ADD COLUMN neighborhood text;
  END IF;
END $$;