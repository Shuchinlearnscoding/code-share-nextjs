const TOUR_KEY = 'demoTourSeen';

export function hasSeenTour() {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(TOUR_KEY) === 'true';
}

export function markTourSeen() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOUR_KEY, 'true');
}
