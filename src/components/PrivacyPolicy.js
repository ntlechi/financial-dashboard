import React from 'react';
import { X, Shield, Eye, Database, Lock } from 'lucide-react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Shield className="w-6 h-6 mr-3 text-green-400" />
            Privacy Policy
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 text-gray-300 space-y-6">
          <div className="text-sm text-gray-400">
            <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
          </div>
          
          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-400" />
              Information We Collect
            </h3>
            <div className="space-y-3">
              <p>
                <strong>Financial Data:</strong> We collect the financial information you voluntarily enter into The Freedom Compass App, including income, expenses, assets, debts, investment holdings, and financial goals.
              </p>
              <p>
                <strong>Account Information:</strong> When you create an account, we collect your email address and authentication information.
              </p>
              <p>
                <strong>Usage Data:</strong> We automatically collect information about how you use our app, including features accessed and time spent.
              </p>
              <p>
                <strong>Device Information:</strong> We collect basic device and browser information for security and optimization purposes.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Database className="w-5 h-5 mr-2 text-purple-400" />
              How We Use Your Information
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>Provide and maintain The Freedom Compass App services</li>
              <li>Calculate financial metrics, projections, and recommendations</li>
              <li>Sync your data across devices securely</li>
              <li>Send important account and service notifications</li>
              <li>Improve our app features and user experience</li>
              <li>Provide customer support when requested</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-red-400" />
              Data Security & Storage
            </h3>
            <div className="space-y-3">
              <p>
                <strong>Encryption:</strong> All data is encrypted in transit using HTTPS and at rest using industry-standard encryption.
              </p>
              <p>
                <strong>Firebase Security:</strong> Your data is stored securely on Google Firebase with strict access controls ensuring only you can access your financial information.
              </p>
              <p>
                <strong>No Data Sharing:</strong> We never sell, rent, or share your personal financial data with third parties for marketing purposes.
              </p>
              <p>
                <strong>Data Isolation:</strong> Each user's data is completely isolated - no user can access another user's financial information.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Information Sharing</h3>
            <p>We only share your information in these limited circumstances:</p>
            <ul className="space-y-2 list-disc list-inside mt-2">
              <li><strong>Service Providers:</strong> Trusted partners who help us operate the app (Firebase, Stripe for payments)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfer:</strong> In the event of a merger or acquisition (with notice to users)</li>
              <li><strong>Your Consent:</strong> When you explicitly authorize sharing</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Your Rights</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Access:</strong> View all data we have about you</li>
              <li><strong>Correction:</strong> Update or correct your information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your financial data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Data Retention</h3>
            <p>
              We retain your financial data for as long as your account is active. If you delete your account, 
              we will permanently delete your data within 30 days, except where required by law to retain certain information.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Cookies & Tracking</h3>
            <p>
              We use essential cookies for authentication and app functionality. We do not use tracking cookies 
              for advertising purposes. You can disable cookies in your browser, but this may affect app functionality.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Children's Privacy</h3>
            <p>
              The Freedom Compass App is not intended for users under 18. We do not knowingly collect 
              personal information from children under 18.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Changes to Privacy Policy</h3>
            <p>
              We may update this Privacy Policy periodically. We will notify users of significant changes 
              via email or app notification. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Contact Us</h3>
            <p>
              Questions about this Privacy Policy? Contact us at:
            </p>
            <div className="mt-2 p-3 bg-gray-700 rounded">
              <p><strong>Email:</strong> privacy@survivebackpacking.com</p>
              <p><strong>Website:</strong> app.survivebackpacking.com</p>
            </div>
          </section>

          <div className="border-t border-gray-700 pt-4 text-sm text-gray-400">
            <p>
              This Privacy Policy is part of our commitment to protecting your financial privacy. 
              Your trust is essential to our mission of helping you achieve financial freedom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;