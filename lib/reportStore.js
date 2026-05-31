const REPORT_RECORDS_KEY = 'reportRecords';
const SUSPENDED_CODES_KEY = 'suspendedCodes';
const SUSPEND_THRESHOLD = 5;

function getFingerprint() {
  const raw = [
    navigator.userAgent,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|');

  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function getReportRecords() {
  try {
    return JSON.parse(localStorage.getItem(REPORT_RECORDS_KEY) || '{}');
  } catch {
    return {};
  }
}

function getSuspendedCodes() {
  try {
    return JSON.parse(localStorage.getItem(SUSPENDED_CODES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function isSuspended(inviteCodeId) {
  return getSuspendedCodes().includes(inviteCodeId);
}

export function hasReported(inviteCodeId) {
  const fp = getFingerprint();
  const records = getReportRecords();
  return (records[inviteCodeId] || []).some((r) => r.fingerprint === fp);
}

export function submitReport(inviteCodeId, reason) {
  const fp = getFingerprint();
  const records = getReportRecords();

  if (!records[inviteCodeId]) records[inviteCodeId] = [];

  if (records[inviteCodeId].some((r) => r.fingerprint === fp)) {
    return { ok: false, reason: 'already_reported' };
  }

  records[inviteCodeId].push({
    fingerprint: fp,
    reason: reason || '',
    reportedAt: new Date().toISOString(),
  });

  localStorage.setItem(REPORT_RECORDS_KEY, JSON.stringify(records));

  const uniqueCount = records[inviteCodeId].length;

  if (uniqueCount >= SUSPEND_THRESHOLD) {
    const suspended = getSuspendedCodes();
    if (!suspended.includes(inviteCodeId)) {
      suspended.push(inviteCodeId);
      localStorage.setItem(SUSPENDED_CODES_KEY, JSON.stringify(suspended));
    }
    return { ok: true, suspended: true, count: uniqueCount };
  }

  return { ok: true, suspended: false, count: uniqueCount };
}

export function getReportDetails(inviteCodeId) {
  const records = getReportRecords();
  return records[inviteCodeId] || [];
}

export function getAllReports() {
  return getReportRecords();
}

export function reactivateCode(inviteCodeId) {
  const suspended = getSuspendedCodes().filter((id) => id !== inviteCodeId);
  localStorage.setItem(SUSPENDED_CODES_KEY, JSON.stringify(suspended));

  const records = getReportRecords();
  delete records[inviteCodeId];
  localStorage.setItem(REPORT_RECORDS_KEY, JSON.stringify(records));
}
