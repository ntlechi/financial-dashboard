import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
              <p className="text-gray-400">The Freedom Compass App</p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-gray-800 rounded-lg p-4 mb-8">
          <p className="text-gray-300">
            <strong>Last Updated:</strong> October 2025
          </p>
          <p className="text-gray-400 text-sm mt-1">
            This Privacy Policy explains how The Freedom Compass App collects, uses, and protects your information.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Welcome to The Freedom Compass App ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal and financial information. This Privacy Policy explains how we collect, use, store, and protect your information when you use our financial tracking application.
              </p>
              <p>
                By using The Freedom Compass App, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">2.1 Personal Information</h3>
            <div className="text-gray-300 space-y-2 mb-4">
              <p>We collect the following personal information:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email address (for account creation and communication)</li>
                <li>Name (optional, for personalization)</li>
                <li>Payment information (processed securely through Stripe)</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">2.2 Financial Data</h3>
            <div className="text-gray-300 space-y-2 mb-4">
              <p>You voluntarily provide financial information including:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Transaction records (manually entered by you)</li>
                <li>Budget information and financial goals</li>
                <li>Investment portfolio data (manually entered)</li>
                <li>Income and expense categories</li>
                <li>Net worth and asset information</li>
              </ul>
              <p className="font-semibold text-yellow-300">
                Important: We do NOT connect to your bank accounts or automatically collect financial data. All financial information is manually entered by you.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">2.3 Usage Data</h3>
            <div className="text-gray-300 space-y-2">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>App usage patterns and feature interactions</li>
                <li>Device information (browser type, operating system)</li>
                <li>IP address and general location data</li>
                <li>Session duration and frequency of use</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <div className="text-gray-300 space-y-4">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Provide our services:</strong> Enable you to track your finances, create budgets, and manage your financial goals</li>
                <li><strong>Account management:</strong> Create and maintain your user account</li>
                <li><strong>Communication:</strong> Send important updates, security alerts, and customer support responses</li>
                <li><strong>Payment processing:</strong> Process subscription payments securely through Stripe</li>
                <li><strong>Improve our app:</strong> Analyze usage patterns to enhance features and user experience</li>
                <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security threats</li>
                <li><strong>Legal compliance:</strong> Meet legal obligations and enforce our terms of service</li>
              </ul>
            </div>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Storage and Security</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">4.1 Security Measures</h3>
            <div className="text-gray-300 space-y-2 mb-4">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                <li><strong>Firebase Security:</strong> We use Google Firebase with enterprise-grade security</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can view your data</li>
                <li><strong>Regular Audits:</strong> We regularly review and update our security practices</li>
                <li><strong>Secure Payments:</strong> Payment processing is handled by Stripe (PCI DSS compliant)</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">4.2 Data Location</h3>
            <div className="text-gray-300 space-y-2">
              <p>Your data is stored on secure servers provided by Google Firebase, which may be located in various countries. Firebase complies with international data protection standards including GDPR.</p>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Sharing and Disclosure</h2>
            
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-4">
              <p className="text-green-300 font-semibold">
                🔒 We do NOT sell, rent, or trade your personal or financial information to third parties.
              </p>
            </div>

            <div className="text-gray-300 space-y-4">
              <p>We may share your information only in these limited circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With trusted third-party services that help us operate our app (Firebase, Stripe, email services) under strict confidentiality agreements</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Safety and Security:</strong> To protect the rights, property, or safety of our users or the public</li>
                <li><strong>Business Transfer:</strong> In the event of a merger, acquisition, or sale of assets (with user notification)</li>
                <li><strong>With Your Consent:</strong> Any other sharing will only occur with your explicit consent</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights and Choices</h2>
            <div className="text-gray-300 space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Data Portability:</strong> Request your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Account Deletion:</strong> Delete your account and associated data through app settings</li>
              </ul>
              
              <p className="mt-4">
                To exercise these rights, contact us at <span className="text-blue-400">janara@survivebackpacking.com</span>
              </p>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies and Tracking Technologies</h2>
            <div className="text-gray-300 space-y-4">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Remember your login status and preferences</li>
                <li>Analyze app usage and performance</li>
                <li>Provide personalized content and features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p>You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.</p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                The Freedom Compass App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </div>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. International Users</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                If you are accessing our app from outside the United States, please note that your information may be transferred to, stored, and processed in the United States and other countries where our service providers operate. By using our app, you consent to such transfer.
              </p>
            </div>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Privacy Policy</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Posting the updated policy in the app</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying a prominent notice in the app</li>
              </ul>
              <p>
                Your continued use of the app after any changes indicates your acceptance of the updated Privacy Policy.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Us</h2>
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="text-gray-300 space-y-2">
                <p><strong>Email:</strong> <span className="text-blue-400">janara@survivebackpacking.com</span></p>
                <p><strong>Subject Line:</strong> Privacy Policy Inquiry - The Freedom Compass App</p>
                <p><strong>Response Time:</strong> We will respond to privacy-related inquiries within 48 hours</p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            This Privacy Policy is effective as of October 2025 and applies to The Freedom Compass App.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;