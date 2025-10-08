import React from 'react';

// Projenizin backend'inde tanımladığınız Microsoft bağlantı URL'si
const MICROSOFT_CONNECT_URL = 'http://127.0.0.1:8000/connect/microsoft'; 

/**
 * Ana sayfa içeriğini (global header ve footer hariç) render eden bileşendir.
 */
const Home: React.FC = () => {
    return (
        <div className="home-page-container">
            {/* --- ANA İÇERİK: HERO BÖLÜMÜ --- */}
            <section className="hero-section">
                <div className="container hero-content">
                    <div className="hero-text">
                        <h1>Stop Copy-Pasting Data Between Notion and Excel.</h1>
                        <p>Automate your data flow, keep reports up-to-date, and save hours every week. Setup takes only 30 seconds.</p>
                        <div className="hero-cta">
                            <a href={MICROSOFT_CONNECT_URL} className="btn btn-primary">
                                Start for Free Now
                            </a>
                            <a href="https://youtu.be/..." target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                                Watch How It Works
                            </a>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src="/assets/sync-visual.svg" alt="Notion and Excel Synchronization Visual" />
                    </div>
                </div>
            </section>

            {/* --- ÖZELLİKLER BÖLÜMÜ --- */}
            <section id="features" className="features-section">
                <div className="container">
                    <h2>Features That Simplify Your Work</h2>
                    <div className="feature-grid">
                        <div className="feature-card">Bi-Directional Sync</div>
                        <div className="feature-card">Automatic Scheduling</div>
                        <div className="feature-card">Easy Column Mapping</div>
                    </div>
                </div>
            </section>
            
            {/* Diğer bölümler (Pricing, FAQ vb.) buraya eklenebilir */}
        </div>
    );
};

export default Home;