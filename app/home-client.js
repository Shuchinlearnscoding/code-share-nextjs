'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    fetchReferralMatch,
    sendReferralEvent,
} from '@/lib/referralApi';
import { hasReported, isSuspended, submitReport } from '@/lib/reportStore';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import HomeBanner from './components/HomeBanner';
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

function getDisplayValue(inviteCode, t) {
    if (!inviteCode) return '';
    return inviteCode.code || t('home.referralLinkFallback');
}

export default function HomeClient({ initialPlatforms = [] }) {
    const { t } = useLanguage();
    const [searchInput, setSearchInput] = useState('');
    const [platforms] = useState(initialPlatforms);
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
                showMessage(t('home.messages.linkOpened'), 'success');
                return;
            }

            if (currentInviteCode.code && navigator.clipboard) {
                await navigator.clipboard.writeText(currentInviteCode.code);
                showMessage(t('home.messages.codeCopied'), 'success');
                return;
            }

            showMessage(t('home.messages.thanksUse'), 'success');
        } catch (error) {
            showMessage(t('home.messages.actionFailed'), 'error');
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
            showMessage(t('home.messages.alreadyReported'), 'info');
            return;
        }

        const result = submitReport(currentInviteCode.id, reportReason.trim());
        setReportStep(null);
        setReportReason('');

        if (!result.ok) {
            showMessage(t('home.messages.alreadyReported'), 'info');
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
            showMessage(t('home.messages.reportedSuspended'), 'info');
        } else {
            showMessage(t('home.messages.reportedCount', { count: result.count }), 'info');
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
            <HomeBanner />

            <section className="search-section">
                <h2 className="search-title">{t('home.searchTitle')}</h2>

                <div className="search-container" ref={searchContainerRef}>
                    <input
                        type="text"
                        className="search-input"
                        value={searchInput}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('home.searchPlaceholder')}
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
                        {isLoading ? t('home.randomButtonLoading') : t('home.randomButton')}
                    </button>
                </div>

                <div className="popular-platforms">
                    <h3 className="platforms-title">{t('home.platformsTitle')}</h3>
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
                    <p className="no-codes-message">{t('home.noCodesMessage')}</p>
                ) : currentInviteCode ? (
                    <>
                        <p className="result-title">
                            {t('home.resultPrefix')} <strong>{currentInviteCode.platformName}</strong> {t('home.resultSuffix')}
                        </p>

                        {currentInviteCode.activityDescription && (
                            <p className="result-description">{currentInviteCode.activityDescription}</p>
                        )}

                        <div className={`invite-code ${currentInviteCode.referralUrl ? 'link-value' : ''}`}>
                            {getDisplayValue(currentInviteCode, t)}
                        </div>

                        <div className="result-meta">
                            <span>{currentInviteCode.categoryName}</span>
                            <span>{currentInviteCode.verificationStatus === 'unverified' ? t('home.unverified') : t('home.verified')}</span>
                        </div>

                        <div className="result-actions">
                            <button className="action-button btn-use" onClick={useCode}>
                                {currentInviteCode.referralUrl ? t('home.useCodeLink') : t('home.useCodeCopy')}
                            </button>
                            <button className="action-button btn-next" onClick={getNextCode}>
                                {t('home.next')}
                            </button>
                            <button className="action-button btn-report" onClick={openReportModal}>
                                {t('home.reportLine1')}<br />{t('home.reportLine2')}
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
                                <h3 className="report-modal-title">{t('home.report.confirmTitle')}</h3>
                                <p className="report-modal-desc">{t('home.report.confirmDesc')}</p>
                                <div className="report-modal-actions">
                                    <button className="report-btn-cancel" onClick={() => setReportStep(null)}>{t('home.report.cancel')}</button>
                                    <button className="report-btn-confirm" onClick={handleReportConfirm}>{t('home.report.confirmReport')}</button>
                                </div>
                            </>
                        )}

                        {reportStep === 'reason' && (
                            <>
                                <h3 className="report-modal-title">{t('home.report.reasonTitle')}</h3>
                                <p className="report-modal-desc">{t('home.report.reasonDesc')}</p>
                                <textarea
                                    className="report-reason-input"
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder={t('home.report.reasonPlaceholder')}
                                    rows={4}
                                />
                                <div className="report-modal-actions">
                                    <button className="report-btn-cancel" onClick={() => setReportStep(null)}>{t('home.report.cancel')}</button>
                                    <button className="report-btn-confirm" onClick={handleReportSubmit}>{t('home.report.submit')}</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
