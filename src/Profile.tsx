import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns'; // Tarih formatlama için
import './Profile.css'; 
import { tr } from 'date-fns/locale';

// Backend ve Lemon Squeezy URL'leri
const API_BASE_URL = 'https://127.0.0.1:8000';
// 🚨 KRİTİK: Kendi Lemon Squeezy Store URL'niz
const LEMONSQUEEZY_STORE_URL = 'https://notixel.lemonsqueezy.com'; 

// 🚨 KRİTİK: subscription.py ve Pricing.tsx ile EŞLEŞMELİDİR
const PLAN_VARIANTS: { [key: string]: { id: number; price: string; cta_text: string } } = {
    basic: { id: 1035879, price: "10", cta_text: "Basic" }, 
    pro: { id: 1035902, price: "20", cta_text: "Pro" },
    exclusive: { id: 1035903, price: "50", cta_text: "Exclusive" },
};

// API'den gelen verinin yapısı (UserSubscriptionStatus Pydantic modeline karşılık gelir)
interface SubscriptionStatus {
    email: string;
    subscription_level: string; // 'free', 'basic', 'pro', 'exclusive'
    is_subscription_active: boolean; // Ödenen dönem içinde aktif mi?
    subscription_end_date: string | null; // Bitiş tarihi (ISO formatında string)
}

// Config.py'deki limitleri göstermek için basit bir map
const LIMITS: { [key: string]: { label: string; syncs: number; interval: number } } = {
    free: { label: "Free (Varsayılan)", syncs: 0, interval: 60 },
    basic: { label: "Basic Plan", syncs: 3, interval: 60 },
    pro: { label: "Pro Plan", syncs: 10, interval: 30 },
    exclusive: { label: "Exclusive Plan", syncs: 9999, interval: 15 },
};

interface ProfileProps {
    setStep: (step: 'home' | 'connect') => void; // Hesap silindikten sonra yönlendirme için
}

const Profile: React.FC<ProfileProps> = ({ setStep }) => {
    const userId = localStorage.getItem('user_id');
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- 1. Abonelik Durumunu Çekme ---
    const fetchSubscriptionStatus = useCallback(async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/subscription/status/${id}`);
            if (!response.ok) {
                throw new Error("Abonelik durumu alınamadı.");
            }
            const data: SubscriptionStatus = await response.json();
            setStatus(data);
        } catch (error) {
            setMessage("Abonelik durumunuz yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            fetchSubscriptionStatus(userId);
        } else {
            setMessage("Görüntülenecek kullanıcı verisi yok. Lütfen tekrar giriş yapın.");
            setIsLoading(false);
        }
    }, [userId, fetchSubscriptionStatus]);


    // --- 2. Hesap Silme İşlemi ---
    const handleDeleteAccount = async () => {
        if (!userId) {
            setMessage("Kullanıcı kimliği bulunamadı.");
            return;
        }

        if (!window.confirm("Hesabınızı ve tüm verilerinizi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            return;
        }

        setMessage("Hesabınız siliniyor...");
        try {
            const response = await fetch(`${API_BASE_URL}/subscription/delete-account/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Hesap silinirken bir hata oluştu.");
            }

            // Başarılı olursa, yerel depolamayı temizle ve ana sayfaya yönlendir
            localStorage.removeItem('user_id');
            localStorage.removeItem('excel_file_id');
            localStorage.removeItem('excel_file_name');
            localStorage.removeItem('notion_database_id');
            localStorage.removeItem('notion_db_name');
            localStorage.removeItem('user_email');
            
            alert("Hesabınız ve tüm verileriniz silinmiştir. 30 gün sonra verileriniz sunucumuzdan tamamen temizlenecektir.");
            setStep('home');

        } catch (error) {
            setMessage(`Hata: ${error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu."}`);
        }
    };
    
    // Yükleniyor durumu
    if (isLoading) {
        return <div className="profile-container">Loading subscription status...</div>;
    }

    if (!status) {
        return <div className="profile-container error-message">Kullanıcı profil bilgileri yüklenemiyor.</div>;
    }
    
    // --- 3. Lemon Squeezy URL'si Oluşturma Fonksiyonu ---
    const getLemonSqueezyCheckoutUrl = (variantId: number, planLevel: string): string => {
        // Lemon Squeezy'nin "Upgrade/Downgrade" URL yapısı
        // 🚨 KRİTİK: user_email'i ileterek, var olan bir abonelik varsa otomatik olarak Yükseltme/Düşürme arayüzüne yönlendirilir.
        
        // Eğer kullanıcı bir planı zaten iptal etmişse ve end_date bilgisi varsa, 
        // Lemon Squeezy onu yükseltme/düşürme yerine yeni bir abonelik başlatmaya yönlendirir.
        
        const isCurrentPlan = planLevel === status.subscription_level;
        
        // Aktif abonelik varsa ve mevcut planı değilse, yükseltme/düşürme akışını başlat (checkout'un üzerine yazma)
        if (status.is_subscription_active && !isCurrentPlan) {
            // Örnek: https://notixel.lemonsqueezy.com/billing?email=user@example.com
            // Bu, kullanıcının mevcut aboneliğini yönettiği sayfaya yönlendirir.
             return `${LEMONSQUEEZY_STORE_URL}/billing?email=${status.email}`;
        } 
        
        // Aktif abonelik yoksa veya mevcut planı satın almaya çalışıyorsa (yenileme/yeni)
        // Standart checkout linki: https://notixel.lemonsqueezy.com/checkout/12345?email=user@example.com
        return `${LEMONSQUEEZY_STORE_URL}/checkout/${variantId}?email=${status.email}`;
    };


    // --- 4. Render Edilecek Bileşen ---
    const activeLevelInfo = LIMITS[status.subscription_level] || LIMITS['free'];
    const activeLevelLabel = activeLevelInfo.label;
    
    const isCancelled = status.subscription_end_date && parseISO(status.subscription_end_date) < new Date();
    
    // Eğer iptal edilmişse bile, bitiş tarihine kadar aktif sayılır.
    let statusText = status.is_subscription_active 
        ? "Aktif (Ödenmiş Dönem İçinde)" 
        : "Pasif (Ücretsiz Plana Döndürüldü)";

    if (status.subscription_end_date && status.is_subscription_active) {
        const endDate = parseISO(status.subscription_end_date);
        statusText = `Aktif (Sona Erme: ${format(endDate, 'dd MMM yyyy', { locale: tr })})`;
    } else if (isCancelled) {
        statusText = "Pasif (Süresi Doldu - Ücretsiz Plan)";
    }
    
    // Yükseltme kartları için listeyi oluştur.
    // Sadece "free" olmayan planları gösteriyoruz.
    const upgradePlans = Object.entries(PLAN_VARIANTS)
        .map(([level, variant]) => ({
            level,
            ...variant,
            ...LIMITS[level]
        }));
    
    // Yükseltme butonunun metnini belirleyen helper
    const getButtonText = (level: string) => {
        if (level === status.subscription_level) {
            return status.is_subscription_active ? 'Mevcut Planınız' : 'Yeniden Abone Ol';
        }
        
        // Aktif bir aboneliği varsa
        if (status.is_subscription_active) {
            // Daha düşük bir plana geçiyorsa
            const isDowngrade = LIMITS[level].syncs < LIMITS[status.subscription_level].syncs;
            return isDowngrade ? 'Şimdi Düşür' : 'Şimdi Yükselt';
        }
        
        // Aktif aboneliği yoksa, herhangi bir plan için "Abone Ol" butonu görünür.
        return 'Abone Ol';
    };


    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>Profil ve Abonelik Yönetimi</h1>
                <p>E-Posta: <strong>{status.email}</strong></p>
            </header>
            
            {/* --- MEVCUT DURUM KARTI --- */}
            <section className="current-status-card">
                <h2>Mevcut Abonelik Durumunuz</h2>
                <div className="status-grid">
                    <div className="status-item current-plan">
                        <span className="status-label">Plan Seviyesi</span>
                        <span className="status-value">{activeLevelLabel}</span>
                    </div>
                    <div className={`status-item ${status.is_subscription_active ? 'active-status' : 'inactive-status'}`}>
                        <span className="status-label">Abonelik Durumu</span>
                        <span className="status-value">{statusText}</span>
                    </div>
                </div>

                <div className="current-limits-detail">
                    <div className="limit-detail">
                        <span className="limit-value">{activeLevelInfo.syncs === 9999 ? 'Sınırsız' : activeLevelInfo.syncs}</span>
                        <span className="limit-label">Oto Senkronizasyon İşi</span>
                    </div>
                    <div className="limit-detail">
                        <span className="limit-value">Her {activeLevelInfo.interval} Dakikada Bir</span>
                        <span className="limit-label">Minimum Senkronizasyon Aralığı</span>
                    </div>
                </div>
            </section>
            
            {/* --- DİĞER PLANLAR VE YÜKSELTME SEÇENEKLERİ --- */}
            <section className="upgrade-section">
                <h2>Planınızı Yönetin</h2>
                <div className="plan-grid">
                    {upgradePlans.map((plan) => {
                        const level = plan.level;
                        const isCurrent = level === status.subscription_level;
                        const buttonText = getButtonText(level);
                        const isDisabled = isCurrent && status.is_subscription_active; // Aktif aboneliği varken kendi planının butonu devre dışı

                        // Lemon Squeezy URL'si oluşturma
                        const checkoutUrl = getLemonSqueezyCheckoutUrl(plan.id, plan.level);
                        
                        return (
                            <div key={level} className={`plan-card ${isCurrent ? 'current' : ''}`}>
                                <h3>{plan.label}</h3>
                                <p className="plan-price">
                                    ${plan.price} / ay
                                </p>
                                <ul className="plan-features">
                                    <li>{plan.syncs === 9999 ? 'Sınırsız' : plan.syncs} Oto Sync İşi</li>
                                    <li>Her {plan.interval} dakikada bir senk.</li>
                                </ul>

                                <a 
                                    href={checkoutUrl}
                                    target="_blank" // Yeni sekmede açar
                                    rel="noopener noreferrer"
                                    className={`btn btn-upgrade ${isDisabled ? 'disabled-link' : ''}`}
                                    aria-disabled={isDisabled}
                                    // Butonun kendisi hala tıklanabilir olduğu için disabled sınıfı ile stil veriyoruz
                                >
                                    {buttonText}
                                </a>
                                {isCurrent && status.is_subscription_active && (
                                    <p className="plan-note">
                                        Planınızı yönetmek (iptal/yükseltme/düşürme) için e-posta adresinizle <a href={`${LEMONSQUEEZY_STORE_URL}/billing?email=${status.email}`} target="_blank" rel="noopener noreferrer">Lemon Squeezy Müşteri Portalına</a> giriş yapın.
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {message && <p className="error-message">{message}</p>}
            
            {/* --- HESAP SİLME BÖLÜMÜ --- */}
            <section className="delete-account-section">
                <h2>Hesabı Kalıcı Olarak Sil</h2>
                <p>
                    **DİKKAT!** Bu işlem geri alınamaz. Hesabınızı sildiğinizde, tüm senkronizasyon ayarlarınız, kayıtlı Excel ve Notion bağlantılarınız **kalıcı olarak silinecektir**. Verileriniz, **Şartlar ve Koşullarımızda** belirtilen 30 günlük saklama süresini takiben sunucularımızdan temizlenecektir.
                </p>
                <button 
                    onClick={handleDeleteAccount} 
                    className="btn btn-danger delete-btn"
                >
                    Hesabımı Sil
                </button>
            </section>
        </div>
    );

};

export default Profile;