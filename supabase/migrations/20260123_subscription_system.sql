-- Add subscription and trial fields to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS max_team_members INT DEFAULT 5;

-- Update existing organizations to have trial dates
UPDATE public.organizations
SET 
  trial_start_date = created_at,
  trial_end_date = created_at + interval '7 days'
WHERE trial_start_date IS NULL;

-- Add comment explaining the system
COMMENT ON COLUMN public.organizations.subscription_status IS 'trial: First 7 days | active: Paid subscription | expired: Trial ended without payment | cancelled: Subscription cancelled';
COMMENT ON COLUMN public.organizations.max_team_members IS 'Maximum team members allowed based on plan: free=5, starter=10, professional=25, enterprise=unlimited';

-- Create function to check if trial has expired
CREATE OR REPLACE FUNCTION public.is_trial_expired(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = org_id
    AND subscription_status = 'trial'
    AND trial_end_date < timezone('utc'::text, now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to auto-upgrade or expire trials
CREATE OR REPLACE FUNCTION public.check_and_update_trial_status()
RETURNS void AS $$
BEGIN
  -- Update expired trials
  UPDATE public.organizations
  SET subscription_status = 'expired'
  WHERE subscription_status = 'trial'
  AND trial_end_date < timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for organization access based on subscription
CREATE POLICY "Users cannot access expired organization data" ON public.organizations FOR SELECT 
USING (
  id IN (
    SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
  )
  AND subscription_status != 'expired'
);

-- Add team member limit check function
CREATE OR REPLACE FUNCTION public.can_add_team_member(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INT;
  max_allowed INT;
  org_plan TEXT;
BEGIN
  -- Get current member count and plan
  SELECT 
    COUNT(*), 
    o.max_team_members,
    o.subscription_plan
  INTO current_count, max_allowed, org_plan
  FROM public.memberships m
  JOIN public.organizations o ON o.id = m.organization_id
  WHERE m.organization_id = org_id
  GROUP BY o.max_team_members, o.subscription_plan;

  -- Enterprise has unlimited
  IF org_plan = 'enterprise' THEN
    RETURN TRUE;
  END IF;

  -- Check if under limit
  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create invitations table for pending invites
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, email)
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations for their organizations (admins only)
CREATE POLICY "Admins can view org invitations" ON public.invitations FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.memberships 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Policy: Only admins can create invitations
CREATE POLICY "Only admins can create invitations" ON public.invitations FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.memberships 
    WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_organizations_subscription ON public.organizations(subscription_status, trial_end_date);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
