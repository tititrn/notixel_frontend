import React from 'react';

const API_BASE_URL = 'https://127.0.0.1:8000'; 

interface HeaderProps {
    setStep: (
        step:
            | 'home'
            | 'privacy'
            | 'terms'
            | 'quick_start'
            | 'connect'
            | 'dashboard'
            | 'profile'
            | 'pricing'
            | 'select'
            | 'notion_connect'
            | 'mapping'
            | 'complete'
            | 'features'
    ) => void;
    userEmail: string | null;
}

const HeaderComponent: React.FC<HeaderProps> = ({ setStep, userEmail }) => {
    const loggedIn = !!userEmail;

    // 🔹 Ortak yönlendirme fonksiyonu
    const handleNavigate = (e: React.MouseEvent, target: string) => {
        e.preventDefault();
        window.location.hash = target; // URL hash güncelle
        setStep(target as any); // App state güncelle
    };

    return (
        <header className="header">
            <div className="container">
                {/* Logo */}
                <div className="logo" onClick={(e) => handleNavigate(e as any, 'home')}>
                    NotiXel
                </div>

                <nav className="nav">
                    <a href="#features" onClick={(e) => { e.preventDefault(); setStep('features'); }}>Features
                    </a>
                    <a href="#pricing" onClick={(e) => handleNavigate(e, 'pricing')}>
                        Pricing
                    </a>
                    <a href="#faq" onClick={(e) => handleNavigate(e, 'faq')}>
                        FAQ
                    </a>
                    <a href="#quick_start" onClick={(e) => handleNavigate(e, 'quick_start')}>
                        Quick Start
                    </a>
                </nav>

                <div className="auth-buttons">
                    {loggedIn ? (
                        <>
                            <button
                                onClick={(e) => handleNavigate(e as any, 'dashboard')}
                                className="btn btn-primary"
                                style={{ marginRight: '10px' }}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={(e) => handleNavigate(e as any, 'select')}
                                className="btn btn-primary"
                                style={{ marginRight: '10px' }}
                            >
                                ➕ New Sync
                            </button>
                            <button
                                onClick={(e) => handleNavigate(e as any, 'profile')}
                                className="btn btn-secondary"
                            >
                                {userEmail}
                            </button>
                        </>
                    ) : (
                        <a
                            href={`${API_BASE_URL}/connect/microsoft`}
                            className="btn btn-login"
                        >
                            Log in / Get Started
                        </a>
                    )}
                </div>
            </div>
        </header>
    );
};

export default HeaderComponent;
