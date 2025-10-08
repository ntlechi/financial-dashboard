import React from 'react';
import { X, FileText, AlertTriangle, CreditCard, Shield } from 'lucide-react';

const TermsOfService = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-400" />
            Survive Backpacking: Universal Terms of Service
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
            <strong>Effective Date:</strong> October 7, 2025
          </div>
          
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">1. Mission Agreement (Agreement to Terms)</h3>
            <p>
              Welcome to the Survive Backpacking ecosystem. These Universal Terms of Service ("Terms") govern your access to and use of our entire operation, including the website (survivebackpacking.com), our flagship web application (The Freedom Compass App), and all related content and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you may not access the Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              2. Financial Disclaimer (The Operator's Responsibility)
            </h3>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 space-y-2">
              <p className="mb-3">
                The Freedom Compass App and all content provided by Survive Backpacking are for informational and educational purposes only.
              </p>
              <p><strong>Not Financial Advice:</strong> Our Service provides tools and intelligence, not professional financial, investment, or tax advice.</p>
              <p><strong>Your Responsibility:</strong> You are the sole commander of your financial decisions and are fully responsible for their outcomes.</p>
              <p><strong>Consult Professionals:</strong> Always consult qualified financial advisors and accountants before making significant financial decisions. We make no guarantees about financial outcomes.</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">3. User Accounts & Conduct</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Accurate Intel:</strong> You must provide accurate and complete information when creating your account.</li>
              <li><strong>Fortress Security:</strong> You are responsible for safeguarding your account credentials.</li>
              <li><strong>Lawful Use:</strong> You agree to use the Service only for lawful, personal (non-commercial) purposes and to not engage in any prohibited uses, such as attempting to hack the service, infringing on intellectual property, or uploading malicious code.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-400" />
              4. Subscriptions & Payment (The Freedom Compass App)
            </h3>
            <div className="space-y-3">
              <p><strong>Billing:</strong> Subscriptions are billed in advance on a recurring monthly or annual basis in USD.</p>
              <p><strong>The Founder's Circle:</strong> The limited-time launch offer grants access to The Operator Plan for $7.49 USD/month. This price is locked for life, as long as the subscription remains active.</p>
              <p><strong>Auto-Renewal:</strong> Your subscription will automatically renew unless you cancel it prior to the end of the current billing period.</p>
              <p><strong>Cancellation:</strong> You may cancel your subscription at any time. Your access will continue until the end of your paid term. No refunds are provided for partial subscription periods.</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">5. Intellectual Property (The Armory)</h3>
            <p>
              The Service and its original content, features, code, and functionality are and will remain the exclusive property of Survive Backpacking. You may not copy, modify, distribute, or reverse engineer our software without our explicit permission.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h3>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p>
                To the maximum extent permitted by law, Survive Backpacking shall not be liable for any indirect, incidental, special, or consequential damages, including financial losses or data loss, resulting from your use of the Service.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">7. Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms. You may delete your account at any time. Upon termination, your data will be handled according to our Privacy Policy.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">8. Governing Law</h3>
            <p>
              These Terms shall be governed by the laws of Quebec, Canada. Any disputes will be resolved in the courts of Quebec, Canada.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">9. Changes to Terms</h3>
            <p>
              We may update these Terms periodically. We will notify you of significant changes. Continued use of the Service after changes are posted constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              10. Contact HQ
            </h3>
            <p>Questions about these Terms? You have a direct line.</p>
            <div className="mt-2 p-3 bg-gray-700 rounded">
              <p><strong>Email:</strong> legal@survivebackpacking.com</p>
            </div>
          </section>

          <div className="border-t border-gray-700 pt-4 text-sm text-gray-400">
            <p>
              By using the Survive Backpacking ecosystem, you acknowledge that you have read, understood, and agree to be bound by these Universal Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
