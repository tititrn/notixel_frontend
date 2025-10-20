import React from 'react';
import './Features.css'; // Importing our new style file

// The setStep type must include the necessary steps for navigation.
interface FeaturesProps {
    // Added for navigating back to 'connect' (login) and 'pricing' steps.
    setStep: (step: 'home' | 'connect' | 'pricing') => void; 
}

interface FeatureItem {
    icon: string;
    title: string;
    description: string;
    // We group by specifying categories
    category: 'Control and Security' | 'Automation and Speed' | 'Ease of Use';
}

const FEATURE_DATA: FeatureItem[] = [
    // --- CONTROL AND SECURITY ---
    {
        icon: '⚙️',
        title: 'Granular Column Sync',
        description: 'You decide exactly which Excel columns match which Notion properties. Sync only the data you need and leave the rest untouched.',
        category: 'Control and Security',
    },
    {
        icon: '🔑',
        title: 'Dedicated Sync ID System',
        description: 'Each synchronized row is tracked with a unique ID, guaranteeing that NotiXel never updates the wrong record, even if you reorder your rows.',
        category: 'Control and Security',
    },
    {
        icon: '🛡️',
        title: 'Secure and Confidential Data Processing',
        description: 'Your sensitive Microsoft and Notion API keys and data are stored encrypted on KVKK/GDPR compliant servers.',
        category: 'Control and Security',
    },
    // --- AUTOMATION AND SPEED ---
    {
        icon: '🔄',
        title: 'True Two-Way Synchronization ',
        description: 'Supports bidirectional data flow from Excel to Notion and from Notion to Excel. You determine the direction of your workflow.',
        category: 'Automation and Speed',
    },
    {
        icon: '⏰',
        title: 'Automatic and Scheduled Synchronization',
        description: 'Create set-and-forget automatic synchronization jobs that run at periods down to 15 minutes according to your plan.',
        category: 'Automation and Speed',
    },
    {
        icon: '⚡️',
        title: 'Instant Manual Synchronization',
        description: 'Need an urgent change? Run your configured sync job instantly with a single click from your Dashboard, no need to wait for the automatic schedule.',
        category: 'Automation and Speed',
    },
    // --- EASE OF USE ---
    {
        icon: '🖱️',
        title: 'Zero Code Required',
        description: 'No technical knowledge or complicated API setup is needed. Complete connection, mapping, and sync setup in just a few clicks.',
        category: 'Ease of Use',
    },
    {
        icon: '🛠️',
        title: 'Automatic Column Creation Without Errors',
        description: 'If a column you want to map in Excel does not exist in your Notion database, NotiXel automatically creates it for you with the correct data type (Number, Date, Text, etc.).',
        category: 'Ease of Use',
    },
    {
        icon: '📊',
        title: 'Centralized Management Dashboard',
        description: 'Easily view, manage, and instantly track the status of all your automated synchronization jobs from a single, centralized control panel.',
        category: 'Ease of Use',
    },
];

const Features: React.FC<FeaturesProps> = ({ setStep }) => {
    
    // Grouping features by category (for easier rendering)
    const groupedFeatures = FEATURE_DATA.reduce((acc, feature) => {
        if (!acc[feature.category]) {
            acc[feature.category] = [];
        }
        acc[feature.category].push(feature);
        return acc;
    }, {} as Record<FeatureItem['category'], FeatureItem[]>);

    // You should get the connection URL from Home.tsx/App.tsx. We are using the default.
    const MICROSOFT_CONNECT_URL = 'https://notixel-backend.onrender.com/connect/microsoft'; 

    return (
        <div className="features-page-container container">
            <header className="features-header">
                <h1>NotiXel Features</h1>
                <p className="features-subtitle">The smartest, fastest, and most reliable way to synchronize your data.</p>
            </header>

            {/* Category-Based Feature List */}
            {Object.entries(groupedFeatures).map(([category, features]) => (
                <section key={category} className="feature-category-section">
                    <h2 className="category-title">{category}</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {/* Final CTA Redirecting to Pricing */}
            <section className="features-cta-section">
                <h2>Get Started Now and Take Control of Your Data Automation.</h2>
                <p>Say goodbye to complex code or manual data entry. Check out our plans or start a free trial.</p>
                <div className="cta-buttons">
                    <button 
                        onClick={() => setStep('pricing')} 
                        className="btn btn-primary btn-lg"
                    >
                        Check Pricing Plans →
                    </button>
                    
                </div>
            </section>
        </div>
    );
};

export default Features;