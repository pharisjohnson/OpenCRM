-- Update handle_new_user to create organization and membership automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    org_slug TEXT;
    company_name TEXT;
BEGIN
    -- Get company name from metadata, default to "My Workspace" if missing
    company_name := new.raw_user_meta_data->>'company_name';
    IF company_name IS NULL OR company_name = '' THEN
        company_name := 'My Workspace';
    END IF;

    -- Generate a basic slug
    -- Lowercase and replace non-alphanumeric with dashes
    org_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Remove leading/trailing dashes
    org_slug := trim(both '-' from org_slug);
    -- Append random string to ensure uniqueness (collision avoidance)
    org_slug := org_slug || '-' || substr(md5(random()::text), 1, 6);

    -- 1. Create Profile
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

    -- 2. Create Organization
    INSERT INTO public.organizations (name, slug)
    VALUES (company_name, org_slug)
    RETURNING id INTO org_id;

    -- 3. Create Membership (Owner/Admin)
    INSERT INTO public.memberships (user_id, organization_id, role)
    VALUES (new.id, org_id, 'admin');

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
