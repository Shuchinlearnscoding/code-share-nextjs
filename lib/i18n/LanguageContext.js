'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { translations, LANGUAGES } from './translations';

const STORAGE_KEY = 'appLang';
const DEFAULT_LANG = 'zh-TW';

const LanguageContext = createContext(null);

function resolve(dict, path) {
    return path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), dict);
}

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(DEFAULT_LANG);

    useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (saved && LANGUAGES.includes(saved)) {
            setLangState(saved);
        }
    }, []);

    const setLang = (nextLang) => {
        if (!LANGUAGES.includes(nextLang)) return;
        setLangState(nextLang);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, nextLang);
        }
    };

    const t = (path, vars) => {
        const value = resolve(translations[lang], path);
        const result = value !== undefined ? value : (resolve(translations[DEFAULT_LANG], path) ?? path);
        if (vars && typeof result === 'string') {
            return Object.keys(vars).reduce(
                (str, key) => str.replaceAll(`{${key}}`, vars[key]),
                result
            );
        }
        return result;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return ctx;
}
