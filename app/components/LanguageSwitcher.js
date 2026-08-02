'use client';

import { useState } from 'react';
import { useLanguage } from '../../lib/i18n/LanguageContext';

function Flag({ code }) {
    if (code === 'zh-TW') {
        return (
            <svg viewBox="0 0 30 20" width="20" height="14" aria-hidden="true">
                <rect width="30" height="20" fill="#fe0000" />
                <rect width="15" height="10" fill="#000095" />
                <g fill="#fff" transform="translate(7.5,5)">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <rect key={i} x="-0.6" y="-4" width="1.2" height="4" transform={`rotate(${i * 30})`} />
                    ))}
                    <circle r="2.2" />
                </g>
            </svg>
        );
    }

    if (code === 'en') {
        return (
            <svg viewBox="0 0 60 40" width="20" height="14" aria-hidden="true">
                <rect width="60" height="40" fill="#00247d" />
                <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
                <path d="M0,0 L60,40 M60,0 L0,40" stroke="#cf142b" strokeWidth="3" />
                <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="13" />
                <path d="M30,0 V40 M0,20 H60" stroke="#cf142b" strokeWidth="7" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 30 20" width="20" height="14" aria-hidden="true">
            <rect width="30" height="20" fill="#fff" />
            <circle cx="15" cy="10" r="6" fill="#bc002d" />
        </svg>
    );
}

export default function LanguageSwitcher({ variant = 'desktop' }) {
    const { lang, setLang, t, languages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    if (variant === 'mobile') {
        return (
            <div className="lang-switcher-mobile">
                <div className="lang-switcher-mobile-label">{t('languageSwitcher.label')}</div>
                <div className="lang-switcher-mobile-options">
                    {languages.map((code) => (
                        <button
                            type="button"
                            key={code}
                            className={`lang-switcher-mobile-option ${lang === code ? 'active' : ''}`}
                            onClick={() => setLang(code)}
                        >
                            <Flag code={code} />
                            {t(`languageSwitcher.${code}`)}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className="lang-switcher"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                type="button"
                className="lang-switcher-trigger"
                aria-label={t('languageSwitcher.label')}
                aria-expanded={isOpen}
                onClick={() => setIsOpen((v) => !v)}
            >
                <Flag code={lang} />
            </button>
            <div className={`lang-switcher-menu ${isOpen ? 'show' : ''}`}>
                {languages.map((code) => (
                    <button
                        type="button"
                        key={code}
                        className={`lang-switcher-option ${lang === code ? 'active' : ''}`}
                        onClick={() => {
                            setLang(code);
                            setIsOpen(false);
                        }}
                    >
                        <Flag code={code} />
                        {t(`languageSwitcher.${code}`)}
                    </button>
                ))}
            </div>
        </div>
    );
}
