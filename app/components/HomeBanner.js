'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import './HomeBanner.css';

const slides = [
    { id: 1, type: 'avatar-wall', href: '/auth/signup' },
    { id: 2, type: 'community', href: '/' },
    { id: 3, type: 'member-card', href: '/manageCode' },
];

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;

function SlideContent({ type, t }) {
    if (type === 'avatar-wall') {
        const s = t('banner.avatarWall');
        return (
            <div className="hb-slide hb-avatar-wall">
                <div className="hb-hex hb-hex-1" aria-hidden="true" />
                <div className="hb-hex hb-hex-2" aria-hidden="true" />
                <div className="hb-hex hb-hex-3" aria-hidden="true" />
                <div className="hb-text">
                    <span className="hb-tag">{s.tag}</span>
                    <h3>{s.title}</h3>
                    <div className="hb-steps">
                        <span className="hb-step">{s.step1}</span>
                        <span className="hb-arrow">→</span>
                        <span className="hb-step">{s.step2}</span>
                        <span className="hb-arrow">→</span>
                        <span className="hb-step">{s.step3}</span>
                    </div>
                    <div className="hb-avatars">
                        <span className="hb-av hb-av-1">陳</span>
                        <span className="hb-av hb-av-2">林</span>
                        <span className="hb-av hb-av-3">王</span>
                        <span className="hb-av hb-av-more">+99</span>
                        <span className="hb-avatars-label">{s.avatarsLabel} 🐝</span>
                    </div>
                    <span className="hb-cta">{s.cta}</span>
                </div>
                <div className="hb-photo" aria-hidden="true">
                    <span className="hb-photo-bee">🍯</span>
                </div>
            </div>
        );
    }

    if (type === 'community') {
        const s = t('banner.community');
        return (
            <div className="hb-slide hb-community">
                <div className="hb-hex hb-hex-1" aria-hidden="true" />
                <div className="hb-hex hb-hex-2" aria-hidden="true" />
                <div className="hb-text">
                    <span className="hb-tag hb-tag-alt">{s.tag}</span>
                    <h3>{s.title} 🐝</h3>
                    <p>{s.desc}</p>
                    <span className="hb-cta">{s.cta}</span>
                </div>
                <svg className="hb-illustration" viewBox="0 0 160 100" aria-hidden="true">
                    <polygon points="20,10 34,10 41,22 34,34 20,34 13,22" fill="#ffffff" fillOpacity="0.35" />
                    <polygon points="130,70 144,70 151,82 144,94 130,94 123,82" fill="#ffffff" fillOpacity="0.35" />
                    <circle cx="40" cy="55" r="18" fill="#ffffff" fillOpacity="0.85" />
                    <rect x="24" y="70" width="32" height="26" rx="10" fill="#ffffff" fillOpacity="0.85" />
                    <circle cx="80" cy="45" r="20" fill="#00B4D8" />
                    <rect x="62" y="62" width="36" height="30" rx="11" fill="#00B4D8" />
                    <circle cx="122" cy="55" r="18" fill="#023047" fillOpacity="0.85" />
                    <rect x="106" y="70" width="32" height="26" rx="10" fill="#023047" fillOpacity="0.85" />
                    <text x="80" y="18" fontSize="16" textAnchor="middle">🍯</text>
                </svg>
            </div>
        );
    }

    const s = t('banner.memberCard');
    return (
        <div className="hb-slide hb-member-card">
            <div className="hb-honeycomb" aria-hidden="true" />
            <div className="hb-mc-top">
                <span className="hb-mc-title">{s.title} 🐝</span>
                <span className="hb-mc-badge">{s.badge}</span>
            </div>
            <div className="hb-mc-mid">{s.desc}</div>
            <div className="hb-mc-bottom">
                <span className="hb-mc-rank">{s.rank}</span>
                <span className="hb-cta hb-cta-light">{s.cta}</span>
            </div>
        </div>
    );
}

export default function HomeBanner() {
    const router = useRouter();
    const session = authClient.useSession();
    const { t } = useLanguage();
    const [activeIndex, setActiveIndex] = useState(0);
    const timerRef = useRef(null);
    const dragStartX = useRef(null);

    const goTo = (index) => {
        const total = slides.length;
        setActiveIndex(((index % total) + total) % total);
    };

    const startAutoplay = () => {
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % slides.length);
        }, AUTOPLAY_MS);
    };

    useEffect(() => {
        startAutoplay();
        return () => clearInterval(timerRef.current);
    }, []);

    const handleDragStart = (clientX) => {
        dragStartX.current = clientX;
    };

    const handleDragEnd = (clientX) => {
        if (dragStartX.current === null) return;
        const delta = clientX - dragStartX.current;
        dragStartX.current = null;

        if (delta > SWIPE_THRESHOLD) {
            goTo(activeIndex - 1);
            startAutoplay();
        } else if (delta < -SWIPE_THRESHOLD) {
            goTo(activeIndex + 1);
            startAutoplay();
        }
    };

    return (
        <section
            className="home-banner"
            onMouseEnter={() => clearInterval(timerRef.current)}
            onMouseLeave={startAutoplay}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseUp={(e) => handleDragEnd(e.clientX)}
        >
            <div
                className="home-banner-track"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
                {slides.map((slide) => (
                    <Link
                        href={slide.href}
                        key={slide.id}
                        className="home-banner-slide"
                        onClick={(e) => {
                            if (slide.type === 'member-card' && !session.data?.user) {
                                e.preventDefault();
                                router.push('/auth/login');
                            }
                        }}
                    >
                        <SlideContent type={slide.type} t={t} />
                    </Link>
                ))}
            </div>

            <button
                type="button"
                className="home-banner-arrow prev"
                aria-label="上一張"
                onClick={() => {
                    goTo(activeIndex - 1);
                    startAutoplay();
                }}
            >
                ‹
            </button>
            <button
                type="button"
                className="home-banner-arrow next"
                aria-label="下一張"
                onClick={() => {
                    goTo(activeIndex + 1);
                    startAutoplay();
                }}
            >
                ›
            </button>

            <div className="home-banner-dots">
                {slides.map((slide, index) => (
                    <button
                        type="button"
                        key={slide.id}
                        className={`home-banner-dot ${index === activeIndex ? 'active' : ''}`}
                        aria-label={`前往第 ${index + 1} 張`}
                        onClick={() => {
                            goTo(index);
                            startAutoplay();
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
