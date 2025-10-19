import React, { useState, useEffect } from 'react';
import './Dashboard.css'; 
import { formatDistanceToNow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';


const API_BASE_URL = 'https://127.0.0.1:8000';



type MappingDetail = {
    id: number;
    excel_column: string;
    notion_property: string;
    data_type: string;
    user_id: number; 
    is_auto_sync_enabled: boolean;
};


// 🚨 GÜNCELLENMİŞ TİP: Backend'den gelen isimleri ve mapping_details listesini içerir
type AutoSyncConfig = {
    id: number;
    user_id: number;
    excel_file_id: string;
    notion_database_id: string;
    direction: 'excel-to-notion' | 'notion-to-excel';
    interval_minutes: number;
    is_active: boolean;
    last_synced: string | null;
    created_at: string;
    
    // Yeni Alanlar (Backend'den çekilen isimler)
    excel_file_name: string;      // 👈 YENİ
    excel_worksheet_name: string; // 👈 YENİ
    notion_db_name: string;       // 👈 YENİ

    // Mapping sayısı yerine detay listesini kullanıyoruz (sayısını buradan alacağız)
    mapping_details: MappingDetail[]; // 👈 GÜNCELLENDİ
};



function AutoSyncDashboard() {
    // configs state'i güncellenmiş tip ile tanımlanmalı
    const [configs, setConfigs] = useState<AutoSyncConfig[]>([]); 
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const userId = localStorage.getItem('user_id');
    const [isModalOpen, setIsModalOpen] = useState(false);
    // currentMappings state'i zaten doğru tipi kullanıyor
    const [currentMappings, setCurrentMappings] = useState<MappingDetail[]>([]);
    const [currentConfigName, setCurrentConfigName] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [currentConfigId, setCurrentConfigId] = useState<number | null>(null); 

    
    // ... (useEffect, fetchConfigs fonksiyonları aynı kalır)

    useEffect(() => {
        if (userId) {
            fetchConfigs(userId);
        } else {
            setMessage('Kullanıcı kimliği bulunamadı. Lütfen giriş yapın.');
            setLoading(false);
        }
    }, [userId]);

    const fetchConfigs = async (currentUserId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/autosync/list/${currentUserId}`); 
            
            const data: AutoSyncConfig[] = await res.json(); // Tipi doğru kullanıyoruz
            
            if (res.ok) {
                // Backend'den mapping_details geliyorsa, direkt onu kullanırız
                setConfigs(data || []); 
                setMessage('');
            } else {
                setMessage(`Ayarlar alınamadı: ${(data as any).detail || (data as any).error || 'Bilinmeyen Hata'}`);
                setConfigs([]); 
            }
        } catch {
            setMessage('Ayarları getirirken ağ hatası oluştu.');
            setConfigs([]);
        } finally {
            setLoading(false);
        }
    };
    
    // Eşleşme detaylarını açma fonksiyonu
    // Not: Normalde fetchConfigs'te mapping_details geldiği için bu fonksiyona gerek kalmaz. 
    // Ancak modal'ın açılması ve başlığının ayarlanması için bu mevcut yapıyı koruyorum.
    const openMappingModal = (config: AutoSyncConfig) => {
        setCurrentMappings(config.mapping_details || []);
        setCurrentConfigName(config.direction === 'excel-to-notion' ? 'Excel → Notion' : 'Notion → Excel');
        setCurrentConfigId(config.id); 
        setIsModalOpen(true);
        setMessage(''); // Mesajı temizle
    };

    // Mevcut fetchMappingDetails fonksiyonu kaldırıldı, çünkü ana liste API'si artık detayları getiriyor.
    // Ancak sizin eski yapınızda mapping ID ile çekme olduğu için, isterseniz bu kodu tutabilirsiniz.
    // Biz burada backend'den gelen mapping_details'i kullanarak modalı açan openMappingModal'ı kullanacağız.

    const renderMappingModal = () => {
        if (!isModalOpen) return null;

        return (
            <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <h3>{currentConfigName} Eşleşme Detayları</h3>
                    {/* Modal Loading'i kaldırdım, çünkü data ana API'den geldiği için hızlı açılmalı */}
                    {currentMappings.length > 0 ? (
                        <table className="modal-table">
                            <thead>
                                <tr>
                                    <th>Excel Sütunu</th>
                                    <th>Notion Özelliği</th>
                                    <th>Aksiyonlar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentMappings.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.excel_column || '---'}</td> 
                                        <td>{m.notion_property || '---'}</td>
                                        <td className="action-cell">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveAutoSync(m.id, currentConfigId!); 
                                                }}
                                                className="action-btn delete"
                                                title="Bu eşleşmeyi otomatik senkronizasyondan kaldır"
                                            >
                                                Kaldır
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Bu işte kayıtlı otomatik senkronizasyon eşleşmesi bulunmamaktadır.</p>
                    )}
                    <button className="primary-btn close-btn" onClick={() => setIsModalOpen(false)}>Kapat</button>
                </div>
            </div>
        );
    };

    const handleRemoveAutoSync = async (mappingId: number, configId: number) => {
        if (!configId) {
            setMessage('Hata: Config ID bulunamadı.');
            return;
        }
        if (!window.confirm('Bu sütun eşleşmesinin otomatik senkronizasyonunu kalıcı olarak kaldırmak istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/autosync/mapping/disable/${mappingId}/${configId}`, {
                method: 'POST',
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setMessage(data.message);
                // Modal'daki görünümü güncelle: Kaldırılan kaydı listeden çıkar
                setCurrentMappings(prev => prev.filter(m => m.id !== mappingId));
                // Ana Dashboard listesinin güncellenmesini tetikle (Mapping sayısı değiştiği için)
                fetchConfigs(userId!); 

            } else {
                setMessage(`Kaldırma işlemi başarısız: ${data.detail || data.error}`);
            }
        } catch {
            setMessage('Kaldırma işlemi sırasında ağ hatası oluştu.');
        }
    };

    const triggerFullSync = async (configId: number) => {
        setMessage('');
        try {
            const res = await fetch(`${API_BASE_URL}/autosync/trigger/${configId}`, {
                method: 'POST',
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setMessage(`Konfigürasyon ID ${configId} için manuel senkronizasyon başlatıldı!`);
                setTimeout(() => fetchConfigs(userId!), 3000); 
            } else {
                setMessage(`Manuel Sync Başarısız: ${data.detail || data.error}`);
            }
        } catch {
            setMessage('Manuel Sync sırasında ağ hatası oluştu.');
        }
    };

    const deleteSyncConfig = async (configId: number) => {
        if (!window.confirm('Bu otomatik senkronizasyon işini silmek istediğinizden emin misiniz?')) {
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE_URL}/autosync/delete/${configId}`, {
                method: 'DELETE',
            });
            
            if (res.ok) {
                setMessage('Senkronizasyon işi başarıyla silindi.');
                // State'ten sil
                setConfigs(prev => prev.filter(c => c.id !== configId));
            } else {
                const data = await res.json();
                setMessage(`Silinemedi: ${data.detail || data.error}`);
            }
        } catch {
            setMessage('Silme işlemi sırasında ağ hatası oluştu.');
        }
    };

    const formatLastSync = (dateString: string | null) => {
        if (!dateString) return 'Hiç senkronize edilmedi';
        try {
            const date = parseISO(dateString);
            // return `${formatDistanceToNow(date, { addSuffix: true, locale: tr })} önce`; // Bu satır 'bir saat önce önce' gibi yanlış çıkabiliyor.
            // Sadece formatDistanceToNow kullanmak yeterli.
            return formatDistanceToNow(date, { addSuffix: true, locale: tr });
        } catch {
            return 'Geçersiz Tarih';
        }
    };
    
    // --- Render Metotları ---
    
    if (loading) {
        return <div className="dashboard-container"><p>Ayarlar yükleniyor...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <h2>Otomatik Senkronizasyon Dashboard</h2>
            {message && <div className="dashboard-message">{message}</div>}

            {configs.length === 0 ? (
                <div className="empty-state">
                    <p>Aktif otomatik senkronizasyon işi bulunmamaktadır.</p>
                    <button onClick={() => window.history.back()} className="secondary-btn">Yeni Sync Oluştur</button>
                </div>
            ) : (
                <table className="sync-table">
                    <thead>
                        <tr>
                            <th>Yön</th>
                            <th>Kaynak/Hedef</th>
                            <th>Sıklık</th>
                            <th>Eşleşme Sayısı</th>
                            <th>Son Senk.</th>
                            <th>Durum</th>
                            <th>Aksiyon</th>
                        </tr>
                    </thead>
                    <tbody>
                        {configs.map(config => (
                            // Tüm satır yerine, sadece Mapping sayısı hücresi modalı açacak.
                            <tr key={config.id} className={config.is_active ? 'active-row' : 'inactive-row'}>
                                <td>
                                    {/* Yön */}
                                    {config.direction === 'excel-to-notion' 
                                        ? 'Excel → Notion' 
                                        : 'Notion → Excel'}
                                </td>

                                {/* 🚨 GÜNCELLENDİ: Kaynak/Hedef - İsimleri göster */}
                                <td>
                                    <div className="source-target-details">
                                        <p>
                                            <strong>Excel:</strong> {config.excel_file_name || 'N/A'} ({config.excel_worksheet_name || 'Sayfa1'})
                                        </p>
                                        <p>
                                            <strong>Notion:</strong> {config.notion_db_name || 'N/A'}
                                        </p>
                                    </div>
                                </td>

                                {/* 🚨 GÜNCELLENDİ: Sıklık */}
                                <td>Her <strong>{config.interval_minutes}</strong> Dakika</td>
                                
                                {/* 🚨 GÜNCELLENDİ: Eşleşme Sayısı (Tıklanabilir) */}
                                <td 
                                    className="mapping-count-cell"
                                    onClick={() => openMappingModal(config)}
                                    title="Eşleşme detaylarını görmek için tıklayın"
                                >
                                    <strong>{config.mapping_details?.length || 0}</strong> Sütun
                                </td>
                                
                                {/* 🚨 GÜNCELLENDİ: Son Senk. */}
                                <td>{formatLastSync(config.last_synced)}</td>
                                
                                <td>
                                    <span className={`status-badge ${config.is_active ? 'active' : 'inactive'}`}>
                                        {config.is_active ? 'AKTİF' : 'DURDURULDU'}
                                    </span>
                                </td>
                                
                                <td className="action-cell">
                                    {/* Hızlı Sync Butonu */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Satır tıklamasını engelle
                                            triggerFullSync(config.id);
                                        }}
                                        className="action-btn activate"
                                        style={{ marginRight: '5px' }}
                                        title="Hemen senkronizasyonu başlat"
                                    >
                                        Sync Yap
                                    </button>
                                    
                                    {/* Sil Butonu */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSyncConfig(config.id);
                                        }}
                                        className="action-btn delete"
                                        title="Sil"
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            {/* Yenile butonu */}
            <button onClick={() => fetchConfigs(userId!)} className="secondary-btn refresh-btn">
                Listeyi Yenile
            </button>
            {renderMappingModal()} 
        </div>
    );
}

export default AutoSyncDashboard;