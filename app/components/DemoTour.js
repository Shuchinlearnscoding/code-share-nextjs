'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasSeenTour, markTourSeen } from '@/lib/authStore';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import './DemoTour.css';

const SELECTORS = [
    '[data-tour="add-code"]',
    '[data-tour="stats"]',
    '[data-tour="actions"]',
];

export default function DemoTour({ trigger = 0 }) {
    const router = useRouter();
    const { t } = useLanguage();
    const tour = t('tour');
    const STEPS = SELECTORS.map((selector, i) => ({ selector, ...tour.steps[i] }));
    const [active, setActive] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [rect, setRect] = useState(null);

    useEffect(() => {
        if (!hasSeenTour()) {
            setActive(true);
        }
    }, []);

    useEffect(() => {
        if (trigger > 0) {
            setStepIndex(0);
            setActive(true);
        }
    }, [trigger]);

    useEffect(() => {
        if (!active) return undefined;

        const target = document.querySelector(STEPS[stepIndex].selector);
        if (!target) return undefined;

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const update = () => setRect(target.getBoundingClientRect());
        update();
        const timer = setTimeout(update, 320);

        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [active, stepIndex]);

    const finish = () => {
        markTourSeen();
        setActive(false);
    };

    const handleNext = () => {
        if (stepIndex < STEPS.length - 1) {
            setStepIndex((i) => i + 1);
        } else {
            finish();
            router.push('/auth/signup');
        }
    };

    if (!active) return null;

    const step = STEPS[stepIndex];
    const padding = 8;

    const highlightStyle = rect
        ? {
            top: rect.top - padding,
            left: rect.left - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2,
        }
        : { opacity: 0 };

    const tooltipWidth = 300;
    const tooltipStyle = rect
        ? {
            top: Math.min(rect.bottom + 16, (typeof window !== 'undefined' ? window.innerHeight : 800) - 200),
            left: Math.min(Math.max(rect.left, 16), (typeof window !== 'undefined' ? window.innerWidth : 400) - tooltipWidth - 16),
        }
        : { opacity: 0 };

    return (
        <div className="tour-root">
            <button type="button" className="tour-skip-global" onClick={finish}>
                {tour.skip}
            </button>

            <div className="tour-highlight" style={highlightStyle} />

            <div className="tour-tooltip" style={{ ...tooltipStyle, width: tooltipWidth }}>
                <span className="tour-step-badge">{stepIndex + 1} / {STEPS.length}</span>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
                <div className="tour-actions">
                    <button type="button" className="tour-btn-skip" onClick={finish}>{tour.skipShort}</button>
                    <button type="button" className="tour-btn-next" onClick={handleNext}>
                        {stepIndex < STEPS.length - 1 ? tour.next : tour.finish}
                    </button>
                </div>
            </div>
        </div>
    );
}
