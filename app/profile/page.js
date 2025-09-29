'use client';

import { useState } from 'react';
import './page.css';

export default function ProfileEditPage() {
    const [formData, setFormData] = useState({
        email: 'user@example.com',
        nickname: '邀請碼達人',
        phone: '0912345678',
        birthday: '1990-01-01',
        gender: 'female',
        bio: '喜歡分享好用的邀請碼，讓大家一起省錢！',
        emailNotification: true,
        reportNotification: true,
        weeklyReport: false,
        marketingEmail: false,
        showStats: true,
        showProfile: false
    });

    const [socialConnections, setSocialConnections] = useState({
        google: true,
        line: false
    });

    const [alert, setAlert] = useState({ message: '', type: '' });

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle nickname validation
    const handleNicknameChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Real-time validation
        const input = e.target;
        if (value.trim().length < 2) {
            input.style.borderColor = '#dc3545';
        } else {
            input.style.borderColor = '#28a745';
        }
    };

    // Handle phone validation
    const handlePhoneChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Real-time validation
        const input = e.target;
        const phoneRegex = /^09\d{8}$/;
        if (value && !phoneRegex.test(value)) {
            input.style.borderColor = '#dc3545';
        } else {
            input.style.borderColor = '#e0e0e0';
        }
    };

    // Show alert message
    const showAlert = (message, type) => {
        setAlert({ message, type });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            setAlert({ message: '', type: '' });
        }, 5000);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '儲存中...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            showAlert('個人資料已成功更新！', 'success');
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
    };

    // Handle social account binding
    const handleSocialBinding = (platform) => {
        setSocialConnections(prev => {
            const isConnected = prev[platform];
            
            if (isConnected) {
                // Unbind
                if (confirm('確定要解除綁定嗎？')) {
                    showAlert('社交帳號已解除綁定', 'info');
                    return { ...prev, [platform]: false };
                }
                return prev;
            } else {
                // Bind
                showAlert('社交帳號綁定成功！', 'success');
                return { ...prev, [platform]: true };
            }
        });
    };

    // Handle account deletion
    const deleteAccount = () => {
        const confirmed = confirm('確定要刪除帳戶嗎？此操作無法復原，所有資料都會被永久刪除。');
        
        if (confirmed) {
            const doubleConfirm = confirm('最後確認：您真的要刪除帳戶嗎？');
            
            if (doubleConfirm) {
                showAlert('帳戶刪除申請已提交，我們會在 7 個工作天內處理完成。', 'warning');
            }
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1 className="profile-title">會員資料編輯</h1>
                <p className="profile-subtitle">管理您的個人資料和帳戶設定</p>
            </div>

            {/* 統計信息 */}
            <div className="stats-section">
                <h3 className="section-title">我的統計</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-number">5</div>
                        <div className="stat-label">已提供邀請碼</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">127</div>
                        <div className="stat-label">總使用次數</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">2</div>
                        <div className="stat-label">被檢舉次數</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">3</div>
                        <div className="stat-label">涵蓋平台數</div>
                    </div>
                </div>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
                {/* Alert Message */}
                {alert.message && (
                    <div className={`alert ${alert.type}`}>
                        {alert.message}
                    </div>
                )}

                {/* 基本資料 */}
                <div className="form-section">
                    <h3 className="section-title">基本資料</h3>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">電子郵件 *</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            disabled
                        />
                        <small style={{color: '#666', fontSize: '12px'}}>電子郵件地址無法修改</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="nickname">暱稱 *</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            id="nickname" 
                            name="nickname" 
                            placeholder="請輸入您的暱稱" 
                            value={formData.nickname}
                            onChange={handleNicknameChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="phone">手機號碼</label>
                        <input 
                            type="tel" 
                            className="form-input" 
                            id="phone" 
                            name="phone" 
                            placeholder="請輸入手機號碼" 
                            value={formData.phone}
                            onChange={handlePhoneChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="birthday">生日</label>
                        <input 
                            type="date" 
                            className="form-input" 
                            id="birthday" 
                            name="birthday" 
                            value={formData.birthday}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="gender">性別</label>
                        <select 
                            className="form-select" 
                            id="gender" 
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                        >
                            <option value="">請選擇</option>
                            <option value="male">男性</option>
                            <option value="female">女性</option>
                            <option value="other">其他</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="bio">個人簡介</label>
                        <textarea 
                            className="form-input form-textarea" 
                            id="bio" 
                            name="bio" 
                            placeholder="介紹一下自己..."
                            value={formData.bio}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* 社交帳號綁定 */}
                <div className="form-section">
                    <h3 className="section-title">社交帳號綁定</h3>
                    <div className="social-login-section">
                        <div className="social-buttons">
                            <button 
                                type="button"
                                className={`social-btn google ${socialConnections.google ? 'connected' : ''}`}
                                onClick={() => handleSocialBinding('google')}
                            >
                                <span className="social-icon">🟡</span>
                                Google {socialConnections.google ? '已綁定' : '綁定'}
                            </button>
                            <button 
                                type="button"
                                className={`social-btn line ${socialConnections.line ? 'connected' : ''}`}
                                onClick={() => handleSocialBinding('line')}
                            >
                                <span className="social-icon">🟢</span>
                                {socialConnections.line ? 'LINE 已綁定' : '綁定 LINE'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 通知設定 */}
                <div className="form-section">
                    <h3 className="section-title">通知設定</h3>
                    
                    <div className="form-group">
                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                className="checkbox-input" 
                                id="emailNotification" 
                                name="emailNotification" 
                                checked={formData.emailNotification}
                                onChange={handleInputChange}
                            />
                            <label className="checkbox-label" htmlFor="emailNotification">
                                接收電子郵件通知（邀請碼使用情況、系統公告等）
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                className="checkbox-input" 
                                id="reportNotification" 
                                name="reportNotification" 
                                checked={formData.reportNotification}
                                onChange={handleInputChange}
                            />
                            <label className="checkbox-label" htmlFor="reportNotification">
                                當邀請碼被檢舉時通知我
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                className="checkbox-input" 
                                id="weeklyReport" 
                                name="weeklyReport"
                                checked={formData.weeklyReport}
                                onChange={handleInputChange}
                            />
                            <label className="checkbox-label" htmlFor="weeklyReport">
                                接收每週使用統計報告
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                className="checkbox-input" 
                                id="marketingEmail" 
                                name="marketingEmail"
                                checked={formData.marketingEmail}
                                onChange={handleInputChange}
                            />
                            <label className="checkbox-label" htmlFor="marketingEmail">
                                接收行銷推廣訊息
                            </label>
                        </div>
                    </div>
                </div>

                {/* 隱私設定 */}
                <div className="form-section">
                    <h3 className="section-title">隱私設定</h3>
                    
                    <div className="form-group">
                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                className="checkbox-input" 
                                id="showStats" 
                                name="showStats" 
                                checked={formData.showStats}
                                onChange={handleInputChange}
                            />
                            <label className="checkbox-label" htmlFor="showStats">
                                公開顯示我的邀請碼使用統計
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                className="checkbox-input" 
                                id="showProfile" 
                                name="showProfile"
                                checked={formData.showProfile}
                                onChange={handleInputChange}
                            />
                            <label className="checkbox-label" htmlFor="showProfile">
                                允許其他會員查看我的個人資料
                            </label>
                        </div>
                    </div>
                </div>

                {/* 按鈕區域 */}
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">儲存變更</button>
                    <a href="/manageCode" className="btn btn-secondary">管理邀請碼</a>
                    <button type="button" className="btn btn-danger" onClick={deleteAccount}>刪除帳戶</button>
                </div>
            </form>
        </div>
    );
}