-- IJITEST Database Schema

-- 1. Profiles Table (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'editor', 'author', 'reviewer')) default 'author',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. Volumes Table
create table public.volumes (
  id uuid default gen_random_uuid() primary key,
  volume_number integer not null,
  year integer not null,
  title text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Issues Table
create table public.issues (
  id uuid default gen_random_uuid() primary key,
  volume_id uuid references public.volumes(id) not null,
  issue_number integer not null,
  month_range text, -- e.g., "Jan - Mar"
  title text,
  status text check (status in ('Open', 'Closed', 'Published')) default 'Open',
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Submissions Table (Core)
create table public.submissions (
  id uuid default gen_random_uuid() primary key,
  paper_id text unique not null, -- e.g., IJITEST-2026-001
  title text not null,
  abstract text,
  keywords text,
  author_name text not null,
  author_email text not null,
  affiliation text,
  user_id uuid references auth.users, -- Optional, if author links to account later
  
  -- Files
  manuscript_url text,
  cover_letter_url text,
  
  -- Status
  status text check (
    status in (
      'Submitted', 
      'Under Review', 
      'Revision Required', 
      'Accepted', 
      'Payment Pending', 
      'Paid', 
      'Published', 
      'Rejected'
    )
  ) default 'Submitted',
  
  issue_id uuid references public.issues(id), -- Assigned issue
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Reviews Table (Offline Review Tracking)
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references public.submissions(id) not null,
  reviewer_name text not null,
  reviewer_email text not null,
  status text check (status in ('Pending', 'In Progress', 'Completed', 'Overdue')) default 'Pending',
  feedback_file_url text,
  admin_notes text,
  deadline timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Storage Bucket Setup (This usually needs to be done in UI or via Storage API, 
-- but here is the policy SQL representation)

-- Bucket: 'manuscripts' (Private, Admin & Owner access)
-- Bucket: 'published' (Public read)

-- 7. Triggers for Updated At
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.submissions
  for each row execute procedure moddatetime (updated_at);
