import React, { useState, useEffect } from 'react';
import './Dashboard.css'; 
import { formatDistanceToNow, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';


const API_BASE_URL = 'https://notixel-backend.onrender.com';



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
            setMessage('User ID not found. Please log in.');
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
                setMessage(`Settings could not be retrieved: ${(data as any).detail || (data as any).error || 'Unknown Error'}`);
                setConfigs([]); 
            }
        } catch {
            setMessage('A network error occurred while fetching settings.');
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
                    <h3>{currentConfigName} Mapping Details</h3>
                    {/* Modal Loading'i kaldırdım, çünkü data ana API'den geldiği için hızlı açılmalı */}
                    {currentMappings.length > 0 ? (
                        <table className="modal-table">
                            <thead>
                                <tr>
                                    <th>Excel Columns</th>
                                    <th>Notion Properties</th>
                                    <th>Actions</th>
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
                                                title="Remove this match from automatic synchronization"
                                            >
                                                Kaldır
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>There is no automatic synchronization match registered in this job.</p>
                    )}
                    <button className="primary-btn close-btn" onClick={() => setIsModalOpen(false)}>Close</button>
                </div>
            </div>
        );
    };

    const handleRemoveAutoSync = async (mappingId: number, configId: number) => {
        if (!configId) {
            setMessage('Error: Config ID not found.');
            return;
        }
        if (!window.confirm('Are you sure you want to permanently remove the automatic synchronization of this column match?')) {
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
                setMessage(`Removal failed: ${data.detail || data.error}`);
            }
        } catch {
            setMessage('A network error occurred during the removal process.');
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
                setMessage(`Manual synchronization started for Configuration ID ${configId}!`);
                setTimeout(() => fetchConfigs(userId!), 3000); 
            } else {
                setMessage(`Manual Sync Failed: ${data.detail || data.error}`);
            }
        } catch {
            setMessage('A network error occurred during Manual Sync.');
        }
    };

    const deleteSyncConfig = async (configId: number) => {
        if (!window.confirm('Are you sure you want to delete this automatic synchronization job?')) {
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE_URL}/autosync/delete/${configId}`, {
                method: 'DELETE',
            });
            
            if (res.ok) {
                setMessage('Synchronization job deleted successfully.');
                // State'ten sil
                setConfigs(prev => prev.filter(c => c.id !== configId));
            } else {
                const data = await res.json();
                setMessage(`Could not be deleted: ${data.detail || data.error}`);
            }
        } catch {
            setMessage('A network error occurred during the deletion process.');
        }
    };

    const formatLastSync = (dateString: string | null) => {
        if (!dateString) return 'Never synchronized';
        try {
            const date = parseISO(dateString);
            // return `${formatDistanceToNow(date, { addSuffix: true, locale: tr })} önce`; // Bu satır 'bir saat önce önce' gibi yanlış çıkabiliyor.
            // Sadece formatDistanceToNow kullanmak yeterli.
            return formatDistanceToNow(date, { addSuffix: true, locale: tr });
        } catch {
            return 'Invalid Date';
        }
    };
    
    // --- Render Metotları ---
    
    if (loading) {
        return <div className="dashboard-container"><p>Loading...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <h2>Automatic Synchronization Dashboard</h2>
            {message && <div className="dashboard-message">{message}</div>}

            {configs.length === 0 ? (
                <div className="empty-state">
                    <p>There are no active automatic synchronization jobs.</p>
                    <button onClick={() => window.history.back()} className="secondary-btn">Create New Sync</button>
                </div>
            ) : (
                <table className="sync-table">
                    <thead>
                        <tr>
                            <th>Direction</th>
                            <th>Source/Target</th>
                            <th>Frequency</th>
                            <th>Match Count</th>
                            <th>Last Sync.</th>
                            <th>Status</th>
                            <th>Action</th>
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
                                <td>Every <strong>{config.interval_minutes}</strong> Minutes</td>
                                
                                {/* 🚨 GÜNCELLENDİ: Eşleşme Sayısı (Tıklanabilir) */}
                                <td 
                                    className="mapping-count-cell"
                                    onClick={() => openMappingModal(config)}
                                    title="Click to see match details"
                                >
                                    <strong>{config.mapping_details?.length || 0}</strong> Column
                                </td>
                                
                                {/* 🚨 GÜNCELLENDİ: Son Senk. */}
                                <td>{formatLastSync(config.last_synced)}</td>
                                
                                <td>
                                    <span className={`status-badge ${config.is_active ? 'active' : 'inactive'}`}>
                                        {config.is_active ? 'ACTIVE' : 'INACTIVE'}
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
                                        title="Sync Now"
                                    >
                                        Sync Now
                                    </button>
                                    
                                    {/* Sil Butonu */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSyncConfig(config.id);
                                        }}
                                        className="action-btn delete"
                                        title="Delete"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            {/* Yenile butonu */}
            <button onClick={() => fetchConfigs(userId!)} className="secondary-btn refresh-btn">
                Refresh
            </button>
            {renderMappingModal()} 
        </div>
    );
}

export default AutoSyncDashboard;