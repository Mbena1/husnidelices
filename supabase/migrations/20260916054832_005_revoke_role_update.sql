-- Revoke UPDATE on the role column from authenticated and anon
-- This prevents users from self-promoting to admin via the profiles table
REVOKE UPDATE (role) ON public.profiles FROM authenticated, anon;