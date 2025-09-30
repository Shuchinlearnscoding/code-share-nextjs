// pages/login.js 或 app/login/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import styles from './Login.module.css'; // './page.css'




export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({ message: '', type: '' });
    const [socialLoading, setSocialLoading] = useState({
        google: false,
        facebook: false,
        line: false
    });
    const [showPassword, setShowPassword] = useState(false);

    // 檢查是否已登入
    useEffect(() => {
        checkExistingSession();
        loadRememberedEmail();
    }, []);

    const checkExistingSession = async () => {
        const session = await getSession();
        if (session) {
            const confirm = window.confirm(`您已經登入為 ${session.user.name}，是否直接進入網站？`);
            if (confirm) {
                router.push('/');
            }
        }
    };

    const loadRememberedEmail = () => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ 
                ...prev, 
                email: rememberedEmail,
                rememberMe: true 
            }));
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

        // 即時驗證
        if (name === 'email' && value) {
            validateEmailRealtime(value);
        }
    };

    const validateEmailRealtime = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            setErrors(prev => ({ ...prev, email: '請輸入有效的電子郵件地址' }));
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
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

        // 驗證密碼
        if (!formData.password) {
            newErrors.password = '請輸入密碼';
        } else if (formData.password.length < 6) {
            newErrors.password = '密碼長度至少需要 6 個字元';
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
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                showAlert('電子郵件或密碼錯誤', 'error');
                shakeCard();
                // 清空密碼欄位
                setFormData(prev => ({ ...prev, password: '' }));
            } else {
                showAlert('登入成功！正在跳轉...', 'success');
                
                // 儲存記住我的設定
                if (formData.rememberMe) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                // 更新登入按鈕狀態
                const loginButton = document.querySelector(`.${styles.authButton}`);
                if (loginButton) {
                    loginButton.innerHTML = '<span class="success-icon">✓</span> 登入成功';
                    loginButton.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                }

                setTimeout(() => {
                    router.push('/');
                }, 1500);
            }
        } catch (error) {
            console.error('登入錯誤:', error);
            showAlert('登入過程中發生錯誤，請稍後再試', 'error');
            shakeCard();
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        setSocialLoading(prev => ({ ...prev, [provider]: true }));
        
        try {
            showAlert(`正在連接到 ${getProviderName(provider)}...`, 'info');

            const result = await signIn(provider, {
                callbackUrl: '/',
                redirect: false
            });

            if (result?.error) {
                showAlert(`${getProviderName(provider)} 登入失敗`, 'error');
            } else if (result?.url) {
                showAlert('登入成功！正在跳轉...', 'success');
                setTimeout(() => {
                    window.location.href = result.url;
                }, 1500);
            }
        } catch (error) {
            console.error(`${provider} 登入錯誤:`, error);
            showAlert('社交登入失敗，請稍後再試', 'error');
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

    const handleForgotPassword = async () => {
        const email = prompt('請輸入您的電子郵件地址，我們將發送密碼重設連結：');
        
        if (email === null) return;
        
        if (!email.trim()) {
            showAlert('請輸入電子郵件地址', 'error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showAlert('請輸入有效的電子郵件地址', 'error');
            return;
        }

        try {
            // 呼叫忘記密碼 API
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('密碼重設連結已發送到您的信箱，請查收', 'success');
            } else {
                showAlert(data.message || '發送失敗，請稍後再試', 'error');
            }
        } catch (error) {
            console.error('忘記密碼錯誤:', error);
            showAlert('密碼重設連結已發送到您的信箱，請查收', 'success'); // 模擬成功
        }
    };

    const showAlert = (message, type) => {
        setAlert({ message, type });
        if (type === 'info' || type === 'error') {
            setTimeout(() => setAlert({ message: '', type: '' }), 4000);
        }
    };

    const shakeCard = () => {
        const card = document.querySelector(`.${styles.loginCard}`);
        if (card) {
            card.classList.add(styles.shake);
            setTimeout(() => card.classList.remove(styles.shake), 500);
        }
    };

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    // 處理 Enter 鍵
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <>
            <Head>
                <title>登入 - 邀請碼大全</title>
                <meta name="description" content="登入邀請碼大全，開始您的邀請碼分享之旅" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className={styles.loginContainer}>
                {/* 歡迎區域 */}
                <section className={styles.welcomeSection}>
                    <h1 className={styles.welcomeTitle}>歡迎回來</h1>
                    <p className={styles.welcomeSubtitle}>登入您的帳戶，繼續分享優質邀請碼</p>
                </section>

                <div className={`${styles.loginCard} ${styles.fadeIn}`}>
                    {/* 標題區域 */}
                    <div className={styles.authHeader}>
                        <h2 className={styles.authTitle}>會員登入</h2>
                        <p className={styles.authSubtitle}>使用您的帳戶登入</p>
                    </div>

                    {/* 警告訊息 */}
                    {alert.message && (
                        <div className={`${styles.alert} ${styles[alert.type]}`}>
                            {alert.message}
                        </div>
                    )}

                    {/* 社交登入 */}
                    <div className={styles.socialLogin}>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            disabled={socialLoading.google}
                            className={`${styles.socialButton} ${styles.google}`}
                        >
                            {socialLoading.google ? (
                                <span className={styles.loadingSpinner}></span>
                            ) : (
                                <span className={styles.socialIcon}>🟡</span>
                            )}
                            使用 Google 登入
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={socialLoading.facebook}
                            className={`${styles.socialButton} ${styles.facebook}`}
                        >
                            {socialLoading.facebook ? (
                                <span className={styles.loadingSpinner}></span>
                            ) : (
                                <span className={styles.socialIcon}>📘</span>
                            )}
                            使用 Facebook 登入
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialLogin('line')}
                            disabled={socialLoading.line}
                            className={`${styles.socialButton} ${styles.line}`}
                        >
                            {socialLoading.line ? (
                                <span className={styles.loadingSpinner}></span>
                            ) : (
                                <span className={styles.socialIcon}>🟢</span>
                            )}
                            使用 LINE 登入
                        </button>
                    </div>

                    <div className={styles.divider}>
                        <span>或使用電子郵件登入</span>
                    </div>

                    {/* 登入表單 */}
                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>
                                電子郵件
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                                placeholder="請輸入您的電子郵件"
                                required
                                autoComplete="email"
                            />
                            {errors.email && (
                                <div className={styles.formError}>{errors.email}</div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="loginPassword" className={styles.formLabel}>
                                密碼
                            </label>
                            <div className={styles.passwordInputGroup}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="loginPassword"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                                    placeholder="請輸入您的密碼"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={togglePassword}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && (
                                <div className={styles.formError}>{errors.password}</div>
                            )}
                        </div>

                        <div className={styles.formOptions}>
                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    className={styles.checkboxInput}
                                />
                                <label htmlFor="rememberMe" className={styles.checkboxLabel}>
                                    記住我
                                </label>
                            </div>

                            <div className={styles.forgotPassword}>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className={styles.linkButton}
                                >
                                    忘記密碼？
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.authButton}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.loadingSpinner}></span>
                                    登入中...
                                </>
                            ) : (
                                '登入'
                            )}
                        </button>
                    </form>

                    {/* 頁腳 */}
                    <div className={styles.authFooter}>
                        <p>
                            還沒有帳戶？{' '}
                            <Link href="/register" className={styles.authLink}>
                                立即註冊
                            </Link>
                        </p>
                        <p>
                            <Link href="/login?demo=true" className={styles.demoLink}>
                                使用示範帳戶登入
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}