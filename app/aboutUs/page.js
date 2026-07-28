'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import BeeEmblem from '../components/BeeEmblem';
import './page.css';

export default function AboutPage() {
    const { t } = useLanguage();
    const statsObserverRef = useRef(null);
    const statsAnimatedRef = useRef(false);

    useEffect(() => {
        // 為卡片添加漸入動畫
        const cards = document.querySelectorAll('.feature-card, .team-member, .stat-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });
        
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });

        // 統計數字動畫
        const animateStats = () => {
            if (statsAnimatedRef.current) return;
            statsAnimatedRef.current = true;
            
            const statNumbers = document.querySelectorAll('.stat-number');
            
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
                let current = 0;
                const increment = target / 50;
                const suffix = stat.textContent.replace(/[0-9,]/g, '');
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    stat.textContent = Math.floor(current).toLocaleString() + suffix;
                }, 30);
            });
        };

        // 當統計區域進入視窗時觸發動畫
        statsObserverRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserverRef.current?.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const statsSection = document.querySelector('.stats-section');
        if (statsSection && statsObserverRef.current) {
            statsObserverRef.current.observe(statsSection);
        }

        // 清理函數
        return () => {
            observer.disconnect();
            if (statsObserverRef.current) {
                statsObserverRef.current.disconnect();
            }
        };
    }, []);

    // 處理聯絡連結點擊
    const handleContactClick = (e, href) => {
        if (href === '#') {
            e.preventDefault();
            alert(t('aboutUs.comingSoon'));
        }
    };

    // 平滑滾動
    const handleSmoothScroll = (e, targetId) => {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <div className="about-container">
            {/* Hero Section */}
            <section className="hero-section">
                <h1 className="hero-title">{t('aboutUs.heroTitle')}</h1>
                <p className="hero-subtitle">{t('aboutUs.heroSubtitle')}</p>
            </section>

            {/* 蜂巢命名故事 */}
            <section className="bee-story-section">
                <div className="bee-story-hex hex-1"></div>
                <div className="bee-story-hex hex-2"></div>
                <div className="bee-story-hex hex-3"></div>
                <div className="bee-icon-badge">🐝</div>
                <h2 className="bee-story-title">{t('aboutUs.beeStoryTitle')}</h2>
                <p className="bee-story-body">{t('aboutUs.beeStoryBody')}</p>
            </section>

            {/* 品牌故事 */}
            <section className="content-section">
                <h2 className="section-title">{t('aboutUs.storyTitle')}</h2>
                <div className="story-content">
                    {t('aboutUs.story').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                    ))}
                </div>
            </section>

            {/* Logo展示 */}
            <section className="logo-section">
                <div className="logo-container">
                    <div className="logo-item">
                        <BeeEmblem size={120} />
                        <div className="logo-description">{t('aboutUs.logoItems')[0].label}</div>
                    </div>
                </div>
                <p style={{color: '#666', textAlign: 'center', marginTop: '20px'}}>
                    {t('aboutUs.logoDesc')}
                </p>
            </section>

            {/* 平台特色 */}
            <section className="content-section">
                <h2 className="section-title">{t('aboutUs.featuresTitle')}</h2>
                <div className="features-grid">
                    {t('aboutUs.features').map((feature, i) => (
                        <div className="feature-card" key={i}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 平台數據 */}
            <section className="stats-section">
                <h2 className="stats-title">{t('aboutUs.statsTitle')}</h2>
                <div className="stats-grid">
                    {t('aboutUs.stats').map((stat, i) => (
                        <div className="stat-item" key={i}>
                            <div className="stat-number">{stat.number}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 團隊介紹 */}
            <section className="content-section">
                <h2 className="section-title">{t('aboutUs.teamTitle')}</h2>
                <div className="team-grid">
                    {t('aboutUs.team').map((member, i) => (
                        <div className="team-member" key={i}>
                            <div className="member-avatar">{member.avatar}</div>
                            <h3 className="member-name">{member.name}</h3>
                            <p className="member-role">{member.role}</p>
                            <p className="member-description">{member.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 願景使命 */}
            <section className="vision-section">
                <h2 className="vision-title">{t('aboutUs.visionTitle')}</h2>
                <div className="vision-content">
                    {t('aboutUs.vision').map((paragraph, i) => (
                        <p key={i} style={i > 0 ? {marginTop: '25px'} : undefined}>{paragraph}</p>
                    ))}
                </div>
            </section>

            {/* 家庭徽章 */}
            <section className="family-badge-section">
                <div className="family-badge-icon">
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="none">
                        <path d="M3 11L12 4l9 7" stroke="#023047" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 10v9h14v-9" stroke="#023047" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 19v-5h6v5" stroke="#023047" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h2 className="family-badge-title">{t('familyBadge.title')}</h2>
                <p className="family-badge-desc">{t('familyBadge.desc')}</p>
                <Link href="/auth/signup" className="family-badge-cta">{t('familyBadge.cta')}</Link>
            </section>

            {/* 聯絡資訊 */}
            <section className="contact-section">
                <h2 className="contact-title">{t('aboutUs.contactTitle')}</h2>
                <p style={{color: '#666', marginBottom: '30px'}}>
                    {t('aboutUs.contactDesc')}
                </p>
                <div className="contact-info">
                    {t('aboutUs.contactInfo').map((item, i) => (
                        <div className="contact-item" key={i}>
                            <div className="contact-icon">{item.icon}</div>
                            <div className="contact-text">
                                <a
                                    href={item.href}
                                    className="contact-link"
                                    onClick={(e) => handleContactClick(e, item.href)}
                                >
                                    {item.label}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #e0e0e0', color: '#666'}}>
                    <p><strong>{t('aboutUs.serviceHoursLabel')}</strong>{t('aboutUs.serviceHours')}</p>
                    <p><strong>{t('aboutUs.addressLabel')}</strong>{t('aboutUs.address')}</p>
                </div>
            </section>
        </div>
    );
}