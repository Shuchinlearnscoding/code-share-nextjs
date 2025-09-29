// pages/register.js 或 app/register/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import styles from './app/auth/signup/page.css';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
        allowMarketing: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [socialLoading, setSocialLoading] = useState({
        google: false,
        facebook: false,
        line: false
    });
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        label: '未輸入',
        requirements: {
            length: false,
            lowercase: false,
            uppercase: false,
            number: false
        }
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 檢查是否已登入
    useEffect(() => {
        checkExistingSession();
        loadRememberedEmail();
    }, []);

    const checkExistingSession = async () => {
        const session = await getSession();
        if (session) {
            router.push('/');
        }
    };

    const loadRememberedEmail = () => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // 清除錯誤訊息
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // 密碼強度檢測
        if (name === 'password') {
            updatePasswordStrength(value);
            if (formData.confirmPassword) {
                validatePasswordMatch(value, formData.confirmPassword);
            }
        }

        // 確認密碼檢查
        if (name === 'confirmPassword') {
            validatePasswordMatch(formData.password, value);
        }

        // 即時驗證
        if (name === 'email' && value) {
            validateEmailRealtime(value);
        }
        if (name === 'nickname' && value) {
            validateNicknameRealtime(value);
        }
    };

    const updatePasswordStrength = (password) => {
        const requirements = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password)
        };

        const score = Object.values(requirements).filter(Boolean).length;
        const labels = ['未輸入', '弱', '普通', '良好', '強'];

        setPasswordStrength({
            score,
            label: password ? labels[score] : '未輸入',
            requirements
        });
    };

    const validateEmailRealtime = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            setErrors(prev => ({ ...prev, email: '請輸入有效的電子郵件地址' }));
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const validateNicknameRealtime = (nickname) => {
        if (nickname.length < 2) {
            setErrors(prev => ({ ...prev, nickname: '暱稱至少需要 2 個字元' }));
        } else if (nickname.length > 20) {
            setErrors(prev => ({ ...prev, nickname: '暱稱不能超過 20 個字元' }));
        } else {
            setErrors(prev => ({ ...prev, nickname: '' }));
        }
    };

    const validatePasswordMatch = (password, confirmPassword) => {
        if (confirmPassword && password !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: '兩次輸入的密碼不一致' }));
            return false;
        } else {
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
            return true;
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // 驗證電子郵件
        if (!formData.email) {
            newErrors.email = '請輸入電子郵件地址';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '請輸入有效的電子郵件地址';
        }

        // 驗證暱稱
        if (!formData.nickname) {
            newErrors.nickname = '請輸入暱稱';
        } else if (formData.nickname.length < 2) {
            newErrors.nickname = '暱稱至少需要 2 個字元';
        } else if (formData.nickname.length > 20) {
            newErrors.nickname = '暱稱不能超過 20 個字元';
        }

        // 驗證密碼
        if (!formData.password) {
            newErrors.password = '請輸入密碼';
        } else if (passwordStrength.score < 3) {
            newErrors.password = '密碼強度不足，請使用更安全的密碼';
        }

        // 驗證確認密碼
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = '請確認密碼';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '兩次輸入的密碼不一致';
        }

        // 驗證條款同意
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = '請同意使用條款和隱私政策';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showAlert('請檢查表單內容', 'error');
            shakeCard();
            return;
        }

        setLoading(true);

        try {
            // 呼叫註冊 API
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    nickname: formData.nickname,
                    password: formData.password,
                    allowMarketing: formData.allowMarketing
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('註冊成功！驗證郵件已發送到您的信箱，請查收並點擊驗證連結', 'success');
                
                // 重置表單
                setFormData({
                    email: '',
                    nickname: '',
                    password: '',
                    confirmPassword: '',
                    agreeTerms: false,
                    allowMarketing: false
                });
                setPasswordStrength({
                    score: 0,
                    label: '未輸入',
                    requirements: { length: false, lowercase: false, uppercase: false, number: false }
                });

                // 3秒後跳轉到登入頁面
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                showAlert(data.message || '註冊失敗，請稍後再試', 'error');
                shakeCard();
            }
        } catch (error) {
            console.error('註冊錯誤:', error);
            showAlert('註冊過程中發生錯誤，請稍後再試', 'error');
            shakeCard();
        } finally {
            setLoading(false);
        }
    };

    const handleSocialRegister = async (provider) => {
        setSocialLoading(prev => ({ ...prev, [provider]: true }));
        
        try {
            showAlert(`正在連接到 ${getProviderName(provider)}...`, 'info');

            const result = await signIn(provider, {
                callbackUrl: '/',
                redirect: false
            });

            if (result?.error) {
                showAlert(`${getProviderName(provider)} 註冊失敗`, 'error');
            } else {
                showAlert('註冊成功！正在跳轉...', 'success');
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            }
        } catch (error) {
            console.error(`${provider} 註冊錯誤:`, error);
            showAlert('社交註冊失敗，請稍後再試', 'error');
        } finally {
            setSocialLoading(prev => ({ ...prev, [provider]: false }));
        }
    };

    const getProviderName = (provider) => {
        const names = {
            google: 'Google',
            facebook: 'Facebook',
            line: 'LINE'
        };
        return names[provider] || provider;
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
        if (type === 'info' || type === 'error') {
            setTimeout(() => setAlert({ message: '', type: '' }), 5000);
        }
    };

    const shakeCard = () => {
        const card = document.querySelector(`.${styles.registerCard}`);
        if (card) {
            card.classList.add(styles.shake);
            setTimeout(() => card.classList.remove(styles.shake), 500);
        }
    };

    const togglePassword = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    const getStrengthClass = () => {
        const classes = ['', 'strengthWeak', 'strengthFair', 'strengthGood', 'strengthStrong'];
        return classes[passwordStrength.score] || '';
    };

    return (
        <>
            <Head>
                <title>註冊 - 邀請碼大全</title>
                <meta name="description" content="註冊邀請碼大全會員，開始分享您的邀請碼" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className={styles.registerContainer}>
                {/* 歡迎區域 */}
                <section className={styles.welcomeSection}>
                    <h1 className={styles.welcomeTitle}>加入邀請碼大全</h1>
                    <p className={styles.welcomeSubtitle}>註冊會員，開始您的邀請碼分享之旅</p>
                </section>

                <div className={`${styles.registerCard} ${styles.fadeIn}`}>
                    {/* 標題區域 */}
                    <div className={styles.authHeader}>
                        <h2 className={styles.authTitle}>會員註冊</h2>
                        <p className={styles.authSubtitle}>創建您的新帳戶</p>
                    </div>

                    {/* 警告訊息 */}
                    {alert.message && (
                        <div className={`${styles.alert} ${styles[alert.type]}`}>
                            {alert.message}
                        </div>
                    )}

                    {/* 社交註冊 */}
                    <div className={styles.socialLogin}>
                        <button
                            type="button"
                            onClick={() => handleSocialRegister('google')}
                            disabled={socialLoading.google}
                            className={`${styles.socialButton} ${styles.google}`}
                        >
                            {socialLoading.google ? (
                                <span className={styles.loadingSpinner}></span>
                            ) : (
                                <span className={styles.socialIcon}>🟡</span>
                            )}
                            使用 Google 註冊
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialRegister('facebook')}
                            disabled={socialLoading.facebook}
                            className={`${styles.socialButton} ${styles.facebook}`}
                        >
                            {socialLoading.facebook ? (
                                <span className={styles.loadingSpinner}></span>
                            ) : (
                                <span className={styles.socialIcon}>📘</span>
                            )}
                            使用 Facebook 註冊
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialRegister('line')}
                            disabled={socialLoading.line}
                            className={`${styles.socialButton} ${styles.line}`}
                        >
                            {socialLoading.line ? (
                                <span className={styles.loadingSpinner}></span>
                            ) : (
                                <span className={styles.socialIcon}>🟢</span>
                            )}
                            使用 LINE 註冊
                        </button>
                    </div>

                    <div className={styles.divider}>
                        <span>或使用電子郵件註冊</span>
                    </div>

                    {/* 註冊表單 */}
                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>
                                電子郵件 *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                                placeholder="請輸入您的電子郵件"
                                required
                            />
                            <div className={styles.formHelp}>我們會發送驗證郵件到此信箱</div>
                            {errors.email && (
                                <div className={styles.formError}>{errors.email}</div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="nickname" className={styles.formLabel}>
                                暱稱 *
                            </label>
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleInputChange}
                                className={`${styles.formInput} ${errors.nickname ? styles.error : ''}`}
                                placeholder="請輸入您的暱稱"
                                required
                            />
                            <div className={styles.formHelp}>2-20 個字元，可以是中文、英文或數字</div>
                            {errors.nickname && (
                                <div className={styles.formError}>{errors.nickname}</div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="registerPassword" className={styles.formLabel}>
                                密碼 *
                            </label>
                            <div className={styles.passwordInputGroup}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="registerPassword"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                                    placeholder="請設定您的密碼"
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => togglePassword('password')}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            
                            {/* 密碼強度指示器 */}
                            <div className={styles.passwordStrength}>
                                <div className={styles.strengthBar}>
                                    <div className={`${styles.strengthFill} ${styles[getStrengthClass()]}`}></div>
                                </div>
                                <div className={styles.strengthText}>
                                    密碼強度：{passwordStrength.label}
                                </div>
                                
                                <div className={styles.strengthRequirements}>
                                    <div className={`${styles.requirementItem} ${passwordStrength.requirements.length ? styles.met : ''}`}>
                                        <span className={styles.checkIcon}>
                                            {passwordStrength.requirements.length ? '✓' : ''}
                                        </span>
                                        至少 8 個字元
                                    </div>
                                    <div className={`${styles.requirementItem} ${passwordStrength.requirements.lowercase ? styles.met : ''}`}>
                                        <span className={styles.checkIcon}>
                                            {passwordStrength.requirements.lowercase ? '✓' : ''}
                                        </span>
                                        包含小寫字母
                                    </div>
                                    <div className={`${styles.requirementItem} ${passwordStrength.requirements.uppercase ? styles.met : ''}`}>
                                        <span className={styles.checkIcon}>
                                            {passwordStrength.requirements.uppercase ? '✓' : ''}
                                        </span>
                                        包含大寫字母
                                    </div>
                                    <div className={`${styles.requirementItem} ${passwordStrength.requirements.number ? styles.met : ''}`}>
                                        <span className={styles.checkIcon}>
                                            {passwordStrength.requirements.number ? '✓' : ''}
                                        </span>
                                        包含數字
                                    </div>
                                </div>
                            </div>
                            
                            <div className={styles.formHelp}>至少 8 個字元，包含英文字母和數字</div>
                            {errors.password && (
                                <div className={styles.formError}>{errors.password}</div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword" className={styles.formLabel}>
                                確認密碼 *
                            </label>
                            <div className={styles.passwordInputGroup}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`${styles.formInput} ${errors.confirmPassword ? styles.error : ''}`}
                                    placeholder="請再次輸入密碼"
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => togglePassword('confirm')}
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <div className={styles.formError}>{errors.confirmPassword}</div>
                            )}
                        </div>

                        <div className={`${styles.checkboxGroup} ${errors.agreeTerms ? styles.error : ''}`}>
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleInputChange}
                                className={styles.checkboxInput}
                                required
                            />
                            <label htmlFor="agreeTerms" className={styles.checkboxLabel}>
                                我已閱讀並同意{' '}
                                <Link href="/terms" className={styles.authLink}>
                                    使用條款
                                </Link>
                                {' '}和{' '}
                                <Link href="/privacy" className={styles.authLink}>
                                    隱私政策
                                </Link>
                            </label>
                        </div>
                        {errors.agreeTerms && (
                            <div className={styles.formError}>{errors.agreeTerms}</div>
                        )}

                        <div className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="allowMarketing"
                                name="allowMarketing"
                                checked={formData.allowMarketing}
                                onChange={handleInputChange}
                                className={styles.checkboxInput}
                            />
                            <label htmlFor="allowMarketing" className={styles.checkboxLabel}>
                                我同意接收電子報和行銷資訊
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.authButton}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.loadingSpinner}></span>
                                    註冊中...
                                </>
                            ) : (
                                '註冊帳戶'
                            )}
                        </button>
                    </form>

                    {/* 頁腳 */}
                    <div className={styles.authFooter}>
                        <p>
                            已經有帳戶？{' '}
                            <Link href="/login" className={styles.authLink}>
                                立即登入
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}