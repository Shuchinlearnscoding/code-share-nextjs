'use client';

import { useId } from 'react';

export default function BeeEmblem({ size = 110 }) {
    const clipId = `bee-emblem-body-${useId()}`;
    const bodyPath = 'M45 33c6.5 0 10 5.5 10 12s-3.5 10-10 10-10-4.5-10-10 3.5-12 10-12z';

    return (
        <svg width={size} height={size} viewBox="0 0 90 90" aria-hidden="true">
            <polygon
                points="45,4 79,24 79,64 45,84 11,64 11,24"
                fill="none"
                stroke="#0077A0"
                strokeWidth="3"
            />
            <polygon
                points="45,16 69,30 69,58 45,72 21,58 21,30"
                fill="none"
                stroke="#FFB703"
                strokeWidth="1.5"
                strokeDasharray="3 4"
            />

            <ellipse cx="35" cy="42" rx="8" ry="11" transform="rotate(-25 35 42)" fill="#B4E1EB" opacity="0.7" />
            <ellipse cx="55" cy="42" rx="8" ry="11" transform="rotate(25 55 42)" fill="#B4E1EB" opacity="0.7" />

            <path d={bodyPath} fill="#FFB703" />
            <clipPath id={clipId}>
                <path d={bodyPath} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
                <rect x="34" y="41" width="22" height="4" fill="#023047" />
                <rect x="34" y="48" width="22" height="4" fill="#023047" />
            </g>

            <circle cx="45" cy="31" r="5.5" fill="#023047" />
            <circle cx="42.7" cy="31" r="1.2" fill="#fff" />
            <circle cx="47.3" cy="31" r="1.2" fill="#fff" />
        </svg>
    );
}
