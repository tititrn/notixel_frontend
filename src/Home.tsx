import React from 'react';
import { ALL_FAQ_ITEMS } from './FAQPage';

// Projenizin backend'inde tanımladığınız Microsoft bağlantı URL'si
const MICROSOFT_CONNECT_URL = 'https://127.0.0.1:8000/connect/microsoft'; 

// --- GÜNCELLENMİŞ FİYATLANDIRMA VE LİMİTLER ---
// Kullanıcının istediği 4 plan (Free, Basic, Pro, Exclusive) bu yapıyı kullanır
const PRICING_LIMITS = [
    
    {
        level: 'Basic',
        description: 'Ideal for small projects and solo professionals who need reliability.',
        price: '$10/month',
        syncs: 3,
        interval: '1 Hour', 
        cta: 'Log in to Subscribe',
        isPrimary: false,
        features: [
            "Two-way Synchronization (Notion ↔ Excel)",
            "3 Auto Sync Jobs (Notion ↔ Excel)",
            "Every 1 Hour Sync Interval",
            "Unlimited Manual Syncs",
        ],
    },
    {
        level: 'Pro',
        description: 'Our most popular plan. Perfect for growing teams and serious data workflows.',
        price: '$20/month',
        syncs: 10,
        interval: '30 Minutes',
        cta: 'Log in to Subscribe',
        isPrimary: true, // EN ÇOK TAVSİYE EDİLEN PLAN
        features: [
            "Two-way Synchronization (Notion ↔ Excel)",
            "10 Auto Sync Jobs (Notion ↔ Excel)",
            "Every 30 Minutes Sync Interval",
            "Unlimited Manual Syncs",
        ],
    },
    {
        level: 'Exclusive',
        description: 'For large organizations and mission-critical, real-time data reporting.',
        price: '$50/month',
        syncs: 'Unlimited',
        interval: '15 Minutes',
        cta: 'Log in to Subscribe',
        isPrimary: false,
        features: [
            "Two-way Synchronization (Notion ↔ Excel)",
            "Unlimited Auto Sync Jobs (Notion ↔ Excel)",
            "Every 15 Minutes Sync Interval",
            "Unlimited Manual Syncs",
        ],
    },
];
// ------------------------------------------

// SSS Listesi
const HOME_FAQ_ITEMS = ALL_FAQ_ITEMS.slice(0, 3);

interface HomeProps {
    setStep: (step: 'connect' | 'dashboard' | 'pricing' | 'faq') => void; // setStep tipine 'faq' ekleyin
}

/**
 * Ana sayfa içeriğini (global header ve footer hariç) render eden bileşendir.
 * setStep prop'unu alması gereklidir, ancak şimdilik anchor linkler yeterlidir.
 */
const Home: React.FC<HomeProps> = ({ setStep }) => {
    return (
        <div className="home-page-container">
            {/* 2. HERO BÖLÜMÜ */}
            <section className="hero-section">
                <div className="container hero-content">
                    <div className="hero-text">
                        <h1>Stop Copy-Pasting Data Between Notion and Excel.</h1>
                        <p>Automate your data flow, keep reports up-to-date, and save hours every week. Setup takes less than a minute.</p>
                        <div className="hero-cta">
                            <a href={MICROSOFT_CONNECT_URL} className="btn btn-primary btn-lg">
                                Start Now
                            </a>
                            <a href="#features" className="btn btn-secondary btn-lg">
                                See How It Works
                            </a>
                        </div>
                    </div>
                    <div className="hero-image">
                        {/* Sync2Sheets'teki gibi bir görseliniz olduğunu varsayıyoruz */}
                        <img src="/assets/sync-visual.png" alt="Bi-directional Notion and Excel Synchronization Visual" />
                    </div>
                </div>
            </section>

            {/* 3. TRUST BADGES / ENTEGRASYON VURGUSU */}
            <section className="trust-section">
                <div className="container">
                    <p className="trust-title">Trusted by people who use:</p>
                    <div className="logo-grid">
                        <img src="/assets/notion-logo.svg" alt="Notion Logo" className="integration-logo" />
                        
                        <img src="/assets/excel-logo.svg" alt="Excel Logo" className="integration-logo" />
                    </div>
                </div>
            </section>

            {/* 4. ANA ÖZELLİKLER (NASIL ÇALIŞIR) */}
            <section id="features" className="steps-section">
                <div className="container">
                    <h2 className="section-title">Automate Your Data Flow in 3 Simple Steps</h2>
                    <div className="steps-grid">
                        <div className="step-card">
                            <span className="step-number">1</span>
                            <h3>Connect</h3>
                            <p>Securely link your Notion workspace and your Microsoft Excel file via official APIs. No complex setup or manual token handling.</p>
                        </div>
                        <div className="step-card">
                            <span className="step-number">2</span>
                            <h3>Map Columns</h3>
                            <p>Match your Excel columns to the corresponding Notion database properties. NotiXel can automatically create missing Notion columns for you.</p>
                        </div>
                        <div className="step-card">
                            <span className="step-number">3</span>
                            <h3>Set Sync Interval</h3>
                            <p>Select the sync direction (Excel → Notion or Notion → Excel) and Sit back and enjoy always up-to-date data.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. EK VURGULANACAK ÖZELLİKLER (Sosyal Kanıt yerine fayda) */}
            <section className="more-features-section">
                <div className="container">
                    <h2 className="section-title">Why Choose NotiXel?</h2>
                    <div className="feature-grid-detailed">
                        <div className="feature-item">
                            <h4>⚙️ Granular Column Sync</h4>
                            <p>You decide exactly which Excel columns match which Notion properties. Sync only the data you need and leave the rest untouched.</p>
                        </div>
                        <div className="feature-item">
                            <h4>🔑 Dedicated Sync ID System</h4>
                            <p>Each synchronized row is tracked with a unique ID, guaranteeing that NotiXel never updates the wrong record, even if you reorder your rows.</p>
                        </div>
                        <div className="feature-item">
                            <h4>⚡️ Instant Manual Sync</h4>
                            <p>Need a change pushed immediately? Run your configured sync job with a single click from the Dashboard, bypassing the auto-schedule.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* 6. FİYATLANDIRMA BÖLÜMÜ */}
            <section id="pricing" className="pricing-section">
                <div className="container">
                    <h2 className="section-title">Simple Pricing</h2>
                    <p className="pricing-subtitle">Start syncing. Upgrade as your data needs grow.</p>
                    <div className="pricing-grid">
                        {PRICING_LIMITS.map((plan) => (
                            <div key={plan.level} className={`pricing-card ${plan.isPrimary ? 'primary-card' : ''}`}>
                                <h3>{plan.level}</h3>
                                <p className="price-description">{plan.description}</p>
                                <div className="price-tag">
                                    <span className="price-amount">{plan.price.split('/')[0]}</span>
                                    {plan.price !== 'Free' && <span className="price-period">/{plan.price.split('/')[1]}</span>}
                                </div>
                                <a href={MICROSOFT_CONNECT_URL} className={`btn ${plan.isPrimary ? 'btn-primary' : 'btn-secondary'} btn-full`}>
                                    {plan.cta}
                                </a>
                                
                                <ul>
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>✅ {feature}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. SIKÇA SORULAN SORULAR (FAQ) BÖLÜMÜ */}
            <section id="faq" className="faq-section">
                <div className="container">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                    <div className="faq-list">
                        {/* Sadece ilk 3 soruyu gösteriyoruz */}
                        {HOME_FAQ_ITEMS.map((item, index) => (
                            <div key={index} className="faq-item">
                                <h4 className="faq-question">❓ {item.question}</h4>
                                <p className="faq-answer">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                    
                    {/* Tüm Sorular sayfasına yönlendirme butonu */}
                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                        {/* 🚨 setStep fonksiyonu burada güvenle kullanılabilir. */}
                        <a 
                            href="#faq"
                            onClick={(e) => { e.preventDefault(); setStep('faq'); }} // setStep doğru kullanılmış
                            className="btn btn-secondary" 
                        >
                            View Frequently Asked Questions →
                        </a>
                    </div>
                </div>
            </section>

            {/* 8. ALT CTA BÖLÜMÜ (FINAL CALL TO ACTION) */}
            <section className="final-cta-section">
                <div className="container">
                    <h2 className="section-title">Ready to Automate Your Data?</h2>
                    <p>Stop wasting time on manual data entry. Start syncing your Notion and Excel data in minutes.</p>
                    <a href={MICROSOFT_CONNECT_URL} className="btn btn-primary btn-lg final-cta-btn">
                        Start syncing Now 
                    </a>
                </div>
            </section>

            {/* 9. Footer (FooterComponent.tsx tarafından render ediliyor) */}
        </div>
    );
};

export default Home;