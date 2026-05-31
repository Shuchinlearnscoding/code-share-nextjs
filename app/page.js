'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    fetchReferralMatch,
    fetchReferralPlatforms,
    sendReferralEvent,
} from '@/lib/referralApi';
import './page.css';

const platformIcons = {
    Foodpanda: '🍔',
    Ubereats: '🛵',
    Uber: '🚗',
    Richart: '🏦',
    MOMO: '🛍️',
    環保集點: '🌱',
    街口支付: '🏪',
    蝦皮購物: '🛒',
};

function getPlatformIcon(platformName) {
    return platformIcons[platformName] || '🎁';
}

function getDisplayValue(inviteCode) {
    if (!inviteCode) return '';
    return inviteCode.code || '推薦連結';
}

export default function HomePage() {
    const [searchInput, setSearchInput] = useState('');
    const [platforms, setPlatforms] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [currentInviteCode, setCurrentInviteCode] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const searchContainerRef = useRef(null);
    const resultSectionRef = useRef(null);

    const popularPlatforms = useMemo(() => {
        const popular = platforms.filter((platform) => platform.isPopular && platform.codeCount > 0);
        return popular.length > 0 ? popular.slice(0, 6) : platforms.slice(0, 6);
    }, [platforms]);

    useEffect(() => {
        const loadPlatforms = async () => {
            try {
                const data = await fetchReferralPlatforms();
                setPlatforms(data.platforms || []);
            } catch (error) {
                showMessage('平台資料載入失敗，請稍後再試', 'error');
            }
        };

        loadPlatforms();
    }, []);

    const handleSearchInput = (value) => {
        setSearchInput(value);

        if (value.length === 0) {
            setShowSuggestions(false);
            return;
        }

        const searchTerm = value.toLowerCase();
        const matches = platforms
            .filter((platform) => platform.name.toLowerCase().includes(searchTerm))
            .slice(0, 8);

        setSuggestions(matches);
        setShowSuggestions(matches.length > 0);
    };

    const selectPlatform = (platform) => {
        setSearchInput(platform.name);
        setShowSuggestions(false);
        searchPlatform({ platformId: platform.id });
    };

    const searchPlatform = async ({ platformId, query } = {}) => {
        setIsLoading(true);

        try {
            const data = await fetchReferralMatch({ platformId, query });
            setCurrentInviteCode(data.inviteCode);
            displayResult();
        } catch (error) {
            setCurrentInviteCode(null);
            setShowResult(false);
            showMessage(error.message || '找不到可用的邀請碼', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const randomSearch = () => {
        const query = searchInput.trim();
        searchPlatform(query ? { query } : {});
    };

    const displayResult = () => {
        setShowResult(true);

        setTimeout(() => {
            if (resultSectionRef.current) {
                resultSectionRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, 100);
    };

    const useCode = async () => {
        if (!currentInviteCode) return;

        try {
            await sendReferralEvent({
                inviteCodeId: currentInviteCode.id,
                eventType: 'used',
            });

            if (currentInviteCode.referralUrl) {
                window.open(currentInviteCode.referralUrl, '_blank', 'noopener,noreferrer');
                showMessage('已為您開啟推薦連結', 'success');
                return;
            }

            if (currentInviteCode.code && navigator.clipboard) {
                await navigator.clipboard.writeText(currentInviteCode.code);
                showMessage('邀請碼已複製，祝您使用順利！', 'success');
                return;
            }

            showMessage('謝謝您的使用！', 'success');
        } catch (error) {
            showMessage('操作失敗，請稍後再試', 'error');
        }
    };

    const getNextCode = () => {
        if (currentInviteCode?.platformId) {
            searchPlatform({ platformId: currentInviteCode.platformId });
        }
    };

    const reportCode = async () => {
        if (!currentInviteCode) return;

        const confirmed = confirm('確定要舉報此邀請碼無法使用嗎？');
        if (!confirmed) return;

        try {
            await sendReferralEvent({
                inviteCodeId: currentInviteCode.id,
                eventType: 'reported',
            });
            showMessage('感謝您的回報，我們會盡快處理', 'info');

            setTimeout(() => {
                getNextCode();
            }, 1200);
        } catch (error) {
            showMessage('回報失敗，請稍後再試', 'error');
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });

        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            randomSearch();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div>
            <section className="hero-section">
                <h1 className="hero-title">邀請碼大全</h1>
                <p className="hero-subtitle">最完整的MGM推薦碼分享平台，輕鬆找到優質邀請碼</p>
            </section>

            <section className="search-section">
                <h2 className="search-title">搜尋邀請碼</h2>

                <div className="search-container" ref={searchContainerRef}>
                    <input
                        type="text"
                        className="search-input"
                        value={searchInput}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="搜尋平台名稱 (例如: Foodpanda, Uber...)"
                    />

                    <div className={`search-suggestions ${showSuggestions ? 'show' : ''}`}>
                        {suggestions.map((platform) => (
                            <div
                                key={platform.id}
                                className="suggestion-item"
                                onClick={() => selectPlatform(platform)}
                            >
                                {platform.name}
                                <span className="suggestion-category">{platform.categoryName}</span>
                            </div>
                        ))}
                    </div>

                    <button className="search-button" onClick={randomSearch} disabled={isLoading}>
                        {isLoading ? '搜尋中...' : '隨機獲取邀請碼'}
                    </button>
                </div>

                <div className="popular-platforms">
                    <h3 className="platforms-title">熱門平台</h3>
                    <div className="platforms-grid">
                        {popularPlatforms.map((platform) => (
                            <a
                                href="#"
                                key={platform.id}
                                className="platform-item"
                                onClick={(e) => {
                                    e.preventDefault();
                                    searchPlatform({ platformId: platform.id });
                                }}
                            >
                                <div className="platform-icon">{getPlatformIcon(platform.name)}</div>
                                <span className="platform-name">{platform.name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section
                className={`result-section ${showResult && currentInviteCode ? 'show' : ''}`}
                ref={resultSectionRef}
            >
                {currentInviteCode && (
                    <>
                        <p className="result-title">
                            已為您隨機配對到 <strong>{currentInviteCode.platformName}</strong> 的邀請碼
                        </p>

                        {currentInviteCode.activityDescription && (
                            <p className="result-description">{currentInviteCode.activityDescription}</p>
                        )}

                        <div className={`invite-code ${currentInviteCode.referralUrl ? 'link-value' : ''}`}>
                            {getDisplayValue(currentInviteCode)}
                        </div>

                        <div className="result-meta">
                            <span>{currentInviteCode.categoryName}</span>
                            <span>{currentInviteCode.verificationStatus === 'unverified' ? '尚未驗證' : '已驗證'}</span>
                        </div>

                        <div className="result-actions">
                            <button className="action-button btn-use" onClick={useCode}>
                                {currentInviteCode.referralUrl ? '開啟推薦連結' : '複製邀請碼'}
                            </button>
                            <button className="action-button btn-next" onClick={getNextCode}>
                                我想換一個
                            </button>
                            <button className="action-button btn-report" onClick={reportCode}>
                                Report<br />無法使用
                            </button>
                        </div>
                    </>
                )}

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </section>

            {!showResult && message.text && (
                <div className={`message floating-message ${message.type}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
