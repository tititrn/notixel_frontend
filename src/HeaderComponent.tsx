import React from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000'; 

// 🚨 KRİTİK: setStep tipi genişletildi ve userEmail eklendi.
interface HeaderProps {
    // Tüm navigasyon adımlarını içeriyor
    setStep: (step: 'home' | 'privacy' | 'terms' | 'connect' | 'dashboard' | 'profile') => void; 
    userEmail: string | null; // App.tsx'ten gelen kullanıcı e-postası
}

// 🚨 KRİTİK: userEmail prop'u burada karşılanmalı.
const HeaderComponent: React.FC<HeaderProps> = ({ setStep, userEmail }) => {
    
    // Kullanıcının giriş yapıp yapmadığını kontrol eder
    const loggedIn = !!userEmail; 
    
    return (
        <header className="header">
            <div className="container">
                {/* Logo: Tıklanınca ana sayfaya yönlendir */}
                <div className="logo" onClick={() => setStep('home')}>NotiXel</div> 
                
                <nav className="nav">
                    {/* Ana sayfadaki anchor linklere yönlendirme */}
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#faq">FAQ</a>

                    {/* Giriş yapmış kullanıcılar için Dashboard linki */}
                    {loggedIn && (
                        <a href="#" onClick={(e) => { e.preventDefault(); setStep('dashboard'); }}>
                            Dashboard
                        </a>
                    )}
                </nav>
                
                <div className="auth-buttons">
                    {/* --- KULLANICI GİRİŞ YAPMIŞSA (LOGGED IN) --- */}
                    {loggedIn ? (
                        <>
                            {/* 🚨 PROFİL BUTONU: Tıklanınca Profile sayfasına yönlendirir */}
                            <button
                                onClick={() => setStep('profile')}
                                className="btn btn-login"
                                title="Abonelik ve Profil Yönetimi"
                                style={{ 
                                    backgroundColor: '#4CAF50', 
                                    fontWeight: 'bold',
                                    cursor: 'pointer' 
                                }}
                            >
                                {userEmail} {/* E-posta adresi buton metni olarak görünür */}
                            </button>
                            
                        </>
                    ) : (
                        /* --- KULLANICI GİRİŞ YAPMAMIŞSA (LOGGED OUT) --- */
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