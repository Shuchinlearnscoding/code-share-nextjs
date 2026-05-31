async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export async function fetchReferralPlatforms({ popularOnly = false } = {}) {
  const params = new URLSearchParams();
  if (popularOnly) params.set('popularOnly', 'true');

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return requestJson(`/api/referrals/platforms${suffix}`);
}

export async function fetchReferralMatch({ platformId, query } = {}) {
  const params = new URLSearchParams();
  if (platformId) params.set('platformId', platformId);
  if (query) params.set('q', query);

  const suffix = params.toString() ? `?${params.toString()}` : '';
  return requestJson(`/api/referrals/match${suffix}`);
}

export async function sendReferralEvent({ inviteCodeId, eventType }) {
  return requestJson('/api/referrals/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inviteCodeId, eventType }),
  });
}
