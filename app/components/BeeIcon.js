'use client';

import { useId } from 'react';

export default function BeeIcon({ size = 16, className = '' }) {
    const clipId = `bee-body-${useId()}`;
    const bodyPath = 'M16 8c5 0 8 4 8 9s-3 8-8 8-8-3.5-8-8 3-9 8-9z';

    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
        >
            <ellipse cx="9" cy="11" rx="6.5" ry="8.5" transform="rotate(-25 9 11)" fill="#B4E1EB" opacity="0.7" />
            <ellipse cx="23" cy="11" rx="6.5" ry="8.5" transform="rotate(25 23 11)" fill="#B4E1EB" opacity="0.7" />

            <path d={bodyPath} fill="#FFB703" />
            <clipPath id={clipId}>
                <path d={bodyPath} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
                <rect x="8" y="14" width="16" height="3.2" fill="#023047" />
                <rect x="8" y="20" width="16" height="3.2" fill="#023047" />
            </g>

            <circle cx="16" cy="8" r="4.2" fill="#023047" />
            <path d="M14 5c-1-2-2-2.5-3-2.5" stroke="#023047" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M18 5c1-2 2-2.5 3-2.5" stroke="#023047" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <circle cx="11" cy="2.5" r="0.9" fill="#023047" />
            <circle cx="21" cy="2.5" r="0.9" fill="#023047" />
            <circle cx="14.3" cy="8" r="1" fill="#fff" />
            <circle cx="17.7" cy="8" r="1" fill="#fff" />
        </svg>
    );
}
