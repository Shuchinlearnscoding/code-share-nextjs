'use client';

import { useState, useEffect } from 'react';
import { getAllReports, reactivateCode } from '@/lib/reportStore';
import './page.css';

export default function ManageCodePage() {
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
        setReportRecords(getAllReports());
    }, []);

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
        const action = code?.status === 'active' ? '下架' : '重新上架';
        
        if (confirm(`確定要${action}這個邀請碼嗎？`)) {
            console.log(`${action}邀請碼: ${codeId}`);
            showAlert(`邀請碼已${action}`, 'success');
        }
    };

    // Delete code
    const deleteCode = (codeId) => {
        if (confirm('確定要刪除這個邀請碼嗎？此操作無法復原。')) {
            console.log(`刪除邀請碼: ${codeId}`);
            showAlert('邀請碼已刪除', 'success');
        }
    };

    // Apply filter
    const applyFilter = () => {
        console.log('應用篩選:', filterData);
        showAlert('篩選已應用', 'info');
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = '儲存中...';
        submitBtn.disabled = true;

        setTimeout(() => {
            if (editingCodeId) {
                const target = codes.find((c) => c.id === editingCodeId);
                if (target?.status === 'suspended') {
                    confirmStillValid(editingCodeId);
                }
                showAlert('邀請碼更新成功，已重新上架！', 'success');
            } else {
                showAlert('邀請碼新增成功！', 'success');
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
        showAlert('邀請碼已重新上架！', 'success');
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
            case 'active': return '使用中';
            case 'inactive': return '已下架';
            case 'reported': return '被檢舉';
            case 'suspended': return '⚠️ 暫時下架';
            default: return '';
        }
    };

    return (
        <div className="manage-container">
            {/* 頁面標題 */}
            <div className="manage-header">
                <h1 className="manage-title">管理我的邀請碼</h1>
                <button className="add-code-btn" onClick={openAddModal}>
                    ➕ 新增邀請碼
                </button>
            </div>

            {/* 統計摘要 */}
            <div className="stats-summary">
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-number">{codes.length}</div>
                        <div className="stat-label">總邀請碼數</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{codes.filter(c => c.status === 'active').length}</div>
                        <div className="stat-label">使用中</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{codes.reduce((sum, c) => sum + c.usageCount, 0)}</div>
                        <div className="stat-label">總使用次數</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{codes.filter(c => c.reportCount > 0).length}</div>
                        <div className="stat-label">有回報紀錄</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">{codes.filter(c => c.status === 'suspended').length}</div>
                        <div className="stat-label">暫時下架</div>
                    </div>
                </div>
            </div>

            {/* 警告提示 */}
            <div className="warning-box">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                    <div className="warning-title">重要提醒</div>
                    <div className="warning-text">
                        • 每個平台最多只能新增 2 組邀請碼<br />
                        • 邀請碼累積 5 人回報後將暫時下架，請確認後重新上架<br />
                        • 設置越多不同平台的邀請碼，被推薦的機率越高
                    </div>
                </div>
            </div>

            {/* 篩選和搜尋 */}
            <div className="filter-section">
                <div className="filter-controls">
                    <div className="filter-group">
                        <label className="filter-label">搜尋平台</label>
                        <input 
                            type="text" 
                            className="filter-input" 
                            name="searchPlatform"
                            value={filterData.searchPlatform}
                            onChange={handleFilterChange}
                            placeholder="輸入平台名稱..."
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">狀態</label>
                        <select 
                            className="filter-select" 
                            name="filterStatus"
                            value={filterData.filterStatus}
                            onChange={handleFilterChange}
                        >
                            <option value="">全部狀態</option>
                            <option value="active">使用中</option>
                            <option value="inactive">已下架</option>
                            <option value="reported">被檢舉</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">排序</label>
                        <select 
                            className="filter-select" 
                            name="sortBy"
                            value={filterData.sortBy}
                            onChange={handleFilterChange}
                        >
                            <option value="created_desc">建立時間 (新到舊)</option>
                            <option value="created_asc">建立時間 (舊到新)</option>
                            <option value="usage_desc">使用次數 (高到低)</option>
                            <option value="usage_asc">使用次數 (低到高)</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <button className="filter-btn" onClick={applyFilter}>篩選</button>
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
                                此邀請碼已累積 5 人回報無法使用，請確認後重新上架
                            </div>
                        )}

                        <div className="code-value">{code.code}</div>

                        <div className="code-info">
                            <div className="info-item">
                                <div className="info-number">{code.usageCount}</div>
                                <div className="info-label">使用次數</div>
                            </div>
                            <div className="info-item">
                                <div className="info-number" style={{ color: code.reportCount >= 5 ? '#dc3545' : code.reportCount > 0 ? '#f08030' : undefined }}>
                                    {code.reportCount}
                                </div>
                                <div className="info-label">回報次數</div>
                            </div>
                            <div className="info-item">
                                <div className="info-number">{code.daysCreated}</div>
                                <div className="info-label">天前建立</div>
                            </div>
                            <div className="info-item">
                                <div className="info-number">{code.lastUsed}</div>
                                <div className="info-label">最後使用</div>
                            </div>
                        </div>

                        {code.reports.length > 0 && (
                            <div className="report-section">
                                <button className="report-toggle-btn" onClick={() => toggleReports(code.id)}>
                                    {expandedReports[code.id] ? '▲' : '▼'} 查看回報原因（{code.reports.length} 筆）
                                </button>
                                {expandedReports[code.id] && (
                                    <div className="report-list">
                                        {code.reports.map((r, i) => (
                                            <div key={i} className="report-item">
                                                <span className="report-time">{new Date(r.reportedAt).toLocaleDateString('zh-TW')}</span>
                                                <span className="report-reason">{r.reason || '（未填寫原因）'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="code-actions">
                            <button className="action-btn btn-edit" onClick={() => { editCode(code.id); if (code.status === 'suspended') confirmStillValid(code.id); }}>
                                編輯
                            </button>
                            {code.status === 'suspended' ? (
                                <button className="action-btn btn-toggle" onClick={() => confirmStillValid(code.id)}>
                                    確認仍有效
                                </button>
                            ) : (
                                <button
                                    className={`action-btn btn-toggle ${code.status === 'active' ? 'deactivate' : ''}`}
                                    onClick={() => toggleCode(code.id)}
                                >
                                    {code.status === 'active' ? '下架' : '重新上架'}
                                </button>
                            )}
                            <button className="action-btn btn-delete" onClick={() => deleteCode(code.id)}>
                                刪除
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
                            {editingCodeId ? '編輯邀請碼' : '新增邀請碼'}
                        </h2>
                        <button className="close-btn" onClick={closeModal}>&times;</button>
                    </div>
                    
                    <form className="modal-form" onSubmit={handleSubmit}>

                        {editingCodeId ? (
                            /* 編輯模式：平台固定不可更改 */
                            <div className="form-group">
                                <label className="form-label">平台名稱</label>
                                <div className="form-static">{formData.platform}</div>
                            </div>
                        ) : (
                            /* 新增模式：可選擇平台 */
                            <>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="platform">平台名稱 *</label>
                                    <select
                                        className="form-select"
                                        name="platform"
                                        value={formData.platform}
                                        onChange={handlePlatformChange}
                                        required
                                    >
                                        <option value="">請選擇平台</option>
                                        <option value="Foodpanda">Foodpanda</option>
                                        <option value="Uber">Uber</option>
                                        <option value="Ubereats">Uber Eats</option>
                                        <option value="街口支付">街口支付</option>
                                        <option value="悠遊付">悠遊付</option>
                                        <option value="環保集點">環保集點</option>
                                        <option value="蝦皮購物">蝦皮購物</option>
                                        <option value="Agoda">Agoda</option>
                                        <option value="other">其他 (請在下方說明)</option>
                                    </select>
                                    <div className="form-help">每個平台最多只能新增 2 組邀請碼</div>
                                </div>

                                {showCustomPlatform && (
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="customPlatform">自訂平台名稱 *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="customPlatform"
                                            value={formData.customPlatform}
                                            onChange={handleInputChange}
                                            placeholder="請輸入平台名稱"
                                            required={showCustomPlatform}
                                        />
                                        <div className="form-help">新平台需要管理員審核後才會顯示</div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="inviteCode">邀請碼 *</label>
                            <input
                                type="text"
                                className="form-input"
                                name="inviteCode"
                                value={formData.inviteCode}
                                onChange={handleInviteCodeChange}
                                placeholder="請輸入邀請碼"
                                required
                            />
                            <div className="form-help">通常為 6-10 位英數字組合，不含特殊符號</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="description">更新活動資訊 (選填)</label>
                            <textarea
                                className="form-input"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="描述優惠內容或使用方式，例如：新用戶首單折 $150..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="expiryDate">有效期限 (選填)</label>
                            <input
                                type="date"
                                className="form-input"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                            />
                            <div className="form-help">不填寫表示沒有期限</div>
                        </div>

                        <div className="form-buttons">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                取消
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingCodeId ? '確認送出' : '新增邀請碼'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}