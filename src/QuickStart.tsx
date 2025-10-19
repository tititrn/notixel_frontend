import React from 'react';
import './QuickStart.css'; // Stil dosyasını import ediyoruz

// App.tsx'teki setStep türüyle eşleşmelidir
type QuickStartStep = 'home' | 'connect' | 'notion_connect' | 'select' | 'mapping' | 'complete' | 'dashboard' | 'privacy' | 'terms' | 'profile' | 'pricing' | 'quick_start';

interface QuickStartProps {
    setStep: (step: QuickStartStep) => void;
}

const API_BASE_URL = 'https://127.0.0.1:8000'; 

const QuickStart: React.FC<QuickStartProps> = ({ setStep }) => {
    
    const userId = localStorage.getItem('user_id');
    const loggedIn = !!userId;
    
    // Yönlendirme mantığı: Giriş yapmışsa Dashboard'a, yapmamışsa Connect'e
    const handleStartClick = () => {
        if (loggedIn) {
            setStep('dashboard'); // Logged in ise Dashboard'a
        } else {
            // Microsoft Connect rotasına yönlendir
            window.location.href = `${API_BASE_URL}/connect/microsoft`;
        }
    };

    // Yeniden kullanılabilir Adım Kartı Bileşeni
    const StepCard: React.FC<{title: string, children: React.ReactNode, index: number}> = ({ title, children, index }) => (
        <div className="step-card">
            <h2>
                <span className="step-number">{index}</span>
                {title}
            </h2>
            {children}
        </div>
    );

    return (
        <>
        {/* BAŞLIK KONTEYNER DIŞINDA */}
        <header className="quickstart-header">
            <h1> NotiXel Quick Start Guide</h1>
            <p>Set up your automated synchronization job in just 3 essential steps.</p>
        </header>
        <div className="quickstart-container">
            
            

            <section>
                
                {/* ADIM 1 */}
                <StepCard title="Connect Your Account and Select Excel Source" index={1}>
                    <p>Log in securely with your Microsoft account to authorize NotiXel's access to OneDrive. After successful login, you will be prompted to select the Excel file and worksheet you wish to sync.</p>
                    <button 
                        onClick={handleStartClick}
                        className="btn btn-primary btn-start"
                    >
                        {loggedIn ? 'Go to Dashboard' : 'Log in with Microsoft / Get Started'}
                    </button>
                </StepCard>

                {/* ADIM 2 */}
                <StepCard title="Authorize Your Notion Database" index={2}>
                    <p>The system will direct you to Notion's authorization flow. Please follow these steps:</p>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                        <li>Add the NotiXel Integration to your workspace.</li>
                        <li>Select the target database that NotiXel will update.</li>
                    </ul>
                </StepCard>

                {/* ADIM 3: KRİTİK ID VURGUSU */}
                <StepCard title="🔑 Map Fields and Define the CRITICAL ID Column" index={3}>
                    <p>This is the most crucial step for accurate synchronization. You will map your Excel columns to Notion properties, and set direction/interval settings.</p>
                    
                    <div className="id-warning">
                        <p><strong>🚨 CRITICAL ID WARNING:</strong> For reliable two-way synchronization, ensure the presence of a unique ID column in both your Excel file and Notion database.</p>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '10px' }}>
                            <li>The Excel ID column must contain unique numbers.</li>
                            <li>The matching Notion property must be set to the 'Number' format. This column is the key for NotiXel to recognize records.</li>
                        </ul>
                    </div>
                    
                    <p style={{ marginTop: '20px' }}>Finally, set the synchronization direction (Excel ↔ Notion) and the desired columns for automatic synchronization.</p>
                </StepCard>
            </section>
            
            {/* DASHBOARD REHBERİ */}
            <section className="dashboard-guide">
                <h2>📊 Dashboard Management Guide</h2>
                <p>Manage and monitor all your created synchronization jobs from your Dashboard.</p>

                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Purpose</th>
                            <th>How to Use</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong className="action-btn-sync">Run Sync (Manual Sync)</strong></td>
                            <td>Initiate synchronization IMMEDIATELY, bypassing the automatic interval.</td>
                            <td>Click the "Run Sync" button next to the job.</td>
                        </tr>
                        
                        <tr>
                            <td>View / Edit</td>
                            <td>Review or delete the unwanted column's mapping..</td>
                            <td>Click on the job row to open the detail modal.</td>
                        </tr>
                        <tr>
                            <td><strong className="action-btn-delete">Delete</strong></td>
                            <td>Permanently delete the synchronization job (this cannot be undone).</td>
                            <td>Click the "Delete" button next to the job.</td>
                        </tr>
                        <tr>
                            <td>Last Synced</td>
                            <td>Shows the timestamp of the last successful job completion.</td>
                            <td>Check the time in the 'last synced' column.</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <footer className="quickstart-footer">
                <p>
                    Congratulations! Once you save your sync job, all control is available in your Dashboard.
                </p>
                <p>
                    For any questions, please contact us at <a href="mailto:support@notixel.com">support@notixel.com</a>.
                </p>
            </footer>
        </div>
    </>    
    );
};

export default QuickStart;