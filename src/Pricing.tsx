// Pricing.tsx

import React, { useEffect } from 'react';
import './Pricing.css'; // Stil dosyasının var olduğunu varsayıyoruz

// 🚨 KRİTİK: Bu ID'leri Lemon Squeezy panelinizdeki ilgili "Product Variant" ID'leriyle DEĞİŞTİRMELİSİNİZ.
const PLAN_VARIANTS = {
    BASIC: {
        id: 12345, // REPLACE with actual ID
        price: "10", // $10
        name: "Basic",
        features: [
            "Two-way Synchronization (Notion ↔ Excel)", 
            "3 Auto Sync Jobs (Notion ↔ Excel)", 
            "Every 1 Hour Sync Interval", 
            "Unlimited Manual Syncs",
            
        ],
    },
    PRO: {
        id: 67890, // REPLACE with actual ID
        price: "20", // $20
        name: "Pro",
        features: [
            "Two-way Synchronization (Notion ↔ Excel)", 
            "10 Auto Sync Jobs (Notion ↔ Excel)", 
            "Every 30 Minutes Sync Interval", 
            "Unlimited Manual Syncs",
            
        ],
    },
    EXCLUSIVE: {
        id: 11223, // REPLACE with actual ID
        price: "50", // $50
        name: "Exclusive",
        features: [
            "Two-way Synchronization (Notion ↔ Excel)", 
            "Unlimited Auto Sync Jobs (Notion ↔ Excel)", 
            "Every 15 Minutes Sync Interval", 
            "Unlimited Manual Syncs",
    
        ],
    },
};

interface PricingProps {
    setStep: (step: 'select' | 'home' | 'profile' | 'dashboard') => void;
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
    
    // If not logged in, the CTA button redirects to Home (Login)
    const ctaText = userId ? 'Subscribe Now' : 'Log in to Subscribe'; 
    const ctaAction = (planId: number, planName: string) => userId ? handleCheckout(planId, planName) : setStep('home');

    return (
        <div className="pricing-page-container container">
            <header className="pricing-header">
                <h1>Choose Your NotiXel Synchronization Plan</h1>
                <p>Select the power you need for seamless, automatic, and reliable data synchronization.</p>
            </header>

            <section className="pricing-cards-section">
                <div className="pricing-grid">
                    {Object.values(PLAN_VARIANTS).map((plan) => (
                        <div key={plan.name} className={`pricing-card ${plan.name.toLowerCase()}`}>
                            <div>
                                <h2>{plan.name}</h2>
                                <p className="price">
                                    ${plan.price}<span>/month</span>
                                </p>
                                
                                <ul className="feature-list">
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>✅ {feature}</li>
                                    ))}
                                </ul>
                            </div>
                            
                            <button 
                                onClick={() => ctaAction(plan.id, plan.name)}
                                className="btn btn-primary cta-btn"
                            >
                                {plan.name === "Pro" ? "Most Popular: " : ""}
                                {ctaText}
                            </button>
                        </div>
                    ))}
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