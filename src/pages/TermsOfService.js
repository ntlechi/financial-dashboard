import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

const TermsOfService = ({ onBack }) => {
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
            <FileText className="w-8 h-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-bold">Terms of Service</h1>
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
            These Terms of Service govern your use of The Freedom Compass App.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          
          {/* Agreement */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                By accessing or using The Freedom Compass App ("the App," "our App," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, then you may not access the App.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the App.
              </p>
            </div>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                The Freedom Compass App is a personal financial management application that helps users track their finances, create budgets, manage investments, and work toward financial goals through manual data entry and analysis tools.
              </p>
              
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-300 font-semibold mb-2">Important Disclaimer:</p>
                <p className="text-gray-300">
                  The Freedom Compass App is a financial tracking tool, NOT a financial advisory service. We do not provide investment advice, tax advice, or professional financial planning services. All financial decisions are your responsibility.
                </p>
              </div>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">3.1 Account Creation</h3>
            <div className="text-gray-300 space-y-2 mb-4">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One person may not maintain multiple accounts</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">3.2 Account Responsibility</h3>
            <div className="text-gray-300 space-y-2">
              <p>You are responsible for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All activities that occur under your account</li>
                <li>Maintaining the confidentiality of your login credentials</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>The accuracy of all financial data you enter into the App</li>
              </ul>
            </div>
          </section>

          {/* Subscription Plans */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Subscription Plans and Billing</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">4.1 Plan Tiers</h3>
            <div className="text-gray-300 space-y-2 mb-4">
              <p>We offer the following subscription tiers:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>The Recon Kit (Free):</strong> Basic features with limited access</li>
                <li><strong>The Climber Plan ($7.99/month):</strong> Enhanced features and full dashboard access</li>
                <li><strong>The Operator Plan ($14.99/month):</strong> Complete feature access</li>
                <li><strong>The Founder's Circle ($7.49/month):</strong> Limited-time offer with lifetime price lock</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">4.2 Billing Terms</h3>
            <div className="text-gray-300 space-y-2 mb-4">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Subscriptions are billed monthly in advance</li>
                <li>All payments are processed securely through Stripe</li>
                <li>Prices are in USD and subject to applicable taxes</li>
                <li>You authorize us to charge your payment method for recurring subscriptions</li>
                <li>Failed payments may result in service suspension</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">4.3 Cancellation and Refunds</h3>
            <div className="text-gray-300 space-y-2">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Cancellation takes effect at the end of your current billing period</li>
                <li>We offer a 30-day money-back guarantee for all paid plans</li>
                <li>Refunds are processed to your original payment method within 5-10 business days</li>
                <li>The Founder's Circle lifetime price lock is forfeited upon cancellation</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3">5.1 Permitted Use</h3>
            <div className="text-gray-300 space-y-2 mb-4">
              <p>You may use the App for:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Personal financial tracking and budgeting</li>
                <li>Managing your investment portfolio data</li>
                <li>Setting and tracking financial goals</li>
                <li>Analyzing your financial patterns and trends</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">5.2 Prohibited Use</h3>
            <div className="text-gray-300 space-y-2">
              <p>You may NOT use the App to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Share your account with others or create multiple accounts</li>
                <li>Attempt to reverse engineer, hack, or compromise the App</li>
                <li>Upload malicious code or attempt to disrupt the service</li>
                <li>Use the App for commercial purposes without our written consent</li>
                <li>Input false or misleading information intentionally</li>
                <li>Harass, abuse, or harm other users</li>
              </ul>
            </div>
          </section>

          {/* Data and Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data and Privacy</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Your privacy is important to us. Our collection and use of your information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 font-semibold mb-2">Data Ownership:</p>
                <p className="text-gray-300">
                  You retain ownership of all financial data you input into the App. We do not claim ownership of your personal financial information.
                </p>
              </div>

              <p>
                You are responsible for the accuracy of all data you enter. We are not liable for decisions made based on inaccurate data entry.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                The App and its original content, features, and functionality are owned by The Freedom Compass App and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or lease any part of our App or included software, nor may you reverse engineer or attempt to extract the source code of that software.
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Disclaimers and Limitations</h2>
            
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-300 font-semibold mb-2">Important Financial Disclaimer:</p>
              <p className="text-gray-300 text-sm">
                The Freedom Compass App is for informational and educational purposes only. It is not intended as financial, investment, tax, or legal advice. Always consult with qualified professionals before making financial decisions.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">8.1 Service Availability</h3>
            <div className="text-gray-300 space-y-2 mb-4">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>The App is provided "as is" without warranties of any kind</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>We may modify, suspend, or discontinue the App at any time</li>
                <li>We are not responsible for data loss due to technical issues</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">8.2 Limitation of Liability</h3>
            <div className="text-gray-300 space-y-2">
              <p>
                To the maximum extent permitted by law, The Freedom Compass App shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Financial losses resulting from use of the App</li>
                <li>Data loss or corruption</li>
                <li>Business interruption or lost profits</li>
                <li>Decisions made based on App calculations or recommendations</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                We may terminate or suspend your account and access to the App immediately, without prior notice, for any reason, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of subscription fees</li>
                <li>Abuse of the service or other users</li>
              </ul>
              
              <p>
                Upon termination, your right to use the App will cease immediately. You may request a copy of your data within 30 days of termination.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of the App shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to Terms</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of material changes by:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Posting updated Terms in the App</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying prominent notices in the App</li>
              </ul>
              <p>
                Your continued use of the App after any changes constitutes acceptance of the new Terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="text-gray-300 space-y-2">
                <p><strong>Email:</strong> <span className="text-green-400">janara@survivebackpacking.com</span></p>
                <p><strong>Subject Line:</strong> Terms of Service Inquiry - The Freedom Compass App</p>
                <p><strong>Response Time:</strong> We will respond to legal inquiries within 48 hours</p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            These Terms of Service are effective as of October 2025 and apply to The Freedom Compass App.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            By using our App, you acknowledge that you have read, understood, and agree to be bound by these Terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;