-- OpenCRM SaaS Ready Migration
-- Description: Sets up multi-tenancy with Organizations and Memberships.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#0ea5e9',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Memberships table
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'owner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, organization_id)
);

-- 5. Add organization_id to existing business tables (if they exist)
-- Note: You might need to add these one by one as you create tables.
-- ALTER TABLE public.companies ADD COLUMN organization_id UUID REFERENCES organizations(id);
-- ALTER TABLE public.contacts ADD COLUMN organization_id UUID REFERENCES organizations(id);
-- ALTER TABLE public.deals ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- 6. Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- Profiles: Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Organizations: Users can view organizations they are members of
CREATE POLICY "Users can view their organizations" ON public.organizations FOR SELECT 
USING (id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

-- Memberships: Users can view memberships of their own organizations
CREATE POLICY "Users can view org memberships" ON public.memberships FOR SELECT 
USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

-- 8. Functions & Triggers for Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
