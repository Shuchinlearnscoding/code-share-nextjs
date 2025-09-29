'use client';

import { useEffect, useRef } from 'react';
import './page.css';

export default function AboutPage() {
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
            alert('功能即將推出，敬請期待！');
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
                <h1 className="hero-title">關於邀請碼大全</h1>
                <p className="hero-subtitle">打造最完整、最可靠的MGM推薦碼分享平台</p>
            </section>

            {/* 品牌故事 */}
            <section className="content-section">
                <h2 className="section-title">我們的故事</h2>
                <div className="story-content">
                    <p>
                        在這個數位化時代，各種線上服務如雨後春筍般出現，從外送平台到支付工具，從娛樂服務到購物網站，每個平台都推出了誘人的<span className="highlight-text">邀請獎勵機制</span>（MGM - Member Get Member）來吸引新用戶。
                    </p>
                    <p>
                        然而，我們發現了一個問題：<span className="highlight-text">資訊分散且不透明</span>。想要找到有效的邀請碼往往需要在各種社群媒體、論壇中搜尋，不僅耗時費力，還經常遇到過期或無效的邀請碼，讓使用者白白錯失優惠機會。
                    </p>
                    <p>
                        因此，「邀請碼大全」應運而生。我們希望建立一個<span className="highlight-text">透明、可信賴的平台</span>，讓所有人都能輕鬆找到最新、最有效的邀請碼，同時也讓願意分享的用戶能夠獲得應有的回饋。
                    </p>
                    <p>
                        我們相信，透過<span className="highlight-text">共享經濟的力量</span>，每個人都能成為這個生態系統的貢獻者和受益者，一起創造更美好的數位生活體驗。
                    </p>
                </div>
            </section>

            {/* Logo展示 */}
            <section className="logo-section">
                <div className="logo-container">
                    <div className="logo-item">
                        <div className="logo-image">邀</div>
                        <div className="logo-description">主要標誌</div>
                    </div>
                    <div className="logo-item">
                        <div className="logo-image" style={{background: 'linear-gradient(45deg, #28a745, #20c997)'}}>碼</div>
                        <div className="logo-description">簡化版本</div>
                    </div>
                </div>
                <p style={{color: '#666', textAlign: 'center', marginTop: '20px'}}>
                    我們的品牌標誌代表著<strong>連結、分享與信任</strong>
                </p>
            </section>

            {/* 平台特色 */}
            <section className="content-section">
                <h2 className="section-title">平台特色</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3 className="feature-title">智能搜尋</h3>
                        <p className="feature-description">
                            支援模糊搜尋和自動建議，快速找到您需要的平台邀請碼，節省寶貴時間。
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎲</div>
                        <h3 className="feature-title">隨機配對</h3>
                        <p className="feature-description">
                            公平的隨機分配機制，確保每個貢獻者都有平等的曝光機會。
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3 className="feature-title">品質保證</h3>
                        <p className="feature-description">
                            建立檢舉回報機制，自動淘汰無效邀請碼，維護平台品質。
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3 className="feature-title">數據透明</h3>
                        <p className="feature-description">
                            提供詳細的使用統計，讓用戶了解邀請碼的效果和受歡迎程度。
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3 className="feature-title">激勵機制</h3>
                        <p className="feature-description">
                            提供多樣平台邀請碼的用戶享有更高的推薦優先級。
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📱</div>
                        <h3 className="feature-title">響應式設計</h3>
                        <p className="feature-description">
                            完美適配各種設備，隨時隨地都能輕鬆使用我們的服務。
                        </p>
                    </div>
                </div>
            </section>

            {/* 平台數據 */}
            <section className="stats-section">
                <h2 className="stats-title">平台數據一覽</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-number">1,200+</div>
                        <div className="stat-label">活躍會員</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">50+</div>
                        <div className="stat-label">合作平台</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">8,500+</div>
                        <div className="stat-label">邀請碼總數</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">25,000+</div>
                        <div className="stat-label">成功使用次數</div>
                    </div>
                </div>
            </section>

            {/* 團隊介紹 */}
            <section className="content-section">
                <h2 className="section-title">團隊介紹</h2>
                <div className="team-grid">
                    <div className="team-member">
                        <div className="member-avatar">A</div>
                        <h3 className="member-name">Alex Chen</h3>
                        <p className="member-role">創辦人 & 產品總監</p>
                        <p className="member-description">
                            擁有10年產品開發經驗，專精於用戶體驗設計和平台架構規劃。
                        </p>
                    </div>
                    <div className="team-member">
                        <div className="member-avatar">S</div>
                        <h3 className="member-name">Sarah Wang</h3>
                        <p className="member-role">技術總監</p>
                        <p className="member-description">
                            全端工程師，負責平台的技術架構和安全性維護。
                        </p>
                    </div>
                    <div className="team-member">
                        <div className="member-avatar">M</div>
                        <h3 className="member-name">Mike Liu</h3>
                        <p className="member-role">營運總監</p>
                        <p className="member-description">
                            負責平台營運策略、合作夥伴關係和用戶社群經營。
                        </p>
                    </div>
                </div>
            </section>

            {/* 願景使命 */}
            <section className="vision-section">
                <h2 className="vision-title">我們的願景</h2>
                <div className="vision-content">
                    <p>
                        成為台灣最受信賴的邀請碼分享平台，讓每一次的推薦都能創造雙贏的價值。
                        我們致力於建立一個公平、透明、高效的生態系統，
                        讓用戶能夠輕鬆享受各種優惠，同時讓分享者獲得應有的回饋。
                    </p>
                    <p style={{marginTop: '25px'}}>
                        未來，我們希望將這個模式推廣到更多地區，
                        成為全球華語用戶首選的邀請碼分享平台。
                    </p>
                </div>
            </section>

            {/* 聯絡資訊 */}
            <section className="contact-section">
                <h2 className="contact-title">聯絡我們</h2>
                <p style={{color: '#666', marginBottom: '30px'}}>
                    有任何問題、建議或合作意向，歡迎隨時與我們聯繫
                </p>
                <div className="contact-info">
                    <div className="contact-item">
                        <div className="contact-icon">📧</div>
                        <div className="contact-text">
                            <a 
                                href="mailto:contact@invitecode.tw" 
                                className="contact-link"
                                onClick={(e) => handleContactClick(e, 'mailto:contact@invitecode.tw')}
                            >
                                contact@invitecode.tw
                            </a>
                        </div>
                    </div>
                    <div className="contact-item">
                        <div className="contact-icon">💬</div>
                        <div className="contact-text">
                            <a 
                                href="#" 
                                className="contact-link"
                                onClick={(e) => handleContactClick(e, '#')}
                            >
                                LINE 客服
                            </a>
                        </div>
                    </div>
                    <div className="contact-item">
                        <div className="contact-icon">📱</div>
                        <div className="contact-text">
                            <a 
                                href="#" 
                                className="contact-link"
                                onClick={(e) => handleContactClick(e, '#')}
                            >
                                Facebook 粉絲團
                            </a>
                        </div>
                    </div>
                </div>
                
                <div style={{marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #e0e0e0', color: '#666'}}>
                    <p><strong>客服時間：</strong>週一至週五 09:00-18:00</p>
                    <p><strong>地址：</strong>台北市信義區信義路五段7號</p>
                </div>
            </section>
        </div>
    );
}