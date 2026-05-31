import referralData from '@/data/referral-data.json';

function normalizeSearchTerm(value) {
  return String(value || '').trim().toLowerCase();
}

function publicCategory(category) {
  return {
    id: category.id,
    name: category.name,
    sortOrder: category.sortOrder,
  };
}

function publicPlatform(platform, categoriesById) {
  const category = categoriesById.get(platform.categoryId);

  return {
    id: platform.id,
    categoryId: platform.categoryId,
    categoryName: category?.name || '',
    name: platform.name,
    slug: platform.slug,
    activityDescription: platform.activityDescription,
    status: platform.status,
    isPopular: platform.isPopular,
    codeCount: platform.codeCount,
    acceptsPlainCode: platform.acceptsPlainCode,
    acceptsReferralUrl: platform.acceptsReferralUrl,
  };
}

function publicInviteCode(inviteCode, platform, categoriesById) {
  const category = categoriesById.get(inviteCode.categoryId);

  return {
    id: inviteCode.id,
    platformId: inviteCode.platformId,
    platformName: platform?.name || '',
    categoryId: inviteCode.categoryId,
    categoryName: category?.name || '',
    code: inviteCode.code,
    referralUrl: inviteCode.referralUrl,
    displayType: inviteCode.displayType,
    activityDescription: platform?.activityDescription || null,
    verificationStatus: inviteCode.verificationStatus,
    usageCount: inviteCode.usageCount,
    reportCount: inviteCode.reportCount,
  };
}

export function getReferralMetadata() {
  return referralData.metadata;
}

export function listReferralCategories() {
  return referralData.categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(publicCategory);
}

export function listReferralPlatforms({ includeWanted = false, popularOnly = false } = {}) {
  const categoriesById = new Map(referralData.categories.map((category) => [category.id, category]));

  return referralData.platforms
    .filter((platform) => includeWanted || platform.status === 'active')
    .filter((platform) => !popularOnly || platform.isPopular)
    .sort((a, b) => {
      if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
      if (a.categoryId !== b.categoryId) return a.categoryId.localeCompare(b.categoryId);
      return a.name.localeCompare(b.name, 'zh-Hant');
    })
    .map((platform) => publicPlatform(platform, categoriesById));
}

export function findReferralPlatform({ platformId, query }) {
  const searchTerm = normalizeSearchTerm(query);

  if (platformId) {
    return referralData.platforms.find((platform) => platform.id === platformId) || null;
  }

  if (!searchTerm) {
    return null;
  }

  return (
    referralData.platforms.find((platform) => normalizeSearchTerm(platform.name) === searchTerm) ||
    referralData.platforms.find((platform) => normalizeSearchTerm(platform.name).includes(searchTerm)) ||
    null
  );
}

export function matchReferralCode({ platformId, query } = {}) {
  const categoriesById = new Map(referralData.categories.map((category) => [category.id, category]));
  let platform = findReferralPlatform({ platformId, query });

  if (!platform) {
    const activePlatforms = referralData.platforms.filter(
      (candidate) => candidate.status === 'active' && candidate.codeCount > 0,
    );
    platform = activePlatforms[Math.floor(Math.random() * activePlatforms.length)] || null;
  }

  if (!platform || platform.status !== 'active') {
    return null;
  }

  const eligibleCodes = referralData.inviteCodes.filter(
    (inviteCode) => inviteCode.platformId === platform.id && inviteCode.status === 'active',
  );

  if (eligibleCodes.length === 0) {
    return null;
  }

  const inviteCode = eligibleCodes[Math.floor(Math.random() * eligibleCodes.length)];

  return publicInviteCode(inviteCode, platform, categoriesById);
}

export function getReferralReviewSummary() {
  return {
    total: referralData.reviewIssues.length,
    byType: referralData.reviewIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {}),
  };
}
