'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    fetchReferralMatch,
    fetchReferralPlatforms,
    sendReferralEvent,
} from '@/lib/referralApi';
import { hasReported, isSuspended, submitReport } from '@/lib/reportStore';
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
    Agoda: '🏨',
    悠遊付: '🚇',
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
    const [excludeIds, setExcludeIds] = useState([]);
    const [noMoreCodes, setNoMoreCodes] = useState(false);

    // Report modal states: null | 'confirm' | 'reason'
    const [reportStep, setReportStep] = useState(null);
    const [reportReason, setReportReason] = useState('');

    const searchContainerRef = useRef(null);
    const resultSectionRef = useRef(null);

    const popularPlatforms = useMemo(() => {
        const popular = platforms.filter((platform) => platform.isPopular && platform.codeCount > 0);
        return popular.length > 0 ? popular.slice(0, 8) : platforms.slice(0, 8);
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
        setExcludeIds([]);
        setNoMoreCodes(false);
        searchPlatform({ platformId: platform.id, excludeIds: [] });
    };

    const searchPlatform = async ({ platformId, query, excludeIds: ids = excludeIds } = {}) => {
        setIsLoading(true);
        setNoMoreCodes(false);

        try {
            const data = await fetchReferralMatch({ platformId, query, excludeIds: ids });
            const code = data.inviteCode;

            if (isSuspended(code.id)) {
                // Skip suspended codes by adding to excludeIds and retrying
                const newExcludeIds = [...ids, code.id];
                setExcludeIds(newExcludeIds);
                const retry = await fetchReferralMatch({ platformId, query, excludeIds: newExcludeIds }).catch(() => null);
                if (!retry) {
                    setNoMoreCodes(true);
                    setShowResult(false);
                    setIsLoading(false);
                    return;
                }
                setCurrentInviteCode(retry.inviteCode);
            } else {
                setCurrentInviteCode(code);
            }

            displayResult();
        } catch (error) {
            setCurrentInviteCode(null);
            setShowResult(false);
            setNoMoreCodes(true);
        } finally {
            setIsLoading(false);
        }
    };

    const randomSearch = () => {
        const query = searchInput.trim();
        setExcludeIds([]);
        setNoMoreCodes(false);
        searchPlatform(query ? { query, excludeIds: [] } : { excludeIds: [] });
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
        if (!currentInviteCode?.platformId) return;
        const newExcludeIds = [...excludeIds, currentInviteCode.id];
        setExcludeIds(newExcludeIds);
        searchPlatform({ platformId: currentInviteCode.platformId, excludeIds: newExcludeIds });
    };

    // Step 1: open confirm dialog
    const openReportModal = () => {
        setReportStep('confirm');
        setReportReason('');
    };

    // Step 2: move to reason input
    const handleReportConfirm = () => {
        setReportStep('reason');
    };

    // Step 3: submit report
    const handleReportSubmit = async () => {
        if (!currentInviteCode) return;

        if (hasReported(currentInviteCode.id)) {
            setReportStep(null);
            showMessage('您已回報過此邀請碼', 'info');
            return;
        }

        const result = submitReport(currentInviteCode.id, reportReason.trim());
        setReportStep(null);
        setReportReason('');

        if (!result.ok) {
            showMessage('您已回報過此邀請碼', 'info');
            return;
        }

        try {
            await sendReferralEvent({
                inviteCodeId: currentInviteCode.id,
                eventType: 'reported',
                reason: reportReason.trim(),
            });
        } catch {
            // Non-blocking: event logging failure shouldn't block UX
        }

        if (result.suspended) {
            showMessage('感謝回報！此邀請碼已累積 5 次回報，暫時下架待擁有者確認', 'info');
        } else {
            showMessage(`感謝回報！目前已有 ${result.count} 人回報此邀請碼`, 'info');
        }

        // Move to next code, excluding this one
        const newExcludeIds = [...excludeIds, currentInviteCode.id];
        setExcludeIds(newExcludeIds);

        try {
            const data = await fetchReferralMatch({
                platformId: currentInviteCode.platformId,
                excludeIds: newExcludeIds,
            });
            setCurrentInviteCode(data.inviteCode);
            displayResult();
        } catch {
            setCurrentInviteCode(null);
            setShowResult(false);
            setNoMoreCodes(true);
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });

        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 4000);
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
                                    selectPlatform(platform);
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
                className={`result-section ${showResult && (currentInviteCode || noMoreCodes) ? 'show' : ''}`}
                ref={resultSectionRef}
            >
                {noMoreCodes && !currentInviteCode ? (
                    <p className="no-codes-message">目前沒有可以使用的邀請碼</p>
                ) : currentInviteCode ? (
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
                            <button className="action-button btn-report" onClick={openReportModal}>
                                Report<br />無法使用
                            </button>
                        </div>
                    </>
                ) : null}

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

            {/* Report Modal */}
            {reportStep && (
                <div className="report-modal-overlay" onClick={(e) => { if (e.target.classList.contains('report-modal-overlay')) setReportStep(null); }}>
                    <div className="report-modal">
                        {reportStep === 'confirm' && (
                            <>
                                <h3 className="report-modal-title">確認回報失效？</h3>
                                <p className="report-modal-desc">確認回報此邀請碼無法使用嗎？<br />累積 5 人回報後將暫時下架。</p>
                                <div className="report-modal-actions">
                                    <button className="report-btn-cancel" onClick={() => setReportStep(null)}>取消</button>
                                    <button className="report-btn-confirm" onClick={handleReportConfirm}>確認回報</button>
                                </div>
                            </>
                        )}

                        {reportStep === 'reason' && (
                            <>
                                <h3 className="report-modal-title">請說明原因（選填）</h3>
                                <p className="report-modal-desc">您的回報將幫助邀請碼擁有者了解問題</p>
                                <textarea
                                    className="report-reason-input"
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="例如：街口支付的活動已於 2024.12.31 截止"
                                    rows={4}
                                />
                                <div className="report-modal-actions">
                                    <button className="report-btn-cancel" onClick={() => setReportStep(null)}>取消</button>
                                    <button className="report-btn-confirm" onClick={handleReportSubmit}>送出回報</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
