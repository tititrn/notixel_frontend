import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="policy-page-container container">
            <header className="policy-header">
                <h1>NotiXel Privacy Policy</h1>
                <p>Last Updated: October 4, 2025</p>
            </header>

            <section className="policy-section">
                <h2>Our Commitment to Data Safety</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us.
                </p>
                <p>
                    We will **never share, rent, or sell your personal data** to others. We do not share your data with AI models or other third-party tools, except as required to perform the synchronization services you explicitly configure. Our commitment is to keep your data safe and confidential. We follow these principles when building NotiXel.
                </p>
                <p>
                    We only store appropriate data necessary to deliver our services, maintain your account, and to communicate with you.
                </p>
            </section>

            <section className="policy-section">
                <h2>1. Integration APIs and Data Transfer</h2>
                <p>
                    NotiXel uses the Microsoft Graph API and the Notion API to perform synchronization. Data transfer is strictly between your Notion and Microsoft accounts, mediated by our service.
                </p>

                <h3>Microsoft OAuth Permissions (Scopes) we use:</h3>
                <p>We require access to the following permissions from your Microsoft account:</p>
                <ul>
                    <li>
                        <code>openid profile offline_access User.Read</code>: To read your basic profile and email address (for identification) and maintain access without constant re-login.
                    </li>
                    <li>
                        <code>Files.ReadWrite.All</code>: This permission is necessary to read data from and write data to the **specific Excel files** on your OneDrive that you explicitly select for synchronization.
                    </li>
                </ul>

                <h3>Notion API Integration:</h3>
                <p>
                    We request access to your Notion workspace via their OAuth flow. We only interact with the **specific databases** you share with the "NotiXel" integration and store your secure Notion API key to facilitate data exchange.
                </p>
                <p className="important-note">
                    **Data Transfer Principle:** The content of your Excel files and Notion pages are **NEVER** transmitted to any third-party service outside of the user's direct control or knowledge (i.e., we only move data between your Microsoft and Notion accounts).
                </p>
            </section>
            
            <section className="policy-section">
                <h2>2. What Information We Collect</h2>
                
                <h3>A. Personal Identification Information (PII)</h3>
                <ul>
                    <li>
                        <strong>Email Address:</strong> Collected during the Microsoft sign-in process, which serves as your unique identifier in our system.
                    </li>
                    <li>
                        <strong>Name/Profile:</strong> Basic profile information retrieved during OAuth solely for personalizing your application experience.
                    </li>
                </ul>

                <h3>B. Service Credentials</h3>
                <p>
                    To enable the synchronization service, we store highly sensitive, encrypted tokens:
                </p>
                <ul>
                    <li>
                        <strong>Microsoft Refresh Token:</strong> Allows us to obtain new Access Tokens to keep synchronization active without you having to re-authenticate frequently.
                    </li>
                    <li>
                        <strong>Notion API Key:</strong> The secure token provided by Notion to access your selected databases.
                    </li>
                </ul>

                <h3>C. Account & Activity Data</h3>
                <ul>
                    <li>
                        <strong>Account Information:</strong> We track your subscription plan, validity, and usage history (e.g., number of active AutoSync jobs) to enforce the service limits defined in your plan.
                    </li>
                    <li>
                        <strong>Log/Activity Data:</strong> We collect logs to help us investigate issues, monitor performance, and improve reliability (e.g., time taken for a sync job, successful sync history, errors encountered). We **do not store the content** of the data being synchronized in these logs.
                    </li>
                </ul>
            </section>

            <section className="policy-section">
                <h2>3. How We Use the Information</h2>
                <ul>
                    <li>
                        <strong>To Provide Our Services:</strong> We use your tokens and configuration settings (mappings, sync direction) to execute the automated data transfer between Notion and Excel.
                    </li>
                    <li>
                        <strong>To Support Our Services:</strong> We use activity and log details to monitor outages, blockages, or errors and to investigate and resolve issues you report.
                    </li>
                    <li>
                        <strong>Communication with You:</strong> We use your email address to send service-related notifications, updates about new features/releases, and to respond to your support queries.
                    </li>
                </ul>
            </section>
            
            <section className="policy-section">
                <h2>4. Data Security and Third Parties</h2>
                <p>
                    We rely on industry-standard security practices for data encryption and infrastructure security.
                </p>
                <ul>
                    <li>
                        <strong>Underlying Platform:</strong> We rely on our cloud hosting provider (e.g., Render, DigitalOcean) to provide the physical and virtual security of the underlying platform.
                    </li>
                    <li>
                        <strong>Third-Party Analytics:</strong> We may use services like Google Analytics or equivalent monitoring tools that collect and analyze information regarding website usage and application performance for quality-improvement purposes.
                    </li>
                </ul>
                
                <p>
                    **Important Note:** Anyone with whom you share your Excel file or Notion database will be able to see the synchronized data. NotiXel is not responsible for data visibility once it is successfully transferred to your accounts.
                </p>
            </section>

            <section className="policy-section">
                <h2>5. Changes to the Policy</h2>
                <p>
                    We reserve the right to update or change our Privacy Policy at any time, and you should check this Privacy Policy periodically. Your continued use of the Service after we post any modifications will constitute your acknowledgement of the modifications and your consent to abide by the modified policy.
                </p>
            </section>

            <footer className="policy-footer">
                <h2>Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@notixel.com">support@notixel.com</a>.</p>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;