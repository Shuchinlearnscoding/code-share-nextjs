create table if not exists referral_categories (
  id text primary key,
  name text not null,
  sort_order integer not null default 0,
  source_sheet text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists referral_platforms (
  id text primary key,
  category_id text not null references referral_categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  activity_description text,
  status text not null default 'active',
  accepts_plain_code boolean not null default false,
  accepts_referral_url boolean not null default false,
  is_popular boolean not null default false,
  code_count integer not null default 0,
  source_sheet text,
  source_column integer,
  quality_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referral_platforms_status_check check (status in ('active', 'wanted', 'pending', 'rejected', 'inactive'))
);

create table if not exists invite_codes (
  id text primary key,
  platform_id text not null references referral_platforms(id) on delete cascade,
  category_id text not null references referral_categories(id) on delete restrict,
  user_id text,
  code text,
  referral_url text,
  raw_value text,
  display_type text not null default 'code',
  status text not null default 'active',
  verification_status text not null default 'unverified',
  source_type text not null default 'seed_import',
  usage_count integer not null default 0,
  report_count integer not null default 0,
  last_used_at timestamptz,
  last_verified_at timestamptz,
  expires_at timestamptz,
  source_sheet text,
  source_column integer,
  source_row integer,
  quality_flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invite_codes_status_check check (status in ('active', 'inactive', 'reported', 'deleted')),
  constraint invite_codes_verification_status_check check (verification_status in ('unverified', 'verified', 'rejected')),
  constraint invite_codes_has_value_check check (code is not null or referral_url is not null or raw_value is not null)
);

create table if not exists referral_review_issues (
  id bigserial primary key,
  issue_type text not null,
  severity text not null default 'info',
  platform_name text,
  invite_code_id text,
  source_sheet text,
  source_column integer,
  source_row integer,
  raw_value text,
  value text,
  invite_code_ids jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists referral_platforms_category_id_idx on referral_platforms(category_id);
create index if not exists referral_platforms_status_idx on referral_platforms(status);
create index if not exists referral_platforms_is_popular_idx on referral_platforms(is_popular);
create index if not exists invite_codes_platform_id_idx on invite_codes(platform_id);
create index if not exists invite_codes_category_id_idx on invite_codes(category_id);
create index if not exists invite_codes_status_idx on invite_codes(status);
create index if not exists referral_review_issues_invite_code_id_idx on referral_review_issues(invite_code_id);
