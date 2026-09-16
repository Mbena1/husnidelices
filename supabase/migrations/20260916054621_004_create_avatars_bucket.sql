/*
# Create avatars storage bucket

## Overview
Creates a public storage bucket for user avatar images.
Users can upload their own profile photo to this bucket.

## Notes
- The bucket is public so avatar images can be displayed publicly
- RLS policies on the profiles table ensure only the owner can update their avatar_url
- Storage policies will be set to allow authenticated users to manage their own files
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read of avatars
CREATE POLICY "Public can read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
  );