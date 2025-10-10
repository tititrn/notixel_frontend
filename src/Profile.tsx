import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './Profile.css'; // Yeni stil dosyası oluşturmayı unutmayın!

const API_BASE_URL = 'http://127.0.0.1:8000';
const LEMONSQUEEZY_STORE_URL = 'https://notixel.lemonsqueezy.com';

// 🚨 KRİTİK: Pricing.tsx'teki plan ID'lerini buraya da kopyalayın
const PLAN_VARIANTS: { [key: string]: { id: number; price: string } } = {
    basic: { id: 12345, price: "19" }, 
    pro: { id: 67890, price: "49" },
    exclusive: { id: 11223, price: "99" },
};

// API'den gelen verinin yapısı (UserSubscriptionStatus Pydantic modeline karşılık gelir)
interface SubscriptionStatus {
    email: string;
    subscription_level: string; // 'free', 'basic', 'pro'
    is_subscription_active: boolean; // Ödenen dönem içinde aktif mi?
    subscription_end_date: string | null; // Bitiş tarihi (ISO formatında string)
}

// Config.py'deki limitleri göstermek için basit bir map
const LIMITS: { [key: string]: { syncs: number; interval: number } } = {
    free: { syncs: 2, interval: 10 },
    basic: { syncs: 5, interval: 15 },
    pro: { syncs: 20, interval: 5 },
};



const Profile: React.FC = () => {
    const userId = localStorage.getItem('user_id');
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    
    // API çağrısı için helper
    const fetchSubscriptionStatus = async () => {
        if (!userId) {
            setMessage("Hata: Kullanıcı oturumu bulunamadı.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/subscription/status/${userId}`);
            if (!response.ok) {
                throw new Error("Abonelik durumu alınamadı.");
            }
            const data: SubscriptionStatus = await response.json();
            setStatus(data);
        } catch (error) {
            console.error(error);
            setMessage("Abonelik durumu yüklenirken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // İlk yüklemede durumu çek
    useEffect(() => {
        fetchSubscriptionStatus();
    }, []);


    const handleUpgrade = (targetLevel: 'basic' | 'pro' | 'exclusive') => {
    if (!userId) {
        alert("Lütfen önce giriş yapın.");
        return;
    }

    const targetVariant = PLAN_VARIANTS[targetLevel];
    if (!targetVariant) {
        alert("Hedef plan bulunamadı.");
        return;
    }

    // Ödeme sayfasını aç
    window.LemonSqueezy.Url.Open(`${LEMONSQUEEZY_STORE_URL}/checkout/buy/variant/${targetVariant.id}`, {
        embed: 1, 
        custom: {
            user_id: userId,
            action: 'upgrade/downgrade', // Backend'de ekstra takip için
        },
    });
    };

    // Abonelik İptal İşlemi
    const handleCancelSubscription = async () => {
        if (!userId || isCancelling) return;
        
        if (!window.confirm("Aboneliğinizi iptal etmek istediğinizden emin misiniz? Ödenen süre boyunca hizmete devam edebilirsiniz.")) {
            return;
        }

        setIsCancelling(true);
        try {
            const response = await fetch(`${API_BASE_URL}/subscription/cancel/${userId}`, {
                method: 'POST',
            });
            
            if (!response.ok) {
                throw new Error("İptal işlemi başarısız oldu.");
            }
            
            // Başarılı olursa, durumu yenile ve kullanıcıya mesaj ver
            await fetchSubscriptionStatus(); 
            alert("Aboneliğiniz iptal edildi.");
            
        } catch (error) {
            console.error("İptal hatası:", error);
            setMessage("Abonelik iptal edilirken bir sorun oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsCancelling(false);
        }
    };
    
    const handleDeleteAccount = async () => {
        if (!userId) return;

        // Kullanıcıya kritik bir uyarı penceresi gösteriyoruz
        if (!window.confirm(
            "KRİTİK UYARI: Hesabınızı kalıcı olarak silmek üzeresiniz.\n" +
            "Bu işlem Geri Alınamaz. Tüm senkronizasyon ayarlarınız ve verileriniz (abonelik bitiş tarihinden sonraki 30 gün içinde) silinecektir.\n" +
            "Devam etmek istediğinizden emin misiniz?"
        )) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/subscription/delete-account/${userId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error("Hesap silme işlemi başarısız oldu.");
            }
            
            // Başarılı silme sonrası: Local Storage'ı temizle ve ana sayfaya yönlendir
            localStorage.clear();
            alert("Hesabınız başarıyla silindi.Bütün Verileriniz kalıcı olarak silindi. Ana sayfaya yönlendiriliyorsunuz.");
            
            // 🚨 NOT: Bu noktada `setStep` prop'u olmadığı için doğrudan sayfa yenileme yapacağız.
            // setStep'i kullanmak için Profile bileşenine prop olarak iletmeliyiz. 
            // Şimdilik basitçe yenileme yapalım:
            window.location.href = '/'; 
            
        } catch (error) {
            console.error("Hesap silme hatası:", error);
            setMessage("Hesap silinirken bir sorun oluştu. Lütfen tekrar deneyin.");
        }
    };

    


    if (loading) {
        return <div className="container profile-container"><p>Abonelik durumu yükleniyor...</p></div>;
    }
    
    if (message && !status) {
        return <div className="container profile-container"><p className="error-message">{message}</p></div>;
    }

    if (!status) return null;
    
    // Tarih formatlama (Türkçe ay adlarını kullanmak için date-fns kütüphanesi yüklü olmalıdır)
    const formattedEndDate = status.subscription_end_date 
        ? format(new Date(status.subscription_end_date), 'dd MMMM yyyy') 
        : 'Süresiz';
        
    const currentLimits = LIMITS[status.subscription_level] || LIMITS.free;

    // Profile.tsx dosyasının içindeki return bloğu
// Sadece return() kısmı değişecektir. Fonksiyonlar ve State'ler aynı kalır.
// ...

    return (
        <div className="container profile-container">
            <header className="profile-header">
                <h1>{status.email} Profili ve Abonelik Yönetimi</h1>
                <p>Mevcut planınızı yönetin, limitlerinizi görün ve yükseltme yapın.</p>
            </header>

            {/* --- MEVCUT DURUM KART (CURRENT STATUS) --- */}
            <section className="current-status-card">
                <h2>Mevcut Planınız</h2>
                
                <div className="current-plan-summary">
                    {/* ABONELİK SEVİYESİ */}
                    <div className={`current-plan-level level-${status.subscription_level}`}>
                        <p>PLANI</p>
                        <h3>{status.subscription_level.toUpperCase()}</h3>
                    </div>

                    {/* LİMİTLERİN ÖZETİ */}
                    <div className="current-plan-limits">
                        <div>
                            <strong>Max. Otomatik Sync Ayarı:</strong>
                            <span>{currentLimits.syncs} Konfigürasyon</span>
                        </div>
                        <div>
                            <strong>Min. Senkronizasyon Aralığı:</strong>
                            <span>Her {currentLimits.interval} Dakika</span>
                        </div>
                    </div>

                    {/* BİTİŞ/İPTAL DURUMU VE BUTON */}
                    <div className="current-plan-actions">
                         {status.subscription_end_date ? (
                            <div className="status-message warning">
                                <strong>İptal Edildi.</strong> {formattedEndDate} tarihine kadar aktif.
                            </div>
                        ) : (
                            <div className="status-message success">
                                <strong>Aktif.</strong> {status.subscription_level !== 'free' && 'Yükseltme veya İptal yapabilirsiniz.'}
                            </div>
                        )}
                        
                        {/* Yalnızca ücretli ve iptal edilmemiş planlar için İptal butonu */}
                        {status.subscription_level !== 'free' && !status.subscription_end_date && (
                            <button 
                                onClick={handleCancelSubscription} 
                                disabled={isCancelling}
                                className="btn btn-danger btn-sm"
                            >
                                {isCancelling ? 'İptal Ediliyor...' : 'Aboneliği İptal Et'}
                            </button>
                        )}
                    </div>
                </div>
            </section>
            
            {/* --- PLAN YÜKSELTME/DEĞİŞTİRME SEÇENEKLERİ --- */}
            <section className="upgrade-options">
                <h2>Planınızı Yükseltin veya Değiştirin</h2>
                <div className="plan-cards-container">
                    {Object.keys(LIMITS).map(level => {
                        const planLimits = LIMITS[level];
                        const isCurrent = level === status.subscription_level;
                        
                        return (
                            <div key={level} className={`plan-card ${isCurrent ? 'is-current' : ''}`}>
                                <h3>{level.toUpperCase()}</h3>
                                <div className="limit-detail">
                                    <span className="limit-value">{planLimits.syncs}</span>
                                    <span className="limit-label">Sync Ayarı</span>
                                </div>
                                <div className="limit-detail">
                                    <span className="limit-value">{planLimits.interval} Dk</span>
                                    <span className="limit-label">Min. Aralığı</span>
                                </div>
                                
                                {isCurrent ? (
                                    <button className="btn btn-primary" disabled>MEVCUT PLANINIZ</button>
                                ) : (
                                    <button 
                                        onClick={() => handleUpgrade(level as 'basic' | 'pro' | 'exclusive')}
                                        className="btn btn-upgrade"
                                        // 🚨 DÜZELTME: !! ekleyerek boolean tipine çeviriyoruz
                                        disabled={!!status.subscription_end_date} 
                                    >
                                        {level === status.subscription_level ? 'Mevcut Planınız' : 'Şimdi Yükselt'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {message && <p className="error-message">{message}</p>}
            
            {/* --- HESAP SİLME BÖLÜMÜ (Önceki Adımda Eklenen) --- */}
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