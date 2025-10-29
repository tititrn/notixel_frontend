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
import Pricing from './Pricing';
import QuickStart from './QuickStart'
import FAQPage from './FAQPage';
import Features from './Features';

// 'home' adımını AppStep türüne ekliyoruz
// YENİ TİP EKLENTİLERİ: 'privacy' ve 'terms' eklendi
type AppStep = 'home' | 'connect' | 'notion_connect' | 'select' | 'mapping' | 'complete' | 'dashboard' | 'privacy' | 'terms' | 'profile' | 'pricing' | 'quick_start' | 'faq' | 'features';
type ExcelFile = { id: string; name: string };
type ExcelColumn = { name: string };
type NotionProperty = { name: string; type?: string };
type Mapping = { excel_column: string; notion_property: string; data_type: string };
type ExcelWorksheet = { name: string };
type NotionDatabase = { id: string; name: string }; 

const API_BASE_URL = 'https://notixel-backend.onrender.com';






const getInitialStep = (userId: string | null): AppStep => {
  // 1. URL'deki mevcut hash'i...
  const hash = window.location.hash.replace('#', '');
  if (hash && (hash === 'privacy' || hash === 'terms' || hash === 'faq' || hash === 'pricing' || hash === 'quick_start' || hash === 'features')) {
      return hash as AppStep; // Eğer hash varsa ve eşleşiyorsa, o adımı döndür
  }
  
  // ... (Geri kalan giriş kontrolü)
  // Varsayılan olarak 'home' döndürür
  return 'home';
}



function App() {
  // Başlangıç adımını, localStorage'daki user_id'ye göre belirliyoruz.
  const initialUserId = localStorage.getItem('user_id');
  // ID varsa 'connect' adımında başla, yoksa 'home' (giriş) sayfasında başla.
  const initialStep: AppStep = getInitialStep(initialUserId);
  
  const [step, setStep] = useState<AppStep>(getInitialStep(localStorage.getItem('user_id')));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('user_email'));
  const [syncDirection, setSyncDirection] = useState<'excel-to-notion' | 'notion-to-excel'>('excel-to-notion');
  const [autoSyncToggle, setAutoSyncToggle] = useState(false);
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>([]);
  const [excelColumns, setExcelColumns] = useState<ExcelColumn[]>([]);
  const [notionProperties, setNotionProperties] = useState<NotionProperty[]>([]);
  const [selectedExcelId, setSelectedExcelId] = useState<string>('');
  const [excelWorksheets, setExcelWorksheets] = useState<ExcelWorksheet[]>([]); // Yeni
  const [selectedWorksheetName, setSelectedWorksheetName] = useState<string>(''); // Yeni
  
  const [message, setMessage] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(initialUserId); // initialUserId'yi kullanıyoruz

  const [excelToNotionMappings, setExcelToNotionMappings] = useState<Mapping[]>([]);
  const [notionToExcelMappings, setNotionToExcelMappings] = useState<Mapping[]>([]);
  
  const [unmatchedColumns, setUnmatchedColumns] = useState<string[]>([]);
  const [selectedColumnsToCreate, setSelectedColumnsToCreate] = useState<string[]>([]);
  
  const [autoSyncColumns, setAutoSyncColumns] = useState<string[]>([]);
  const [notionDbId, setNotionDbId] = useState<string | null>(null); 
  const [notionDatabases, setNotionDatabases] = useState<NotionDatabase[]>([]);
  const [notionDatabasesLoading, setNotionDatabasesLoading] = useState<boolean>(false);
  const [notionDatabasesError, setNotionDatabasesError] = useState<string | null>(null);
  

  const loggedIn = !!userId; // Kullanıcı oturum açmış mı?

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


useEffect(() => {
    const handleHashChange = () => {
        // Hash'i alıp başındaki '#' işaretini kaldır
        const newHash = window.location.hash.replace('#', '');
        
        // AppStep tipindeki tüm geçerli adımları kontrol et
        if (newHash && (newHash === 'privacy' || newHash === 'terms' || newHash === 'faq' || newHash === 'pricing' || newHash === 'quick_start' || newHash === 'features' || newHash === 'home' || newHash === 'connect' || newHash === 'dashboard' || newHash === 'profile')) {
            setStep(newHash as AppStep);
        } else if (!newHash) {
            // Eğer hash boşaltılırsa, ana sayfaya dön
            setStep('home');
        }
    };

    // Dinleyiciyi kaydet
    window.addEventListener('hashchange', handleHashChange);
    
    // Temizleme fonksiyonu: Bileşen kaldırıldığında dinleyiciyi kaldır
    return () => {
        window.removeEventListener('hashchange', handleHashChange);
    };
}, [setStep]); // setStep değiştiğinde yeniden bağlanmalı


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
            if (isNewLogin) setMessage('Microsoft connection successful. Now connect your Notion account.');
        } else {
            setStep('select');
            fetchExcelFiles(id);
            if (isNewLogin) setMessage('Connections complete! Select your Excel file.');
        }
    };
    
    // --- 1. Notion Callback Handling (Notion'dan döndüğünde) ---
    if (notionAuthSuccess) {
        const currentId = localStorage.getItem('user_id');
        if (currentId) {
            setStep('pricing');
            fetchExcelFiles(currentId);
            setMessage('Notion connection successful! Now select a plan.');
        } else {
            setMessage('Error: Notion connection successful but user ID is missing.');
            setStep('home');
        }
        window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        return;
    }
   
    
    if (notionAuthError) {
         setMessage(`Notion connection error: ${params.get('message') || 'Unknown error.'}`);
         setStep('notion_connect'); 
         window.history.replaceState(null, '', window.location.pathname);
         return;
    }

    // --- 2. Microsoft Callback Handling (Microsoft'tan döndüğünde) ---
    if (authSuccess && receivedUserId) {
    initializeApp(receivedUserId, true);

    // 💡 Kullanıcı bilgilerini backend'den al (örnek endpoint)
    fetch(`${API_BASE_URL}/get-user?user_id=${receivedUserId}`)
        .then(async (res) => {
            if (!res.ok) throw new Error("User information could not be retrieved.");
            const data = await res.json();

            // E-posta bilgisi geldiyse kaydet
            if (data.email) {
                localStorage.setItem("user_email", data.email);
                setUserEmail(data.email);
            } else {
                console.warn("Email information returned empty:", data);
            }
        })
        .catch((err) => console.error("User information could not be retrieved:", err));

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
    const hash = window.location.hash.replace('#', '');
    if (hash && ['privacy','terms','faq','pricing','quick_start','features'].includes(hash)) {
        setStep(hash as AppStep);
    } else {
        setStep('home');
    }
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
                setMessage('ID column matched automatically.');
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


const fetchNotionDatabases = useCallback(async (userId: string) => {
    setNotionDatabasesLoading(true);
    setNotionDatabasesError(null);
    try {
        // Yeni backend endpoint'ini çağırıyoruz
        const response = await fetch(`${API_BASE_URL}/get-notion-databases?user_id=${userId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            // Backend'den gelen hata mesajını kullanıyoruz.
            const errorMsg = errorData.error || 'Databases could not be loaded.'; 
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        const databases: NotionDatabase[] = data.databases || [];
        setNotionDatabases(databases);
        
        // Veritabanı varsa ve henüz seçili değilse, ilkini varsayılan olarak seç
        if (databases.length > 0 && !notionDbId) {
            setNotionDbId(databases[0].id);
        }
        
    } catch (err) {
        // Kullanıcıya gösterilecek hata mesajı
        setNotionDatabasesError(`Notion databases could not be retrieved. Please check your Notion integration settings. Error: ${err instanceof Error ? err.message : 'Unknown Error'}`);
    } finally {
        setNotionDatabasesLoading(false);
    }
}, [notionDbId]); // Dependency olarak notinDbId ve setNotionDbId'yi (implicit) ekliyoruz.

// 🔑 YENİ: Notion veritabanlarını yüklemek için useEffect
useEffect(() => {
    // Adım 'select' olduğunda, kullanıcı ID'si varsa ve veritabanları henüz yüklenmemişse/yükleniyorsa yüklemeyi başlat
    if (step === 'select' && userId && notionDatabases.length === 0 && !notionDatabasesLoading && !notionDatabasesError) {
        fetchNotionDatabases(userId);
    }
    // NOT: fetchNotionDatabases useCallback içinde olduğu için buraya eklemiyoruz.
}, [userId, step, notionDatabases.length, notionDatabasesLoading, notionDatabasesError, fetchNotionDatabases]); // fetchNotionDatabases dependency'si eklendi


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

      } else setMessage(`Excel sheets could not be retrieved: ${data.error}`);
    } catch {
      setMessage('A network error occurred while retrieving Excel sheets.');
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
        setMessage('A network error occurred during the connection check.');
        return false;
    }
  };

  const fetchExcelFiles = async (currentUserId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-excel-files?user_id=${currentUserId}`);
      const data = await res.json();
      if (res.ok) setExcelFiles(data.files);
      else setMessage(`Excel files could not be retrieved: ${data.error}`);
    } catch {
      setMessage('A network error occurred while retrieving Excel files.');
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
          setMessage('The "ID" column is not found, select another file.');
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
      } else setMessage(`Excel columns could not be retrieved: ${data.error}`);
    } catch {
      setMessage('A network error occurred while retrieving Excel columns.');
    }
  };

  const fetchNotionProperties = async () => {
    if (!notionDbId) {
      setMessage('Please select a Notion Database.');
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
      } else setMessage(`Notion properties could not be retrieved: ${data.error}`);
    } catch {
      setMessage('A network error occurred while retrieving Notion properties.');
    }
  };

  

  const handleCreateColumnChange = (colName: string, checked: boolean) => {
    setSelectedColumnsToCreate(prev =>
      checked ? [...prev, colName] : prev.filter(c => c !== colName)
    );
  };

  
  

  
  

const saveMappings = async () => {
    if (!userId) { setMessage('User ID not found.'); return; }

    const mappings = syncDirection === 'excel-to-notion' ? excelToNotionMappings : notionToExcelMappings;
    const validMappings = mappings.filter(m =>
        syncDirection === 'excel-to-notion' ? m.notion_property.trim() !== '' : m.excel_column.trim() !== ''
    );
    
    if (validMappings.length === 0) { setMessage("Select at least one column."); return; }
    
    const idMappingExists = validMappings.some(m => 
        (syncDirection === 'excel-to-notion' && m.excel_column.toLowerCase() === 'id') ||
        (syncDirection === 'notion-to-excel' && m.notion_property.toLowerCase() === 'id')
    );
    
    if (!idMappingExists) {
        setMessage("Matching the 'ID' column is mandatory for synchronization.");
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
            
            setMessage("Matches saved successfully. Starting synchronization...");
            startSync(syncDirection, allSavedMappings); 
        } else {
            const err = data;
            setMessage(`Matches could not be saved: ${err.error || err.detail}`);
        }
    } catch {
        setMessage('A network error occurred while saving the matches.');
    }
};


const startSync = async (
    direction: 'excel-to-notion' | 'notion-to-excel',
    allSavedMappings: { id: number, excel_column: string, notion_property: string }[] 
  ) => {
    if (!userId) {
        setMessage('User ID not found.');
        return;
    }

    let successMessage = 'Synchronization completed successfully.';

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
            throw new Error(`Manual Synchronization failed: ${err.detail || err.error}`);
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
                successMessage += ` However, Automatic Sync could not be configured.: ${autoSyncData.detail || 'Unknown Error'}`;
            } else {
                successMessage = `Manual synchronization is complete and Automatic Sync is configured. (${autoSyncData.message})`;
            }
        }

        setStep('complete');
        setMessage(successMessage);
    } catch (e: any) {
        setMessage(`Error During Synchronization Process: ${e.message || e.toString()}`);
    }
};






  const renderConnectStep = () => (
    <div className="step-container">
        <h2>Connect Microsoft Account</h2>
        <p>You must grant permission to access your OneDrive/Excel account to continue.</p>
        <button className="primary-btn" onClick={handleMicrosoftConnect}>Connect Microsoft Account</button>
    </div>
  );

  const handleNotionConnect = () => {
    // Backend'deki /connect/notion endpoint'ine yönlendiriyoruz
    window.location.href = `${API_BASE_URL}/connect/notion?user_id=${userId}`; 
  };


  const renderNotionConnectStep = () => (
      <div className="step-container">
          <h2>Connect Notion Account</h2>
          <p>Synchronization requires you to connect your Notion API key. Please ensure you have granted permission for your correct databases.</p>
          <button className="primary-btn" onClick={handleNotionConnect} disabled={!userId}>
              Connect Notion Account
          </button>
      </div>
  );

  
  const renderSelectStep = () => (

      <div className="step-container">

          <h2>File Selection</h2>

          <p className="step-description">Please select the Excel file/sheet and Notion Database you wish to synchronize.</p>



          <div className="select-step-grid">

              {/* 1. EXCEL DOSYA SEÇİM KARTI (DEĞİŞMEDİ) */}

              <div className={`selection-card ${selectedExcelId ? 'is-selected' : ''}`}>

                  <h3>Excel File</h3>

                  <div className="field">

                      <label>Excel File:</label>

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

                          <option value="">Select File...</option>

                          {excelFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}

                      </select>

                  </div>

              </div>

              

              {/* 2. EXCEL ÇALIŞMA SAYFASI SEÇİM KARTI (DEĞİŞMEDİ) */}

              <div className={`selection-card ${selectedWorksheetName ? 'is-selected' : ''}`}>

                  <h3>Excel Sheet</h3>

                  <p className="card-hint">Select which Sheet you want to sync.</p>

                  {selectedExcelId ? (

                      excelWorksheets.length > 0 ? (

                          <div className="field">

                              <label>Select Sheet</label>

                              <select 

                                  value={selectedWorksheetName} 

                                  onChange={e => { 

                                      setSelectedWorksheetName(e.target.value); 

                                      // Sayfa seçildiğinde sütunları getir

                                      fetchExcelColumns(selectedExcelId, e.target.value);

                                  }}

                              >

                                  <option value="">Select Sheet...</option>

                                  {excelWorksheets.map(ws => <option key={ws.name} value={ws.name}>{ws.name}</option>)}

                              </select>

                          </div>

                      ) : (

                          // Loading state için bir kontrol ekledik, eğer yükleme state'i mevcut değilse bu şekilde kalabilir.
                          <p className="loading-state">Sheets are loading...</p> 

                      )

                  ) : (

                      <p className="disabled-state">Select the Excel file first.</p>

                  )}

              </div>



              {/* 3. NOTION VERİTABANI DROPDOWN KARTI (YENİ) */}

              <div className={`selection-card notion-card ${notionDbId ? 'is-selected' : ''}`}>

                  <h3>Notion Database</h3>

                  <p className="card-hint">Select the database for synchronization.</p>

                  
                  {/* Hata Mesajı */}
                  {notionDatabasesError && <p className="message error-message">{notionDatabasesError}</p>}


                  <div className="field">

                      <label htmlFor="notion-db-select">Notion Database:</label>

                      
                      {notionDatabasesLoading ? (
                            <p className="loading-state">Notion databases are loading...</p>
                        ) : notionDatabases.length > 0 ? (
                            // KRİTİK DEĞİŞİKLİK: Dropdown Menü
                            <select
                                id="notion-db-select"
                                // notionDbId state'inizin adını kullandık
                                value={notionDbId || ''} 
                                onChange={(e) => setNotionDbId(e.target.value)}
                                className="input-select" 
                                disabled={notionDatabasesLoading}
                            >
                                <option value="" disabled>Select a database</option>
                                
                                {notionDatabases.map(db => (
                                    <option key={db.id} value={db.id}>
                                        {db.name} (ID: ...{db.id.slice(-4)})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            // Veritabanı bulunamazsa uyarı
                            !notionDatabasesError && (
                                <p className="disabled-state">
                                    No database accessible by NotiXel was found. Please make sure you have given permission in your Notion database with the NotiXel integration.
                                </p>
                            )
                        )}
                  </div>
              </div>
          </div>



          {/* Aksiyon Butonu (DEĞİŞMEDİ) */}

          <div className="step-actions">

              <button 

                  className="btn btn-primary btn-lg" 

                  onClick={fetchNotionProperties} 

                  disabled={!selectedExcelId || !selectedWorksheetName || !notionDbId}>

                  Proceed to Mapping

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
                  <h2 style={{color: 'red'}}>ERROR!</h2>
                  <p>An "ID" column in the Excel file is mandatory for synchronization to work. Please check your file or select a new one.</p>
                  <button className="secondary-btn" onClick={() => setStep('select')}>Go Back</button>
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
              <h2>Match Collumns</h2>

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
                      Activate Automatic Sync
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
                  Match each column you want to synchronize with the corresponding column on the other side.
              </p>

              <div className="mapping-list-header">
                  <div className="mapping-list-left-title">{syncDirection === 'excel-to-notion' ? 'EXCEL SÜTUNLARI' : 'NOTION ÖZELLİKLERİ'}</div>
                  <div className="mapping-list-right-title">MATCHED COLUMNS / PROPERTIES</div>
                  <div className="mapping-list-autosync-title">AUTOMATIC SYNC</div>
              </div>

              <div className="mapping-list-body">
                  {/* 1. KRİTİK ID SÜTUNU (Zorunlu ve Sabit) */}
                  <div className="mapping-row mapping-row-critical">
                      <div className="mapping-left">ID (Critical Match)</div>
                      <div className="mapping-right">
                          <select
                              value={idSelectedRight || ''}
                              onChange={e => handleMappingChange(idMappingItem.name, e.target.value)}
                              // ID eşleşmesi her zaman olmalı
                              style={{ backgroundColor: idSelectedRight ? '#e6fff0' : '#ffe6e6' }}
                          >
                              <option value="">Choose...</option>
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
                          {!idSelectedRight && <p className="info-text" style={{margin: '5px 0 0 0', textAlign: 'left', color: '#dc3545'}}>CRITICAL: You must match the ID column.</p>}
                      </div>
                      {/* 🚨 GÜNCELLENMİŞ ID AUTOSYNC KISMI: Global toggle'a bağlı */}
                      <div className="mapping-autosync">
                          {/* ID seçiliyse ve global sync açıksa: Otomatik açık */}
                          {isIDAutoSynced ? (
                              <span style={{ color: '#28a745', fontWeight: 'bold' }}>On (Mandatory)</span>
                          ) : (
                              // Global Sync kapalıysa veya ID seçili değilse: Uyarı
                              <span className="info-text">
                                  {autoSyncToggle ? 'Waiting for mapping' : 'Global Closed'}
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
                                      <option value="">Do Not Map</option>
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
                      <h3>Excel Columns Not In Notion</h3>
                      <p>Mark these columns to add them as new <strong> Rich Text </strong> properties in Notion:</p>
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
                      Start Synchronization
                  </button>
              </div>
          </div>
      );
  };

  const renderCompleteStep = () => (
    <div className="step-container">
      <h2>Sync Complete!</h2>
      <p>{message}</p>
      <button className="primary-btn" onClick={() => setStep('select')}>New Synchronization</button>
      <button className="secondary-btn" onClick={() => setStep('dashboard')} style={{marginLeft: '10px'}}>Go to Dashboard</button>
    </div>
  );
  

  

  const renderConnectStepHomeOrApp = () => {
      

      // Diğer uygulama adımları
      switch (step) {
          case 'home':
              return <Home setStep={setStep} />;
          case 'privacy':
              return <PrivacyPolicy />;
          case 'quick_start': // 👈 YENİ
              return <QuickStart setStep={setStep} />;     
          case 'terms':
              return <TermsAndConditions />;    
          case 'connect':
              return renderConnectStep();
          case 'notion_connect':
              return renderNotionConnectStep();
          case 'pricing': 
              return <Pricing setStep={setStep} />;    
          case 'select':
              return renderSelectStep();
          case 'mapping':
              return renderMappingStep();
          case 'complete':
              return renderCompleteStep();
          case 'dashboard':
              return <Dashboard />;
          case 'profile': // YENİ EKLENTİ
                return <Profile setStep={function (step: 'home' | 'connect'): void {
                    throw new Error('Function not implemented.');
                } } />;
          case 'faq':
                return <FAQPage setStep={setStep as (step: string) => void} />; 
          case 'features': // <-- YENİ CASE
                return <Features setStep={setStep} />;      
          default:
              return null;
      }
  }


  return (
    <div className="App">
      {/* 🚨 HeaderComponent her zaman görünür, içeriği login durumuna göre değişir */}
      <HeaderComponent setStep={setStep} userEmail={userEmail} />

      {/* --- ANA BAŞLIK BÖLÜMÜNÜ KALDIRIYORUZ --- */}
      {/* Ana başlık ve global Sync butonlarını artık HeaderComponent veya Dashboard'da yöneteceğiz */}
      {/* Aşağıdaki <header> bloğu artık gereksizdir ve kaldırılmalıdır. */}

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