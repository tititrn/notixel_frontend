import React, { useState, useEffect, useCallback  } from 'react';
import './App.css';
import Dashboard from './AutoSyncDashboard';
import Home from './Home'; // Yeni Home bileşenini import ediyoruz!
import PrivacyPolicy from './PrivacyPolicy';
import TermsAndConditions from './TermsAndConditions';
// YENİ İMPORTLAR
import HeaderComponent from './HeaderComponent'; 
import FooterComponent from './FooterComponent'; 
import Profile from './Profile';

// 'home' adımını AppStep türüne ekliyoruz
// YENİ TİP EKLENTİLERİ: 'privacy' ve 'terms' eklendi
type AppStep = 'home' | 'connect' | 'notion_connect'| 'select' | 'mapping' | 'complete' | 'dashboard' | 'privacy' | 'terms' | 'profile';
type ExcelFile = { id: string; name: string };
type ExcelColumn = { name: string };
type NotionProperty = { name: string; type?: string };
type Mapping = { excel_column: string; notion_property: string; data_type: string };
type ExcelWorksheet = { name: string };

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  // Başlangıç adımını, localStorage'daki user_id'ye göre belirliyoruz.
  const initialUserId = localStorage.getItem('user_id');
  // ID varsa 'connect' adımında başla, yoksa 'home' (giriş) sayfasında başla.
  const initialStep: AppStep = initialUserId ? 'connect' : 'home';
  
  const [step, setStep] = useState<AppStep>(initialStep);
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('user_email'));
  const [syncDirection, setSyncDirection] = useState<'excel-to-notion' | 'notion-to-excel'>('excel-to-notion');
  const [autoSyncToggle, setAutoSyncToggle] = useState(false);
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([]);
  const [excelColumns, setExcelColumns] = useState<ExcelColumn[]>([]);
  const [notionProperties, setNotionProperties] = useState<NotionProperty[]>([]);
  const [selectedExcelId, setSelectedExcelId] = useState<string>('');
  const [excelWorksheets, setExcelWorksheets] = useState<ExcelWorksheet[]>([]); // Yeni
  const [selectedWorksheetName, setSelectedWorksheetName] = useState<string>(''); // Yeni
  const [notionDbId, setNotionDbId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(initialUserId); // initialUserId'yi kullanıyoruz

  const [excelToNotionMappings, setExcelToNotionMappings] = useState<Mapping[]>([]);
  const [notionToExcelMappings, setNotionToExcelMappings] = useState<Mapping[]>([]);
  
  const [unmatchedColumns, setUnmatchedColumns] = useState<string[]>([]);
  const [selectedColumnsToCreate, setSelectedColumnsToCreate] = useState<string[]>([]);
  
  const [autoSyncColumns, setAutoSyncColumns] = useState<string[]>([]);


  const handleMappingChange = useCallback((leftItemName: string, selectedRightItem: string) => {
    // Mevcut mappings'i al
    const currentMappings = syncDirection === 'excel-to-notion' ? excelToNotionMappings : notionToExcelMappings;
    const setMappings = syncDirection === 'excel-to-notion' ? setExcelToNotionMappings : setNotionToExcelMappings;
    
    // Yeni mapping objesi oluştur
    const newMapping = {
        excel_column: syncDirection === 'excel-to-notion' ? leftItemName : selectedRightItem,
        notion_property: syncDirection === 'excel-to-notion' ? selectedRightItem : leftItemName,
        data_type: 'Text', // Bu, varsayılan değerdir, Notion property tipine göre değiştirilebilir
    };
    
    // Var olan mapping'i bul ve güncelle veya yeni mapping'i ekle
    const updatedMappings = currentMappings.filter(m => 
        syncDirection === 'excel-to-notion' 
            ? m.excel_column !== leftItemName 
            : m.notion_property !== leftItemName
    );
    
    // Eğer "Eşleştirme Yapma" (boş değer) seçilmediyse ekle
    if (selectedRightItem) {
        setMappings([...updatedMappings, newMapping]);
    } else {
        // Eşleşme kaldırıldığında AutoSync'ten de kaldır
        if (autoSyncColumns.includes(leftItemName)) {
            setAutoSyncColumns(cols => cols.filter(c => c !== leftItemName));
        }
        setMappings(updatedMappings);
    }

}, [syncDirection, excelToNotionMappings, notionToExcelMappings, autoSyncColumns, setExcelToNotionMappings, setNotionToExcelMappings, setAutoSyncColumns]);


// 2. Auto Sync Sütun Seçimini Yöneten Fonksiyon
const handleAutoSyncColumnChange = useCallback((columnName: string, isChecked: boolean) => {
    setAutoSyncColumns(prevCols => {
        if (isChecked && !prevCols.includes(columnName)) {
            return [...prevCols, columnName];
        } else if (!isChecked && prevCols.includes(columnName)) {
            return prevCols.filter(c => c !== columnName);
        }
        return prevCols;
    });
}, [setAutoSyncColumns]);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const receivedUserId = params.get('user_id');
    const notionAuthSuccess = params.get('notion_auth_success') === 'true';
    const notionAuthError = params.get('notion_auth_error') === 'true';
    const authSuccess = params.get('auth_success') === 'true';

    // Helper: Kullanıcı verilerini kaydeder ve Notion bağlantısını kontrol eder.
    const initializeApp = async (id: string, isNewLogin: boolean) => {
        setUserId(id);
        localStorage.setItem('user_id', id);

        const hasNotionKey = await checkNotionStatus(id);

        if (!hasNotionKey) {
            setStep('notion_connect');
            if (isNewLogin) setMessage('Microsoft bağlantısı başarılı. Şimdi Notion hesabınızı bağlayın.');
        } else {
            setStep('select');
            fetchExcelFiles(id);
            if (isNewLogin) setMessage('Bağlantılar tamam! Excel dosyanızı seçin.');
        }
    };
    
    // --- 1. Notion Callback Handling (Notion'dan döndüğünde) ---
    if (notionAuthSuccess) {
        const currentId = localStorage.getItem('user_id');
        if (currentId) {
            setStep('select');
            fetchExcelFiles(currentId);
            setMessage('Notion bağlantısı başarılı! Şimdi bir dosya seçin.');
        } else {
            setMessage('Hata: Notion bağlantısı başarılı ancak kullanıcı ID kayıp.');
            setStep('home');
        }
        window.history.replaceState(null, '', window.location.pathname);
        return;
    }
    
    if (notionAuthError) {
         setMessage(`Notion bağlantı hatası: ${params.get('message') || 'Bilinmeyen hata.'}`);
         setStep('notion_connect'); 
         window.history.replaceState(null, '', window.location.pathname);
         return;
    }

    // --- 2. Microsoft Callback Handling (Microsoft'tan döndüğünde) ---
    if (authSuccess && receivedUserId) {
        initializeApp(receivedUserId, true);
        window.history.replaceState(null, '', window.location.pathname);
        return;
    }
    
    // --- 3. Persistent Session / Initial Load Handling ---
    const storedUserId = localStorage.getItem('user_id');
    // Eğer localStorage'da ID varsa ve mevcut adım 'home' değilse (yani oturum açma akışına girmişse)
    if (storedUserId && step !== 'home') {
         initializeApp(storedUserId, false);
         return;
    }

    // --- 4. Default: Show Home Page ---
    // Eğer hiçbir şey tetiklenmediyse ve ID yoksa, Home'u göster.
    if (!storedUserId) {
        setStep('home');
    }
    
  }, []); 

  useEffect(() => {
    // ID sütun adını küçük harfle kontrol ediyoruz
    const idColumnName = 'id'; 
    const isMappingStep = step === 'mapping';

    // 🚨 Düzeltme 1: leftItems ve rightItems'ı useEffect içinde tanımla
    const leftItems = syncDirection === 'excel-to-notion' ? excelColumns : notionProperties;
    const rightItems = syncDirection === 'excel-to-notion' ? notionProperties : excelColumns;

    const mappings = syncDirection === 'excel-to-notion' ? excelToNotionMappings : notionToExcelMappings;
    
    // 1. OTOMATİK ID EŞLEŞTİRME KONTROLÜ
    if (isMappingStep && excelColumns.length > 0 && notionProperties.length > 0) {
        
        // ID sütununun zaten eşlenip eşlenmediğini kontrol et.
        const isIdMapped = mappings.some(m => 
            syncDirection === 'excel-to-notion' 
                ? m.excel_column.toLowerCase() === idColumnName 
                : m.notion_property.toLowerCase() === idColumnName
        );
        
        if (!isIdMapped) {
            const leftItem = leftItems.find(item => item.name.toLowerCase() === idColumnName);
            const autoMapTarget = rightItems.find(item => item.name.toLowerCase() === idColumnName);
            
            // Hem sol hem sağ tarafta "ID" sütunu varsa, otomatik eşleştirmeyi yap
            if (leftItem && autoMapTarget) {
                handleMappingChange(leftItem.name, autoMapTarget.name);
                setMessage('ID sütunu otomatik olarak eşleştirildi.');
            }
        }
    }

    // 2. ID SÜTUNU OTOMATİK SYNC MANTIK
    // Global AutoSync açıldığında ID'yi otomatik sync listesine ekle.
    if (isMappingStep) {
        if (autoSyncToggle && !autoSyncColumns.includes(idColumnName)) {
            // ID'yi otomatik sync listesine ekle
            handleAutoSyncColumnChange(idColumnName, true);
        } else if (!autoSyncToggle && autoSyncColumns.includes(idColumnName)) {
            // ID'yi otomatik sync listesinden çıkar (Global kapatıldı)
            handleAutoSyncColumnChange(idColumnName, false);
        }
    }


// 🚨 DÜZELTME 2: Dependency array'i düzeltildi. setMessage kaldırıldı.
}, [
    step, 
    syncDirection, 
    excelColumns, 
    notionProperties, 
    autoSyncToggle, 
    autoSyncColumns,
    excelToNotionMappings,
    notionToExcelMappings,
    handleMappingChange, // Artık useCallback ile stabil!
    handleAutoSyncColumnChange, // Artık useCallback ile stabil!
    setMessage // 🚨 setMessage bir state setter'dır ve dependency array'e eklenmemelidir.
]);


  // ... (Tüm fetch ve handler fonksiyonları burada devam eder)

  // 1. Yeni Sayfa Çekme Fonksiyonu
  const fetchExcelWorksheets = async (fileId: string, currentUserId: string) => {
    try {
      // Backend'deki yeni endpoint'i çağırın
      const res = await fetch(`${API_BASE_URL}/get-excel-worksheets?excel_file_id=${fileId}&user_id=${currentUserId}`);
      const data = await res.json();
      if (res.ok) {
        // Data'nın ["Sayfa1", "Sayfa2"] formatında geldiğini varsayıyoruz
        const worksheets = data.worksheets.map((name: string) => ({ name }));
        setExcelWorksheets(worksheets);

        if (worksheets.length === 1) {
            // Tek sayfa varsa otomatik seç ve sütunları çek
            setSelectedWorksheetName(worksheets[0].name);
            fetchExcelColumns(fileId, worksheets[0].name);
        } else {
             // Sütunları temizle ve kullanıcının seçmesini bekle
             setExcelColumns([]);
        }

      } else setMessage(`Excel sayfaları alınamadı: ${data.error}`);
    } catch {
      setMessage('Excel sayfaları alınırken ağ hatası oluştu.');
    }
  };


  const handleMicrosoftConnect = () => {
    window.location.href = `${API_BASE_URL}/connect/microsoft`;
  };

  const checkNotionStatus = async (currentUserId: string): Promise<boolean> => {
    // DEV MODE: Notion bağlantısı kontrolü atlanıyor.
    // return true; // Eğer test amaçlı Notion bağlantısını atlamak isterseniz
    try {
        const res = await fetch(`${API_BASE_URL}/check-notion-status?user_id=${currentUserId}`);
        const data = await res.json();
        if (res.ok) {
            // Backend'den { has_notion_key: true/false } şeklinde bir yanıt bekliyoruz.
            return data.has_notion_key;
        }
        return false;
    } catch {
        setMessage('Bağlantı kontrolü sırasında ağ hatası oluştu.');
        return false;
    }
  };

  const fetchExcelFiles = async (currentUserId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-excel-files?user_id=${currentUserId}`);
      const data = await res.json();
      if (res.ok) setExcelFiles(data.files);
      else setMessage(`Excel dosyaları alınamadı: ${data.error}`);
    } catch {
      setMessage('Excel dosyaları alınırken ağ hatası oluştu.');
    }
  };

  const fetchExcelColumns = async (fileId: string, worksheetName: string) => {
    if (!userId || !worksheetName) return; 
    try {
      const res = await fetch(`${API_BASE_URL}/get-excel-columns?excel_file_id=${fileId}&worksheet_name=${worksheetName}&user_id=${userId}`);
      const data = await res.json();
      if (res.ok) {
        const columns = data.columns.map((name: string) => ({ name }));
        const hasId = columns.some((c: ExcelColumn) => c.name.toLowerCase() === 'id');
        if (!hasId) {
          setMessage('"ID" sütunu bulunmuyor, başka dosya seçin.');
          setExcelColumns([]);
          setExcelToNotionMappings([]);
          return;
        }
        setExcelColumns(columns);
        setExcelToNotionMappings(columns.map((c: ExcelColumn) => ({
          excel_column: c.name,
          notion_property: '',
          data_type: ''
        })));
      } else setMessage(`Excel sütunları alınamadı: ${data.error}`);
    } catch {
      setMessage('Excel sütunları alınırken ağ hatası oluştu.');
    }
  };

  const fetchNotionProperties = async () => {
    if (!notionDbId) {
      setMessage('Lütfen Notion Veritabanı ID\'si girin.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/get-notion-properties?notion_database_id=${notionDbId}`);
      const data = await res.json();
      if (res.ok) {
        setNotionProperties(data.properties);

        const notionPropNames = data.properties.map((p: NotionProperty) => p.name.toLowerCase());
        const unmatched = excelColumns
          .filter(col => !notionPropNames.includes(col.name.toLowerCase()) && col.name.toLowerCase() !== 'id')
          .map(col => col.name);
        setUnmatchedColumns(unmatched);
        setSelectedColumnsToCreate([]);

        setNotionToExcelMappings(data.properties.map((prop: NotionProperty) => ({
          excel_column: '',
          notion_property: prop.name,
          data_type: prop.type || ''
        })));

        setStep('mapping');
      } else setMessage(`Notion özellikleri alınamadı: ${data.error}`);
    } catch {
      setMessage('Notion özelliklerini alırken ağ hatası oluştu.');
    }
  };

  

  const handleCreateColumnChange = (colName: string, checked: boolean) => {
    setSelectedColumnsToCreate(prev =>
      checked ? [...prev, colName] : prev.filter(c => c !== colName)
    );
  };

  
  

  
  

const saveMappings = async () => {
    if (!userId) { setMessage('Kullanıcı kimliği bulunamadı.'); return; }

    const mappings = syncDirection === 'excel-to-notion' ? excelToNotionMappings : notionToExcelMappings;
    const validMappings = mappings.filter(m =>
        syncDirection === 'excel-to-notion' ? m.notion_property.trim() !== '' : m.excel_column.trim() !== ''
    );
    
    if (validMappings.length === 0) { setMessage("En az bir sütunu eşleştirin."); return; }
    
    const idMappingExists = validMappings.some(m => 
        (syncDirection === 'excel-to-notion' && m.excel_column.toLowerCase() === 'id') ||
        (syncDirection === 'notion-to-excel' && m.notion_property.toLowerCase() === 'id')
    );
    
    if (!idMappingExists) {
        setMessage("Senkronizasyon için 'ID' sütununun eşleştirilmesi zorunludur.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/save-mapping?user_id=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validMappings),
        });
        
        const data = await res.json(); 
        
        if (res.ok) {
            const allSavedMappings: { id: number, excel_column: string, notion_property: string }[] = data.saved_mappings || []; 
            
            setMessage("Eşleşmeler başarıyla kaydedildi. Senkronizasyon başlatılıyor...");
            startSync(syncDirection, allSavedMappings); 
        } else {
            const err = data;
            setMessage(`Eşleşmeler kaydedilemedi: ${err.error || err.detail}`);
        }
    } catch {
        setMessage('Eşleşmeleri kaydederken ağ hatası oluştu.');
    }
};


const startSync = async (
    direction: 'excel-to-notion' | 'notion-to-excel',
    allSavedMappings: { id: number, excel_column: string, notion_property: string }[] 
  ) => {
    if (!userId) {
        setMessage('Kullanıcı kimliği bulunamadı.');
        return;
    }

    let successMessage = 'Senkronizasyon başarıyla tamamlandı.';

    const cleanAutoSyncColumnsSet = new Set(
        autoSyncColumns.map(name => name.toLowerCase().trim())
    );

    const autoSyncMappingIds = allSavedMappings
        .filter(m => {
            const columnName = direction === 'excel-to-notion' ? m.excel_column : m.notion_property;
            const cleanBackendName = columnName.toLowerCase().trim();
            
            return cleanAutoSyncColumnsSet.has(cleanBackendName);
        })
        .map(m => m.id);


    const autoSyncCreationData = {
        user_id: parseInt(userId, 10),
        excel_file_id: selectedExcelId,
        excel_file_name: excelFiles.find(f => f.id === selectedExcelId)?.name || '',
        notion_database_id: notionDbId,
        direction: direction,
        interval_minutes: 60,
        mapping_ids: autoSyncMappingIds,
        excel_worksheet_name: selectedWorksheetName, 
    };
    
    try {
        // 1. MANUEL SENKRONİZASYONU BAŞLAT
        const res = await fetch(`${API_BASE_URL}/sync/${direction}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                 excel_file_id: selectedExcelId,
                 notion_database_id: notionDbId,
                 user_id: parseInt(userId, 10),
                 excel_worksheet_name: selectedWorksheetName,
                 columns_to_create:
                     direction === 'excel-to-notion' ? selectedColumnsToCreate : [],
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`Manuel Senkronizasyon başarısız: ${err.detail || err.error}`);
        }

        // 2. OTOMATİK SYNC KONFİGÜRASYONUNU OLUŞTUR
        if (autoSyncToggle && autoSyncMappingIds.length > 0) { 
            const autoSyncRes = await fetch(`${API_BASE_URL}/autosync/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(autoSyncCreationData),
            });

            const autoSyncData = await autoSyncRes.json();

            if (!autoSyncRes.ok) {
                successMessage += ` Ancak Otomatik Sync yapılandırılamadı: ${autoSyncData.detail || 'Bilinmeyen Hata'}`;
            } else {
                successMessage = `Manuel senkronizasyon tamamlandı ve Otomatik Sync yapılandırıldı. (${autoSyncData.message})`;
            }
        }

        setStep('complete');
        setMessage(successMessage);
    } catch (e: any) {
        setMessage(`Senkronizasyon İşlemi Sırasında Hata: ${e.message || e.toString()}`);
    }
};






  const renderConnectStep = () => (
    <div className="step-container">
        <h2>Adım 1: Microsoft Hesabını Bağla</h2>
        <p>Devam etmek için OneDrive/Excel hesabınıza erişim izni vermelisiniz.</p>
        <button className="primary-btn" onClick={handleMicrosoftConnect}>Microsoft Hesabını Bağla</button>
    </div>
  );

  const handleNotionConnect = () => {
    // Backend'deki /connect/notion endpoint'ine yönlendiriyoruz
    window.location.href = `${API_BASE_URL}/connect/notion?user_id=${userId}`; 
  };


  const renderNotionConnectStep = () => (
      <div className="step-container">
          <h2>Adım 2: Notion Hesabını Bağla</h2>
          <p>Senkronizasyonun çalışması için Notion API anahtarınızı bağlamanız gerekiyor. Lütfen tüm veritabanlarınız için izin verdiğinizden emin olun.</p>
          <button className="primary-btn" onClick={handleNotionConnect} disabled={!userId}>
              Notion Hesabını Bağla
          </button>
      </div>
  );

  
  const renderSelectStep = () => (
      <div className="step-container">
          <h2>Adım 3: Dosya Seçimi</h2>
          <p className="step-description">Lütfen senkronize etmek istediğiniz Excel dosyasını/sayfasını ve Notion Veritabanı ID'sini girin.</p>

          <div className="select-step-grid">
              {/* 1. EXCEL DOSYA SEÇİM KARTI */}
              <div className={`selection-card ${selectedExcelId ? 'is-selected' : ''}`}>
                  <h3>1. Excel Dosyası</h3>
                  <div className="field">
                      <label>OneDrive Dosyası Seçin:</label>
                      <select 
                          value={selectedExcelId} 
                          onChange={e => { 
                              setSelectedExcelId(e.target.value); 
                              if (e.target.value) {
                                  // Dosya seçildiğinde sayfaları getir
                                  fetchExcelWorksheets(e.target.value, userId!);
                                  setSelectedWorksheetName(''); 
                              }
                          }}
                      >
                          <option value="">Dosya Seçiniz...</option>
                          {excelFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                  </div>
              </div>
              
              {/* 2. EXCEL ÇALIŞMA SAYFASI SEÇİM KARTI */}
              <div className={`selection-card ${selectedWorksheetName ? 'is-selected' : ''}`}>
                  <h3>2. Çalışma Sayfası</h3>
                  <p className="card-hint">Dosyanın hangi sayfasını sync edeceğinizi seçin.</p>
                  {selectedExcelId ? (
                      excelWorksheets.length > 0 ? (
                          <div className="field">
                              <label>Sayfa Seçin:</label>
                              <select 
                                  value={selectedWorksheetName} 
                                  onChange={e => { 
                                      setSelectedWorksheetName(e.target.value); 
                                      // Sayfa seçildiğinde sütunları getir
                                      fetchExcelColumns(selectedExcelId, e.target.value);
                                  }}
                              >
                                  <option value="">Sayfa Seçiniz...</option>
                                  {excelWorksheets.map(ws => <option key={ws.name} value={ws.name}>{ws.name}</option>)}
                              </select>
                          </div>
                      ) : (
                          <p className="loading-state">Sayfalar yükleniyor...</p>
                      )
                  ) : (
                      <p className="disabled-state">Önce Excel dosyasını seçin.</p>
                  )}
              </div>

              {/* 3. NOTION ID GİRİŞ KARTI */}
              <div className={`selection-card notion-card ${notionDbId ? 'is-selected' : ''}`}>
                  <h3>3. Notion Veritabanı ID</h3>
                  <p className="card-hint">Notion veritabanı URL'sinden ID'yi kopyalayıp yapıştırın.</p>
                  <div className="field">
                      <label>Veritabanı ID'si:</label>
                      <input 
                          type="text" 
                          value={notionDbId} 
                          onChange={e => setNotionDbId(e.target.value)} 
                          placeholder="Veritabanı ID'sini yapıştırın" 
                      />
                  </div>
              </div>
          </div>

          {/* Aksiyon Butonu */}
          <div className="step-actions">
              <button 
                  className="btn btn-primary btn-lg" 
                  onClick={fetchNotionProperties} 
                  disabled={!selectedExcelId || !selectedWorksheetName || !notionDbId}>
                  Notion Özelliklerini Getir ve Eşleştirmeye Geç
              </button>
          </div>
      </div>
  );

  
  
  const renderMappingStep = () => {
      // `leftItems` ve `idMappingItem`'ı burada türetiyoruz
      const leftItems = syncDirection === 'excel-to-notion' ? excelColumns : notionProperties;
      const rightItems = syncDirection === 'excel-to-notion' ? notionProperties : excelColumns;
      const mappings = syncDirection === 'excel-to-notion' ? excelToNotionMappings : notionToExcelMappings;

      // ID sütununu dışarıda tutarak haritalama listesini oluştur
      const mappableLeftItems = leftItems.filter(item => item.name.toLowerCase() !== 'id');
      const idMappingItem = leftItems.find(item => item.name.toLowerCase() === 'id');


      // Eğer ID sütunu bulunamıyorsa veya mapping yoksa bir uyarı göster
      if (!idMappingItem) {
          return (
              <div className="step-container">
                  <h2 style={{color: 'red'}}>HATA!</h2>
                  <p>Senkronizasyonun çalışması için Excel dosyasında bir "ID" sütunu zorunludur. Lütfen dosyanızı kontrol edin veya yeni bir dosya seçin.</p>
                  <button className="secondary-btn" onClick={() => setStep('select')}>Geri Git</button>
              </div>
          );
      }
      
      // ID sütunu için Notion tarafında eşleşme aranacak
      const idSelectedRight = 
          idMappingItem ? (syncDirection === 'excel-to-notion' 
              ? mappings.find(m => m.excel_column.toLowerCase() === 'id')?.notion_property 
              : mappings.find(m => m.notion_property.toLowerCase() === 'id')?.excel_column
          ) : '';
      
      // 🚨 Hata Düzeltmesi: setMessage çağrısı buradan kaldırıldı.

      // Eğer ID seçiliyse VE global sync açıksa, ID de otomatik sync'e dahildir.
      const isIDAutoSynced = !!idSelectedRight && autoSyncToggle;


      return (
          <div className="step-container">
              <h2>Adım 4: Sütunları Eşleştirin</h2>

              {/* YÖN VE GLOBAL AYARLAR */}
              <div className="mapping-control-panel">
                  <div className="toggle-buttons">
                      <button
                          className={`btn-toggle ${syncDirection === 'excel-to-notion' ? 'active' : ''}`}
                          onClick={() => setSyncDirection('excel-to-notion')}
                      >
                          Excel <span className="arrow">→</span> Notion
                      </button>
                      <button
                          className={`btn-toggle ${syncDirection === 'notion-to-excel' ? 'active' : ''}`}
                          onClick={() => setSyncDirection('notion-to-excel')}
                      >
                          Notion <span className="arrow">→</span> Excel
                      </button>
                  </div>

                  <label className="auto-sync-toggle-global">
                      Otomatik Sync'i Aç
                      <input
                          type="checkbox"
                          checked={autoSyncToggle}
                          // useEffect hook'u bu çağrıdan sonra ID'yi autoSyncColumns'a ekleyecektir.
                          onChange={e => setAutoSyncToggle(e.target.checked)} 
                      />
                  </label>
              </div>
              {/* YÖN VE GLOBAL AYARLAR SONU */}
              
              <p className="step-description">
                  Senkronize etmek istediğiniz her bir sütunu karşı taraftaki uygun sütunla eşleştirin.
              </p>

              <div className="mapping-list-header">
                  <div className="mapping-list-left-title">{syncDirection === 'excel-to-notion' ? 'EXCEL SÜTUNLARI' : 'NOTION ÖZELLİKLERİ'}</div>
                  <div className="mapping-list-right-title">EŞLEŞTİRİLEN SÜTUN / ÖZELLİK</div>
                  <div className="mapping-list-autosync-title">OTOMATİK SYNC</div>
              </div>

              <div className="mapping-list-body">
                  {/* 1. KRİTİK ID SÜTUNU (Zorunlu ve Sabit) */}
                  <div className="mapping-row mapping-row-critical">
                      <div className="mapping-left">ID (Kritik Eşleşme)</div>
                      <div className="mapping-right">
                          <select
                              value={idSelectedRight || ''}
                              onChange={e => handleMappingChange(idMappingItem.name, e.target.value)}
                              // ID eşleşmesi her zaman olmalı
                              style={{ backgroundColor: idSelectedRight ? '#e6fff0' : '#ffe6e6' }}
                          >
                              <option value="">Seçiniz...</option>
                              {rightItems.map(p => (
                                  <option key={p.name} value={p.name}>
                                      {p.name}
                                      {/* Notion tarafında tip gösterimi eklendi */}
                                      {syncDirection === 'excel-to-notion' && 'type' in p && p.type
                                                  ? ` (${p.type})`
                                                  : ''} 
                                  </option>
                              ))}
                          </select>
                          {!idSelectedRight && <p className="info-text" style={{margin: '5px 0 0 0', textAlign: 'left', color: '#dc3545'}}>KRİTİK: ID sütununu eşleştirmelisiniz.</p>}
                      </div>
                      {/* 🚨 GÜNCELLENMİŞ ID AUTOSYNC KISMI: Global toggle'a bağlı */}
                      <div className="mapping-autosync">
                          {/* ID seçiliyse ve global sync açıksa: Otomatik açık */}
                          {isIDAutoSynced ? (
                              <span style={{ color: '#28a745', fontWeight: 'bold' }}>Açık (Zorunlu)</span>
                          ) : (
                              // Global Sync kapalıysa veya ID seçili değilse: Uyarı
                              <span className="info-text">
                                  {autoSyncToggle ? 'Eşleştirme bekleniyor' : 'Global Kapalı'}
                              </span>
                          )}
                      </div>
                  </div>

                  {/* 2. DİĞER EŞLEŞTİRMELER */}
                  {mappableLeftItems.map(item => {
                      const leftName = item.name;
                      const mapping = mappings.find(m => 
                          syncDirection === 'excel-to-notion' 
                              ? m.excel_column === leftName 
                              : m.notion_property === leftName
                      ) || { excel_column: '', notion_property: '', data_type: '' };
                      
                      const selectedRight =
                          syncDirection === 'excel-to-notion' ? mapping.notion_property : mapping.excel_column;
                      
                      // ID zaten ayrı bir bölümde işlendiği için burada tekrar kontrol etmiyoruz
                      const isAutoSynced = autoSyncColumns.includes(leftName); 
                      
                      return (
                          <div className={`mapping-row ${selectedRight ? 'is-mapped' : ''}`} key={leftName}>
                              <div className="mapping-left">{leftName}</div>
                              <div className="mapping-right">
                                  <select
                                      value={selectedRight || ''}
                                      onChange={e => handleMappingChange(leftName, e.target.value)}
                                  >
                                      <option value="">Eşleştirme Yapma</option>
                                      {rightItems.map(p => (
                                          <option key={p.name} value={p.name}>
                                              {syncDirection === 'excel-to-notion' && 'type' in p && p.type
                                                  ? `${p.name} (${p.type})`
                                                  : p.name}
                                          </option>
                                      ))}
                                  </select>
                              </div>
                              <div className="mapping-autosync">
                                  <label className="auto-sync-checkbox-label">
                                      <input
                                          type="checkbox"
                                          disabled={!autoSyncToggle || !selectedRight} // Global kapalıysa veya eşleşme yapılmadıysa devre dışı
                                          checked={isAutoSynced}
                                          onChange={e => handleAutoSyncColumnChange(leftName, e.target.checked)}
                                      />
                                      {isAutoSynced ? 'Açık' : 'Kapalı'}
                                  </label>
                              </div>
                          </div>
                      );
                  })}
              </div>
              
              {/* 3. NOTION'DA OLMAYAN SÜTUNLARI OLUŞTURMA */}
              {syncDirection === 'excel-to-notion' && unmatchedColumns.length > 0 && (
                  <div className="unmatched-columns-card">
                      <h3>Notion'da Olmayan Excel Sütunları</h3>
                      <p>Bu sütunları, Notion'da yeni <strong>Zengin Metin (Rich Text)</strong> özelliği olarak eklemek için işaretleyin:</p>
                      <div className="column-creation-options">
                          {unmatchedColumns.map(c => (
                              <label key={c} className="checkbox-label">
                                  <input
                                      type="checkbox"
                                      checked={selectedColumnsToCreate.includes(c)}
                                      onChange={e => handleCreateColumnChange(c, e.target.checked)}
                                  />
                                  {c}
                              </label>
                          ))}
                      </div>
                  </div>
              )}

              {/* 4. SENKRONİZASYONU BAŞLAT BUTONU */}
              <div className="sync-buttons step-actions">
                  <button
                      className="btn btn-primary btn-lg"
                      onClick={saveMappings}
                      disabled={!idSelectedRight}
                  >
                      Senkronizasyonu Başlat
                  </button>
              </div>
          </div>
      );
  };

  const renderCompleteStep = () => (
    <div className="step-container">
      <h2>Senkr. Tamamlandı!</h2>
      <p>{message}</p>
      <button className="primary-btn" onClick={() => setStep('select')}>Yeni Senkronizasyon</button>
      <button className="secondary-btn" onClick={() => setStep('dashboard')} style={{marginLeft: '10px'}}>Dashboard'a Git</button>
    </div>
  );
  
  const renderConnectStepHomeOrApp = () => {
      // Yasal sayfalar
      if (step === 'privacy') {
        return <PrivacyPolicy />;
    }
    if (step === 'terms') {
        return <TermsAndConditions />;
    }

    if (step === 'home') {
        return <Home />;
    }
      
      // Diğer uygulama adımları
      switch (step) {
          case 'connect':
              return renderConnectStep();
          case 'notion_connect':
              return renderNotionConnectStep();
          case 'select':
              return renderSelectStep();
          case 'mapping':
              return renderMappingStep();
          case 'complete':
              return renderCompleteStep();
          case 'dashboard':
              return <Dashboard />;
          case 'profile': // YENİ EKLENTİ
                return <Profile />;    
          default:
              return null;
      }
  }


  return (
    <div className="App">
        {/* 🚨 KRİTİK EKSİK 2: userEmail prop'u Header'a iletilmeli */}
        <HeaderComponent 
            setStep={setStep} 
            userEmail={userEmail} // <-- Bu satır ekli mi?
        /> 

        {/* 🚨 UYGULAMA İÇİ BAŞLIK: Yasal veya Ana Sayfa değilse gösterilir */}
        {step !== 'home' && step !== 'privacy' && step !== 'terms' && (
            <header className="app-content-header"> 
                <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0'}}>
                  <h1>NotiXel Synchronization</h1>
                  {message && <div className="message">{message}</div>}

                  {/* --- YENİ SYNC BUTONLARI --- */}
                  <div className="action-buttons-group">
                      {/* Yeni Sync Butonu: Dashboard'da değilsek görünür */}
                      {step !== 'dashboard' && (
                          <button onClick={() => setStep('dashboard')} className="secondary-btn" style={{ marginRight: '10px' }}>
                              Auto Sync Dashboard
                          </button>
                      )}
                      
                      {/* Dashboard'da veya Complete adımındaysak Yeni Sync butonu görünür */}
                      {(step === 'dashboard' || step === 'complete') && (
                          <button onClick={() => setStep('connect')} className="btn btn-primary">
                              ➕ Yeni Sync Oluştur
                          </button>
                      )}
                      
                  </div>
                  {/* --------------------------- */}
                </div>
            </header>
        )}
        
      <main>
        {/* Adımı render eden fonksiyona yönlendiriyoruz */}
        {renderConnectStepHomeOrApp()}
      </main>

      {/* 🚨 GLOBAL FOOTER: setStep'i ileterek her sayfada görünmesini sağlıyoruz */}
      <FooterComponent setStep={setStep} /> 
    </div>
  );
}

export default App;