const SESSION_KEY = 'demoSession';
const TOUR_KEY = 'demoTourSeen';

export function isLoggedIn() {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(SESSION_KEY) === 'true';
}

export function startDemoSession() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_KEY, 'true');
    localStorage.removeItem(TOUR_KEY);
}

export function endSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
}

export function hasSeenTour() {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(TOUR_KEY) === 'true';
}

export function markTourSeen() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOUR_KEY, 'true');
}
