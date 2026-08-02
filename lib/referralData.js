import { neon } from '@neondatabase/serverless';

let sqlClient;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for referral data queries');
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

function publicCategory(row) {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  };
}

function publicPlatform(row) {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name || '',
    name: row.name,
    slug: row.slug,
    activityDescription: row.activity_description,
    status: row.status,
    isPopular: row.is_popular,
    codeCount: row.code_count,
    acceptsPlainCode: row.accepts_plain_code,
    acceptsReferralUrl: row.accepts_referral_url,
  };
}

function publicInviteCode(row) {
  return {
    id: row.id,
    platformId: row.platform_id,
    platformName: row.platform_name || '',
    categoryId: row.category_id,
    categoryName: row.category_name || '',
    code: row.code,
    referralUrl: row.referral_url,
    displayType: row.display_type,
    activityDescription: row.activity_description || null,
    verificationStatus: row.verification_status,
    usageCount: row.usage_count,
    reportCount: row.report_count,
  };
}

export async function getReferralMetadata() {
  const sql = getSql();
  const [counts] = await sql`
    select
      (select count(*)::integer from referral_categories) as categories,
      (select count(*)::integer from referral_platforms) as platforms,
      (select count(*)::integer from referral_platforms where status = 'active') as active_platforms,
      (select count(*)::integer from referral_platforms where status = 'wanted') as wanted_platforms,
      (select count(*)::integer from invite_codes) as invite_codes,
      (select count(*)::integer from invite_codes where referral_url is not null) as referral_url_records,
      (select count(*)::integer from invite_codes where code is not null and referral_url is null) as plain_code_records,
      (select count(*)::integer from referral_review_issues) as review_issues
  `;

  return {
    source: 'neon-postgres',
    counts: {
      categories: counts.categories,
      platforms: counts.platforms,
      activePlatforms: counts.active_platforms,
      wantedPlatforms: counts.wanted_platforms,
      inviteCodes: counts.invite_codes,
      referralUrlRecords: counts.referral_url_records,
      plainCodeRecords: counts.plain_code_records,
      reviewIssues: counts.review_issues,
    },
  };
}

export async function listReferralCategories() {
  const sql = getSql();
  const rows = await sql`
    select id, name, sort_order
    from referral_categories
    order by sort_order asc
  `;

  return rows.map(publicCategory);
}

export async function listReferralPlatforms({ includeWanted = false, popularOnly = false } = {}) {
  const sql = getSql();
  const rows = await sql`
    select
      p.id,
      p.category_id,
      c.name as category_name,
      p.name,
      p.slug,
      p.activity_description,
      p.status,
      p.accepts_plain_code,
      p.accepts_referral_url,
      p.is_popular,
      p.code_count
    from referral_platforms p
    join referral_categories c on c.id = p.category_id
    where (${includeWanted}::boolean or p.status = 'active')
      and (not ${popularOnly}::boolean or p.is_popular = true)
    order by p.is_popular desc, p.category_id asc, p.name collate "C" asc
  `;

  return rows.map(publicPlatform);
}

async function findReferralPlatform({ platformId, query }) {
  const sql = getSql();
  const searchTerm = String(query || '').trim().toLowerCase();

  if (platformId) {
    const [platform] = await sql`
      select *
      from referral_platforms
      where id = ${platformId}
      limit 1
    `;
    return platform || null;
  }

  if (!searchTerm) {
    return null;
  }

  const [platform] = await sql`
    select *
    from referral_platforms
    where lower(name) = ${searchTerm}
       or lower(name) like ${`%${searchTerm}%`}
    order by case when lower(name) = ${searchTerm} then 0 else 1 end, name collate "C" asc
    limit 1
  `;

  return platform || null;
}

async function randomActivePlatform() {
  const sql = getSql();
  const [platform] = await sql`
    select p.*
    from referral_platforms p
    where p.status = 'active'
      and exists (
        select 1
        from invite_codes ic
        where ic.platform_id = p.id
          and ic.status = 'active'
      )
    order by random()
    limit 1
  `;

  return platform || null;
}

export async function matchReferralCode({ platformId, query, excludeIds = [] } = {}) {
  const sql = getSql();
  const excluded = Array.isArray(excludeIds) ? excludeIds : [];
  let platform = await findReferralPlatform({ platformId, query });

  if (!platform) {
    platform = await randomActivePlatform();
  }

  if (!platform || platform.status !== 'active') {
    return null;
  }

  const [inviteCode] = await sql`
    select
      ic.id,
      ic.platform_id,
      p.name as platform_name,
      ic.category_id,
      c.name as category_name,
      ic.code,
      ic.referral_url,
      ic.display_type,
      p.activity_description,
      ic.verification_status,
      ic.usage_count,
      ic.report_count
    from invite_codes ic
    join referral_platforms p on p.id = ic.platform_id
    join referral_categories c on c.id = ic.category_id
    where ic.platform_id = ${platform.id}
      and ic.status = 'active'
      and (cardinality(${excluded}::text[]) = 0 or ic.id <> all(${excluded}::text[]))
    order by random()
    limit 1
  `;

  return inviteCode ? publicInviteCode(inviteCode) : null;
}

export async function getReferralReviewSummary() {
  const sql = getSql();
  const rows = await sql`
    select issue_type, count(*)::integer as count
    from referral_review_issues
    group by issue_type
  `;

  return {
    total: rows.reduce((sum, row) => sum + row.count, 0),
    byType: rows.reduce((acc, row) => {
      acc[row.issue_type] = row.count;
      return acc;
    }, {}),
  };
}
