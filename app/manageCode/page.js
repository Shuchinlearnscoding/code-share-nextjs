'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { getAllReports, reactivateCode } from '@/lib/reportStore';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import DemoTour from '../components/DemoTour';
import './page.css';

export default function ManageCodePage() {
    const router = useRouter();
    const session = authClient.useSession();
    const { t } = useLanguage();
    const [tourTrigger, setTourTrigger] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingCodeId, setEditingCodeId] = useState(null);
    const [formData, setFormData] = useState({
        platform: '',
        customPlatform: '',
        inviteCode: '',
        description: '',
        expiryDate: ''
    });
    const [showCustomPlatform, setShowCustomPlatform] = useState(false);
    const [filterData, setFilterData] = useState({
        searchPlatform: '',
        filterStatus: '',
        sortBy: 'created_desc'
    });

    const [reportRecords, setReportRecords] = useState({});

    useEffect(() => {
        if (!session.isPending && !session.data?.user) {
            router.replace('/auth/login');
        }
    }, [router, session.isPending, session.data?.user]);

    useEffect(() => {
        if (!session.data?.user) return;
        setReportRecords(getAllReports());
    }, [session.data?.user]);

    const MOCK_CODES = [
        {
            id: 'fp123abc',
            platform: 'Foodpanda',
            code: 'FP123ABC',
            status: 'active',
            usageCount: 45,
            daysCreated: 7,
            lastUsed: '今天'
        },
        {
            id: 'ub789xyz',
            platform: 'Uber',
            code: 'UB789XYZ',
            status: 'active',
            usageCount: 32,
            daysCreated: 12,
            lastUsed: '2天前'
        },
        {
            id: 'lp2024a1',
            platform: 'Line Pay',
            code: 'LP2024A1',
            status: 'active',
            usageCount: 8,
            daysCreated: 5,
            lastUsed: '4天前'
        },
        {
            id: 'jk001122',
            platform: '街口支付',
            code: 'JK001122',
            status: 'inactive',
            usageCount: 23,
            daysCreated: 20,
            lastUsed: '10天前'
        },
        {
            id: 'ec24aa11',
            platform: '環保集點',
            code: 'EC24AA11',
            status: 'active',
            usageCount: 19,
            daysCreated: 15,
            lastUsed: '1天前'
        }
    ];

    const codes = MOCK_CODES.map((c) => {
        const reports = reportRecords[c.id] || [];
        const reportCount = reports.length;
        const suspended = reportCount >= 5;
        return {
            ...c,
            reportCount,
            reports,
            status: suspended ? 'suspended' : c.status,
        };
    });

    const [expandedReports, setExpandedReports] = useState({});

    const toggleReports = (codeId) => {
        setExpandedReports((prev) => ({ ...prev, [codeId]: !prev[codeId] }));
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle filter input changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle platform selection
    const handlePlatformChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            platform: value
        }));
        setShowCustomPlatform(value === 'other');
    };

    // Handle invite code input formatting
    const handleInviteCodeChange = (e) => {
        const value = e.target.value.toUpperCase();
        const cleaned = value.replace(/[^A-Z0-9]/g, '');
        setFormData(prev => ({
            ...prev,
            inviteCode: cleaned
        }));
    };

    // Open add modal
    const openAddModal = () => {
        setEditingCodeId(null);
        setFormData({
            platform: '',
            customPlatform: '',
            inviteCode: '',
            description: '',
            expiryDate: ''
        });
        setShowCustomPlatform(false);
        setShowModal(true);
        document.body.style.overflow = 'hidden';
    };

    // Open edit modal
    const editCode = (codeId) => {
        const target = codes.find((c) => c.id === codeId);
        if (!target) return;

        setEditingCodeId(codeId);
        setFormData({
            platform: target.platform,
            customPlatform: '',
            inviteCode: target.code,
            description: '',
            expiryDate: ''
        });
        setShowCustomPlatform(false);
        setShowModal(true);
        document.body.style.overflow = 'hidden';
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        document.body.style.overflow = 'auto';
        setEditingCodeId(null);
        setShowCustomPlatform(false);
    };

    // Toggle code status
    const toggleCode = (codeId) => {
        const code = codes.find(c => c.id === codeId);
        const isActive = code?.status === 'active';
        const confirmMsg = isActive ? t('manageCode.alerts.confirmDeactivate') : t('manageCode.alerts.confirmReactivate');

        if (confirm(confirmMsg)) {
            showAlert(isActive ? t('manageCode.alerts.deactivated') : t('manageCode.alerts.reactivated'), 'success');
        }
    };

    // Delete code
    const deleteCode = (codeId) => {
        if (confirm(t('manageCode.alerts.confirmDelete'))) {
            showAlert(t('manageCode.alerts.deleted'), 'success');
        }
    };

    // Apply filter
    const applyFilter = () => {
        showAlert(t('manageCode.alerts.filterApplied'), 'info');
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = t('manageCode.modal.saving');
        submitBtn.disabled = true;

        setTimeout(() => {
            if (editingCodeId) {
                const target = codes.find((c) => c.id === editingCodeId);
                if (target?.status === 'suspended') {
                    confirmStillValid(editingCodeId);
                }
                showAlert(t('manageCode.alerts.updatedSuccess'), 'success');
            } else {
                showAlert(t('manageCode.alerts.addedSuccess'), 'success');
            }

            closeModal();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1000);
    };

    // Show alert message
    const showAlert = (message, type) => {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            font-weight: 500;
        `;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 3000);
    };

    // Handle modal click outside
    const handleModalClick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    };

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const confirmStillValid = (codeId) => {
        reactivateCode(codeId);
        setReportRecords(getAllReports());
        showAlert(t('manageCode.alerts.reactivated'), 'success');
    };

    // Get status class
    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'status-active';
            case 'inactive': return 'status-inactive';
            case 'reported': return 'status-reported';
            case 'suspended': return 'status-reported';
            default: return '';
        }
    };

    // Get status text
    const getStatusText = (status) => {
        switch (status) {
            case 'active': return t('manageCode.status.active');
            case 'inactive': return t('manageCode.status.inactive');
            case 'reported': return t('manageCode.status.reported');
            case 'suspended': return t('manageCode.status.suspended');
            default: return '';
        }
    };

    if (session.isPending || !session.data?.user) return null;

    return (
        <div className="manage-container">
            <DemoTour trigger={tourTrigger} />

            {/* 頁面標題 */}
            <div className="manage-header">
                <h1 className="manage-title">{t('manageCode.title')}</h1>
                <div className="manage-header-actions">
                    <button className="tutorial-mode-btn" onClick={() => setTourTrigger((n) => n + 1)}>
                        {t('manageCode.tutorialMode')}
                    </button>
                    <button className="add-code-btn" data-tour="add-code" onClick={openAddModal}>
                        {t('manageCode.addCode')}
                    </button>
                </div>
            </div>

            {/* 統計摘要 */}
            <div className="stats-summary" data-tour="stats">
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-number">{codes.length}</div>
                        <div className="stat-label">{t('manageCode.stats.total')}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{codes.filter(c => c.status === 'active').length}</div>
                        <div className="stat-label">{t('manageCode.stats.active')}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{codes.reduce((sum, c) => sum + c.usageCount, 0)}</div>
                        <div className="stat-label">{t('manageCode.stats.totalUsage')}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{codes.filter(c => c.reportCount > 0).length}</div>
                        <div className="stat-label">{t('manageCode.stats.reported')}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{codes.filter(c => c.status === 'suspended').length}</div>
                        <div className="stat-label">{t('manageCode.stats.suspended')}</div>
                    </div>
                </div>
            </div>

            {/* 警告提示 */}
            <div className="warning-box">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                    <div className="warning-title">{t('manageCode.warningTitle')}</div>
                    <div className="warning-text">
                        {t('manageCode.warningLines').map((line, i) => (
                            <span key={i}>• {line}<br /></span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 篩選和搜尋 */}
            <div className="filter-section">
                <div className="filter-controls">
                    <div className="filter-group">
                        <label className="filter-label">{t('manageCode.filter.searchLabel')}</label>
                        <input
                            type="text"
                            className="filter-input"
                            name="searchPlatform"
                            value={filterData.searchPlatform}
                            onChange={handleFilterChange}
                            placeholder={t('manageCode.filter.searchPlaceholder')}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">{t('manageCode.filter.statusLabel')}</label>
                        <select
                            className="filter-select"
                            name="filterStatus"
                            value={filterData.filterStatus}
                            onChange={handleFilterChange}
                        >
                            <option value="">{t('manageCode.filter.statusAll')}</option>
                            <option value="active">{t('manageCode.filter.statusActive')}</option>
                            <option value="inactive">{t('manageCode.filter.statusInactive')}</option>
                            <option value="reported">{t('manageCode.filter.statusReported')}</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">{t('manageCode.filter.sortLabel')}</label>
                        <select
                            className="filter-select"
                            name="sortBy"
                            value={filterData.sortBy}
                            onChange={handleFilterChange}
                        >
                            <option value="created_desc">{t('manageCode.filter.sortCreatedDesc')}</option>
                            <option value="created_asc">{t('manageCode.filter.sortCreatedAsc')}</option>
                            <option value="usage_desc">{t('manageCode.filter.sortUsageDesc')}</option>
                            <option value="usage_asc">{t('manageCode.filter.sortUsageAsc')}</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <button className="filter-btn" onClick={applyFilter}>{t('manageCode.filter.apply')}</button>
                    </div>
                </div>
            </div>

            {/* 邀請碼列表 */}
            <div className="codes-list">
                {codes.map((code) => (
                    <div key={code.id} className={`code-card ${code.status === 'inactive' ? 'inactive' : ''} ${code.status === 'reported' ? 'reported' : ''} ${code.status === 'suspended' ? 'reported' : ''}`}>
                        <div className="code-header">
                            <div className="code-platform">{code.platform}</div>
                            <div className={`code-status ${getStatusClass(code.status)}`}>
                                {getStatusText(code.status)}
                            </div>
                        </div>

                        {code.status === 'suspended' && (
                            <div className="suspended-notice">
                                {t('manageCode.suspendedNotice')}
                            </div>
                        )}

                        <div className="code-value">{code.code}</div>

                        <div className="code-info">
                            <div className="info-item">
                                <div className="info-number">{code.usageCount}</div>
                                <div className="info-label">{t('manageCode.info.usageCount')}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-number" style={{ color: code.reportCount >= 5 ? '#dc3545' : code.reportCount > 0 ? '#f08030' : undefined }}>
                                    {code.reportCount}
                                </div>
                                <div className="info-label">{t('manageCode.info.reportCount')}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-number">{code.daysCreated}</div>
                                <div className="info-label">{t('manageCode.info.daysCreated')}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-number">{code.lastUsed}</div>
                                <div className="info-label">{t('manageCode.info.lastUsed')}</div>
                            </div>
                        </div>

                        {code.reports.length > 0 && (
                            <div className="report-section">
                                <button className="report-toggle-btn" onClick={() => toggleReports(code.id)}>
                                    {expandedReports[code.id] ? '▲' : '▼'} {t('manageCode.alerts.viewReports', { count: code.reports.length })}
                                </button>
                                {expandedReports[code.id] && (
                                    <div className="report-list">
                                        {code.reports.map((r, i) => (
                                            <div key={i} className="report-item">
                                                <span className="report-time">{new Date(r.reportedAt).toLocaleDateString('zh-TW')}</span>
                                                <span className="report-reason">{r.reason || t('manageCode.alerts.noReportReason')}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="code-actions" data-tour="actions">
                            <button className="action-btn btn-edit" onClick={() => { editCode(code.id); if (code.status === 'suspended') confirmStillValid(code.id); }}>
                                {t('manageCode.actions.edit')}
                            </button>
                            {code.status === 'suspended' ? (
                                <button className="action-btn btn-toggle" onClick={() => confirmStillValid(code.id)}>
                                    {t('manageCode.actions.confirmValid')}
                                </button>
                            ) : (
                                <button
                                    className={`action-btn btn-toggle ${code.status === 'active' ? 'deactivate' : ''}`}
                                    onClick={() => toggleCode(code.id)}
                                >
                                    {code.status === 'active' ? t('manageCode.actions.deactivate') : t('manageCode.actions.reactivate')}
                                </button>
                            )}
                            <button className="action-btn btn-delete" onClick={() => deleteCode(code.id)}>
                                {t('manageCode.actions.delete')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 新增/編輯邀請碼彈窗 */}
            <div className={`modal-overlay ${showModal ? 'show' : ''}`} onClick={handleModalClick}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2 className="modal-title">
                            {editingCodeId ? t('manageCode.modal.editTitle') : t('manageCode.modal.addTitle')}
                        </h2>
                        <button className="close-btn" onClick={closeModal}>&times;</button>
                    </div>

                    <form className="modal-form" onSubmit={handleSubmit}>

                        {editingCodeId ? (
                            /* 編輯模式：平台固定不可更改 */
                            <div className="form-group">
                                <label className="form-label">{t('manageCode.modal.platformLabel')}</label>
                                <div className="form-static">{formData.platform}</div>
                            </div>
                        ) : (
                            /* 新增模式：可選擇平台 */
                            <>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="platform">{t('manageCode.modal.platformRequired')}</label>
                                    <select
                                        className="form-select"
                                        name="platform"
                                        value={formData.platform}
                                        onChange={handlePlatformChange}
                                        required
                                    >
                                        <option value="">{t('manageCode.modal.platformPlaceholder')}</option>
                                        <option value="Foodpanda">Foodpanda</option>
                                        <option value="Uber">Uber</option>
                                        <option value="Ubereats">Uber Eats</option>
                                        <option value="街口支付">街口支付</option>
                                        <option value="悠遊付">悠遊付</option>
                                        <option value="環保集點">環保集點</option>
                                        <option value="蝦皮購物">蝦皮購物</option>
                                        <option value="Agoda">Agoda</option>
                                        <option value="other">{t('manageCode.modal.other')}</option>
                                    </select>
                                    <div className="form-help">{t('manageCode.modal.platformHelp')}</div>
                                </div>

                                {showCustomPlatform && (
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="customPlatform">{t('manageCode.modal.customPlatformLabel')}</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="customPlatform"
                                            value={formData.customPlatform}
                                            onChange={handleInputChange}
                                            placeholder={t('manageCode.modal.customPlatformPlaceholder')}
                                            required={showCustomPlatform}
                                        />
                                        <div className="form-help">{t('manageCode.modal.customPlatformHelp')}</div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="inviteCode">{t('manageCode.modal.codeLabel')}</label>
                            <input
                                type="text"
                                className="form-input"
                                name="inviteCode"
                                value={formData.inviteCode}
                                onChange={handleInviteCodeChange}
                                placeholder={t('manageCode.modal.codePlaceholder')}
                                required
                            />
                            <div className="form-help">{t('manageCode.modal.codeHelp')}</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="description">{t('manageCode.modal.descLabel')}</label>
                            <textarea
                                className="form-input"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder={t('manageCode.modal.descPlaceholder')}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="expiryDate">{t('manageCode.modal.expiryLabel')}</label>
                            <input
                                type="date"
                                className="form-input"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                            />
                            <div className="form-help">{t('manageCode.modal.expiryHelp')}</div>
                        </div>

                        <div className="form-buttons">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                {t('manageCode.modal.cancel')}
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingCodeId ? t('manageCode.modal.submitEdit') : t('manageCode.modal.submitAdd')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
