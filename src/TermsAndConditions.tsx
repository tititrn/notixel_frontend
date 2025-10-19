import React from 'react';

const TermsAndConditions: React.FC = () => {
    return (
        <div className="policy-page-container container">
            <header className="policy-header">
                <h1>NotiXel Terms and Conditions</h1>
                <p>Last Updated: October 4, 2025</p>
            </header>
            
            <section className="policy-section">
                <h2>Contact and Acceptance</h2>
                <p>
                    If you have any questions about these Terms & Conditions, please contact us at <a href="mailto:support@notixel.com">support@notixel.com</a>.
                </p>
                <p>
                    By accessing or using the NotiXel service, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not use the Service.
                </p>
            </section>

            <section className="policy-section">
                <h2>1. Using Our Services</h2>
                <p>
                    You must follow any policies made available to you within the Services.
                </p>
                <ul>
                    <li>
                        <strong>Misuse:</strong> Do not misuse our Services. For example, do not interfere with our Services or try to access them using a method other than the interface and instructions we provide.
                    </li>
                    <li>
                        <strong>Compliance:</strong> You may use our Services only as permitted by law, including applicable export and control laws and regulations. We may suspend or stop providing our Services to you if you do not comply with our terms or policies.
                    </li>
                    <li>
                        <strong>Intellectual Property:</strong> Using our Services does not give you ownership of any intellectual property rights in our Services or the content you access. You may not copy, modify, distribute, sell, or lease any part of our Services or included software, nor may you reverse engineer or attempt to extract the source code.
                    </li>
                </ul>
            </section>

            <section className="policy-section">
                <h2>2. Privacy and Data Use</h2>
                <p>
                    Our <a href="/privacy">Privacy Policy</a> explains how we treat your personal data and protect your privacy when you use our Services. By using our Services, you agree that*NotiXel can use such data in accordance with our Privacy Policy.
                </p>
                <h3>Consent to Use of Technical Data</h3>
                <p>
                    You agree that we may collect and use technical data and related information about your device, operating system, and software usage, which is gathered periodically to facilitate the provision of support and maintenance relating to the Tools or used to create Updates. We use this information, as long as it is in a form that does not personally identify you, to improve our products or to provide services or technologies to you.
                </p>
            </section>
            
            <section className="policy-section">
                <h2>3. Subscription, Software, and Updates</h2>
                <p>
                    NotiXel provides you with a personal, worldwide, royalty-free, non-assignable, and non-exclusive license to use the software provided to you as part of the Services for the sole purpose of enabling you to use and enjoy the benefit of the application.
                </p>
                <ul>
                    <li>
                        <strong>Changes and Updates:</strong> We continually update our Tools. We may make changes to the features or functions of the Tools at any time, and we cannot guarantee that any specific feature will be available for the entire Subscription period.
                    </li>
                    <li>
                        <strong>Automatic Updates:</strong> The Service may automatically electronically upgrade the versions used. You expressly consent to such automatic Updates.
                    </li>
                </ul>

                <h3>Refund Policy</h3>
                <p>
                    By placing an order or making a purchase at NotiXel, you agree to these terms along with our Privacy Policy. If, for any reason, you are not completely satisfied with the service we provide, contact us. Generally, all fees are non-refundable. We may offer a full refund within the first 7 days of a new annual subscription at our sole discretion, provided no significant usage has occurred.
                </p>
            </section>
            
            <section className="policy-section">
                <h2>4. Warranties and Disclaimers</h2>
                <p>
                    We provide our Services using a commercially reasonable level of skill and care and hope you will enjoy using them. But there are certain things that we do not promise about our Services.
                </p>
                <p>
                    Other than as expressly set out in these terms or additional terms, NotiXel does not make any specific promises about the Services. For example, we do not make any commitments about their reliability, availability, or ability to meet your specific needs. We provide the Services as is.
                </p>
                <p>
                    To the extent permitted by law, we exclude all warranties, including the implied warranty of merchantability and fitness for a particular purpose.
                </p>
            </section>
            
            <section className="policy-section">
                <h2>5. Liability for Our Services</h2>
                <p>
                    When permitted by law, NotiXel will not be responsible for lost profits, revenues, or data, financial losses, or indirect, special, consequential, exemplary, or punitive damages.
                </p>
                <p>
                    To the extent permitted by law, the total liability of NotiXel and its suppliers and distributors for any claims under these terms is limited to the amount you paid us to use the Services (or, if we choose, to supplying you with the Services again).
                </p>
            </section>
            
            <section className="policy-section">
                <h2>6. Business Use and Indemnity</h2>
                <p>
                    If you are using our Services on behalf of a business, that business accepts these terms. It will hold harmless and indemnify NotiXel and its affiliates, officers, agents, and employees from any claim, action, or proceedings arising from or related to the use of the Services or violation of these terms.
                </p>
            </section>

            <section className="policy-section">
                <h2>7. Data Retention (Sync Configuration Data)</h2>
                <p>
                    We retain your core Sync Configuration Data (mapping settings, Excel IDs, Notion IDs, and tokens) while your account is active to ensure the service functions.
                </p>
                <p>
                    Deletion: If you terminate your account, NotiXel will retain your Data for a period of thirty (30) days (the “Retention Period”) to allow for re-activation. Following the Retention Period, we have the right to delete your Data from our servers in our sole discretion. It is your responsibility to keep copies of your source data (in Notion/Excel). NotiXel will not be responsible for any loss of Data after the Retention Period.
                </p>
            </section>
            
            <section className="policy-section">
                <h2>8. Law and Jurisdiction</h2>
                <p>
                    This agreement shall be governed by and interpreted according to the law of TÜRKİYE and all disputes arising under the Agreement (including non-contractual disputes or claims) shall be subject to the exclusive jurisdiction of the courts of TÜRKİYE.
                </p>
            </section>

            <footer className="policy-footer">
                <p>
                    We may modify these terms at any time. The updated terms will become effective no earlier than fourteen days after they are posted, except for changes addressing new functions or legal reasons, which will be effective immediately.
                </p>
            </footer>
        </div>
    );
};

export default TermsAndConditions;