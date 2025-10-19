// Pricing.tsx

import React, { useEffect } from 'react';
import './Pricing.css'; // Stil dosyasının var olduğunu varsayıyoruz

// --- GÜNCELLENMİŞ FİYATLANDIRMA VE LİMİTLER ---
// Bu veri yapısı, Home.tsx'teki PRICING_LIMITS ile uyumludur.
const PRICING_DATA = [
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
        id: 1035879, // 🚨 REPLACE with actual Lemon Squeezy ID
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
        id: 1035902, // 🚨 REPLACE with actual Lemon Squeezy ID
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
        id: 1035903, // 🚨 REPLACE with actual Lemon Squeezy ID
    },
];
// ------------------------------------------

interface PricingProps {
    setStep: (step: 'select' | 'home' | 'profile' | 'dashboard' | 'privacy' | 'terms') => void;
}

declare global {
    interface Window {
        LemonSqueezy: any; 
    }
}

const Pricing: React.FC<PricingProps> = ({ setStep }) => {
    const userId = localStorage.getItem('user_id'); 
    const LEMONSQUEEZY_STORE_URL = 'https://notixel.lemonsqueezy.com'; // 🚨 ENTER YOUR STORE URL

    useEffect(() => {
        if (!window.LemonSqueezy) {
            console.warn("Lemon Squeezy script is not loaded. Please check public/index.html.");
        }
    }, []);

    const handleCheckout = (variantId: number, planName: string) => {
        if (!userId) {
            alert("Please log in first. You are being redirected to the Home page.");
            setStep('home'); 
            return;
        }

        window.LemonSqueezy.Url.Open(`${LEMONSQUEEZY_STORE_URL}/checkout/buy/variant/${variantId}`, {
            embed: 1, 
            custom: {
                user_id: userId, 
                plan_name: planName,
            },
        });
    };
    
    // Buton metni ve aksiyonu için helper fonksiyon
    const getCtaProps = (plan: typeof PRICING_DATA[0]) => {
        const loggedInCtaText = plan.level === "Exclusive" ? "Go Exclusive" : "Subscribe Now";
        const ctaText = userId ? loggedInCtaText : 'Log in to Subscribe'; 
        
        const action = () => {
            if (userId) {
                handleCheckout(plan.id, plan.level);
            } else {
                setStep('home');
            }
        };
        return { ctaText, action };
    };


    return (
        <div className="pricing-page-container container">
            <header className="pricing-header">
                <h1>Choose Your Plan</h1>
                <p>Select the power you need for automatic and reliable data synchronization.</p>
            </header>

            <section className="pricing-cards-section">
                <div className="pricing-grid">
                    {PRICING_DATA.map((plan) => {
                        const { ctaText, action } = getCtaProps(plan);

                        return (
                            <div key={plan.level} className={`pricing-card ${plan.isPrimary ? 'primary-card' : ''}`}>
                                {plan.isPrimary && <div className="badge">Most Popular</div>}
                                
                                <h3>{plan.level}</h3>
                                <p className="price-description">{plan.description}</p>
                                <div className="price-tag">
                                    <span className="price-amount">{plan.price.split('/')[0]}</span>
                                    <span className="price-period">/{plan.price.split('/')[1]}</span>
                                </div>
                                
                                <button 
                                    onClick={action}
                                    className={`btn ${plan.isPrimary ? 'btn-primary' : 'btn-secondary'} btn-full`}
                                >
                                    {ctaText}
                                </button>
                                
                                <ul className="feature-list">
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>✅ {feature}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </section>
            
            <section className="faq-prompt">
                 <h2>Subscription Management</h2>
                 <p>You can easily upgrade, downgrade, or cancel your plan anytime from your Profile page. Service remains active until the end of the current billing period upon cancellation.</p>
                 <p>For more questions, please visit our <a href="#faq" onClick={(e) => {e.preventDefault(); setStep('home');}}>FAQ section</a> or reach out to our <a href="mailto:support@notixel.com">support team</a>.</p>
            </section>
        </div>
    );
};

export default Pricing;