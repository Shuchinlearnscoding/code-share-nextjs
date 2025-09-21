'use client';

import { useState, useEffect, useRef } from 'react';
import './page.css';

// 平台資料庫 (模擬)
const platforms = [
    'Foodpanda', 'Uber', 'Uber Eats', 'Line Pay', '街口支付', 
    '環保集點', '蝦皮購物', 'PChome', 'momo購物', 'Yahoo購物',
    'GoShare', 'WeMo', '7-11', '全家', 'OK便利店',
    'Netflix', 'Disney+', 'Spotify', 'YouTube Premium', 'Apple Music'
];

// 模擬邀請碼資料庫
const inviteCodes = {
    'Foodpanda': ['FP123ABC', 'FP789XYZ', 'FP456DEF', 'FP999GHI'],
    'Uber': ['UB123456', 'UB789012', 'UB345678', 'UB901234'],
    'Line Pay': ['LP2024A1', 'LP2024B2', 'LP2024C3', 'LP2024D4'],
    '街口支付': ['JK001122', 'JK334455', 'JK667788', 'JK990011'],
    '環保集點': ['EC24AA11', 'EC24BB22', 'EC24CC33', 'EC24DD44'],
    '蝦皮購物': ['SP999888', 'SP777666', 'SP555444', 'SP333222']
};

export default function HomePage() {
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [currentPlatform, setCurrentPlatform] = useState('');
    const [currentCode, setCurrentCode] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const searchContainerRef = useRef(null);
    const resultSectionRef = useRef(null);

    // 搜尋輸入自動建議
    const handleSearchInput = (value) => {
        setSearchInput(value);
        
        if (value.length === 0) {
            setShowSuggestions(false);
            return;
        }
        
        const matches = platforms.filter(platform => 
            platform.toLowerCase().includes(value.toLowerCase())
        );
        
        if (matches.length > 0) {
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    // 選擇建議的平台
    const selectPlatform = (platform) => {
        setSearchInput(platform);
        setShowSuggestions(false);
        searchPlatform(platform);
    };

    // 搜尋特定平台
    const searchPlatform = (platform) => {
        setCurrentPlatform(platform);
        const codes = inviteCodes[platform];
        
        let code;
        if (codes && codes.length > 0) {
            code = codes[Math.floor(Math.random() * codes.length)];
        } else {
            // 如果沒有該平台的邀請碼，生成隨機碼
            code = generateRandomCode();
        }
        
        setCurrentCode(code);
        displayResult();
    };

    // 隨機搜尋
    const randomSearch = () => {
        if (searchInput.trim()) {
            // 如果有輸入平台名稱，搜尋該平台
            const matchedPlatform = platforms.find(platform => 
                platform.toLowerCase().includes(searchInput.toLowerCase())
            );
            
            if (matchedPlatform) {
                searchPlatform(matchedPlatform);
            } else {
                // 沒找到匹配的平台，使用輸入的名稱
                searchPlatform(searchInput);
            }
        } else {
            // 隨機選擇一個平台
            const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
            searchPlatform(randomPlatform);
        }
    };

    // 生成隨機邀請碼
    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    // 顯示結果
    const displayResult = () => {
        setShowResult(true);
        
        // 滾動到結果區域
        setTimeout(() => {
            if (resultSectionRef.current) {
                resultSectionRef.current.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 100);
    };

    // 使用邀請碼
    const useCode = () => {
        showMessage('謝謝您的使用！希望邀請碼對您有幫助 😊', 'success');
        console.log(`邀請碼 ${currentCode} (${currentPlatform}) 被使用`);
    };

    // 換下一個邀請碼
    const getNextCode = () => {
        if (currentPlatform) {
            searchPlatform(currentPlatform);
            showMessage('已為您更換新的邀請碼', 'info');
        }
    };

    // 舉報邀請碼
    const reportCode = () => {
        const confirmed = confirm('確定要舉報此邀請碼無法使用嗎？');
        if (confirmed) {
            showMessage('感謝您的回報，我們會盡快處理', 'info');
            console.log(`邀請碼 ${currentCode} (${currentPlatform}) 被舉報`);
            
            // 自動換下一個
            setTimeout(() => {
                getNextCode();
            }, 2000);
        }
    };

    // 顯示訊息
    const showMessage = (text, type) => {
        setMessage({ text, type });
        
        // 3秒後自動隱藏訊息
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    };

    // 處理鍵盤事件
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            randomSearch();
        }
    };

    // 點擊外部關閉建議選單
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
            {/* Hero Section */}
            <section className="hero-section">
                <h1 className="hero-title">邀請碼大全</h1>
                <p className="hero-subtitle">最完整的MGM推薦碼分享平台，輕鬆找到優質邀請碼</p>
            </section>

            {/* Search Section */}
            <section className="search-section">
                <h2 className="search-title">搜尋邀請碼</h2>
                
                <div className="search-container" ref={searchContainerRef}>
                    <input 
                        type="text" 
                        className="search-input"
                        value={searchInput}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="搜尋平台名稱 (例如: Foodpanda, Uber...)"
                    />
                    
                    {/* 搜尋建議下拉選單 */}
                    <div className={`search-suggestions ${showSuggestions ? 'show' : ''}`}>
                        {suggestions.map((platform, index) => (
                            <div 
                                key={index}
                                className="suggestion-item" 
                                onClick={() => selectPlatform(platform)}
                            >
                                {platform}
                            </div>
                        ))}
                    </div>
                    
                    <button className="search-button" onClick={randomSearch}>
                        隨機獲取邀請碼
                    </button>
                </div>
                
                {/* 熱門平台 */}
                <div className="popular-platforms">
                    <h3 className="platforms-title">熱門平台</h3>
                    <div className="platforms-grid">
                        <a href="#" className="platform-item" onClick={(e) => { e.preventDefault(); searchPlatform('Foodpanda'); }}>
                            <div className="platform-icon">🍔</div>
                            <span className="platform-name">Foodpanda</span>
                        </a>
                        <a href="#" className="platform-item" onClick={(e) => { e.preventDefault(); searchPlatform('Uber'); }}>
                            <div className="platform-icon">🚗</div>
                            <span className="platform-name">Uber</span>
                        </a>
                        <a href="#" className="platform-item" onClick={(e) => { e.preventDefault(); searchPlatform('Line Pay'); }}>
                            <div className="platform-icon">💰</div>
                            <span className="platform-name">Line Pay</span>
                        </a>
                        <a href="#" className="platform-item" onClick={(e) => { e.preventDefault(); searchPlatform('街口支付'); }}>
                            <div className="platform-icon">🏪</div>
                            <span className="platform-name">街口支付</span>
                        </a>
                        <a href="#" className="platform-item" onClick={(e) => { e.preventDefault(); searchPlatform('環保集點'); }}>
                            <div className="platform-icon">🌱</div>
                            <span className="platform-name">環保集點</span>
                        </a>
                        <a href="#" className="platform-item" onClick={(e) => { e.preventDefault(); searchPlatform('蝦皮購物'); }}>
                            <div className="platform-icon">🛒</div>
                            <span className="platform-name">蝦皮購物</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Result Section */}
            <section 
                className={`result-section ${showResult ? 'show' : ''}`} 
                ref={resultSectionRef}
            >
                <p className="result-title">
                    已為您隨機配對到 <strong>{currentPlatform}</strong> 的邀請碼
                </p>
                
                <div className="invite-code">{currentCode}</div>
                
                <div className="result-actions">
                    <button className="action-button btn-use" onClick={useCode}>
                        可用，謝謝
                    </button>
                    <button className="action-button btn-next" onClick={getNextCode}>
                        我想換一個
                    </button>
                    <button className="action-button btn-report" onClick={reportCode}>
                        Report<br />無法使用
                    </button>
                </div>
                
                {/* 訊息顯示區域 */}
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </section>
        </div>
    );
}