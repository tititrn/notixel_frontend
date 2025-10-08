import React from 'react';

interface FooterProps {
    // setStep, yasal sayfalar arası geçiş için gereklidir
    setStep: (step: 'privacy' | 'terms' | 'home') => void; 
}

const FooterComponent: React.FC<FooterProps> = ({ setStep }) => { 
    return (
        // `footer` class'ı global stil için kullanılacaktır
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-col">
                    <h4>NotiXel</h4>
                    <p>&copy; 2025 All Rights Reserved.</p>
                </div>
                <div className="footer-col">
                    <h4>Corporate</h4>
                    {/* setStep ile sayfa içi yönlendirme: Linke tıklandığında URL değişmeden bileşen render edilir */}
                    <a href="#" onClick={(e) => { e.preventDefault(); setStep('privacy'); }}>Privacy Policy</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setStep('terms'); }}>Terms & Conditions</a>
                </div>
                <div className="footer-col">
                    <h4>Help</h4>
                    {/* FAQ linki, kullanıcıyı ana sayfaya yönlendirip anchor'a atmasını sağlar */}
                    <a href="#" onClick={(e) => { e.preventDefault(); setStep('home'); }}>FAQ</a>
                    <a href="mailto:support@notixel.com">Support</a>
                </div>
            </div>
        </footer>
    );
};

export default FooterComponent;