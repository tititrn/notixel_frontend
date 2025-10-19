import React from 'react';
import "./FAQPage.css";





// Soru ve Cevap yapısının tanımı
interface FAQItem {
    question: string;
    answer: string;
}

// Tüm Soru ve Cevapların Listesi (Önceki sohbette hazırladığımız liste)
export const ALL_FAQ_ITEMS: FAQItem[] = [
    // Mevcut Sorularınız
    {
        question: 'How secure is my data?',
        answer: 'Your data is highly secure. We use the official Microsoft Graph API and Notion API for all data transfer. We do not store your actual data (Excel cell contents or Notion page content), only the necessary tokens and synchronization configurations.',
    },
    {
        question: 'Do I need to pay for Notion or Excel?',
        answer: 'NotiXel is a synchronization tool. You must have active accounts for both Microsoft 365 (to use Excel online with OneDrive) and Notion to use our service.',
    },
    {
        question: 'What happens if I change a column name in Excel?',
        answer: 'NotiXel uses a unique mapping ID to link your Excel columns and Notion properties. If you change a name, you may need to re-map the column in your NotiXel Dashboard.',
    },
    
    // Yeni Eklenen Sorular
    {
        question: 'What is the difference between Manual Sync and Auto Sync?',
        answer: "Manual Sync is a one-time operation you trigger from the Dashboard. It's available on all plans. Auto Sync is a scheduled job (e.g., every 30 minutes, 1 hour) that runs automatically in the background. Auto Sync is a subcribtion based feature, the number of jobs depends on your subscription level.",
    },
    {
        question: 'Can I change my plan (upgrade/downgrade/cancel) at any time?',
        answer: 'Yes. You can manage your subscription (upgrade, downgrade, or cancel) instantly through the Customer Portal link provided on your Profile page. Your service remains active until the end of your current billing period, even after cancellation.',
    },
    {
        question: 'How does NotiXel handle conflicts when both sides change?',
        answer: 'NotiXel uses a Last-Write-Wins approach within the configured direction. For example, if your job is set to Excel → Notion, the Excel data will always overwrite the Notion data for that specific mapping, regardless of which one changed last. To avoid conflicts, you should use the same side to enter data as the one you are syncing in..',
    },
    {
        question: 'Is there a limit on the number of rows I can sync?',
        answer: 'No, there is no hard limit on the number of rows you can sync with a single job. The main limits are on the number of Auto Sync Jobs and the sync interval (how often the job runs), which are defined by your subscription plan.',
    },
    {
        question: 'What happens if a sync fails?',
        answer: 'If an Auto Sync fails (e.g., Notion token is revoked, file is moved), NotiXel will retry the job automatically during the next scheduled interval. After several continuous failures, the system will automatically pause the job.',
    },
];

interface FAQPageProps {
    setStep: (step: string) => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ setStep }) => {
    return (
        <div className="policy-page-container container">
            <header className="faq-header">
                <h1>Frequently Asked Questions</h1>
                <p>Find quick answers to the most common questions about NotiXel's service, security, and plans.</p>
                
                
            </header>

            <section className="faq-section" style={{ padding: '0' }}>
                <div className="faq-list">
                    {ALL_FAQ_ITEMS.map((item, index) => (
                        // App.css dosyanızdaki .faq-item, .faq-question, .faq-answer sınıflarını kullanır
                        <div key={index} className="faq-item" style={{ marginBottom: '25px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                            <h4 className="faq-question">❓ {item.question}</h4>
                            <p className="faq-answer">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default FAQPage;