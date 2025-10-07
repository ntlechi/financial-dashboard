import React from 'react';
import { X, FileText, AlertTriangle, CreditCard, Shield } from 'lucide-react';

const TermsOfService = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-400" />
            Terms of Service
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
            <h3 className="text-xl font-semibold text-white mb-3">Agreement to Terms</h3>
            <p>
              By accessing and using The Freedom Compass App ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Description of Service</h3>
            <p>
              The Freedom Compass App is a personal financial management tool that helps users track income, expenses, 
              investments, debts, and financial goals. We provide calculators, analytics, and planning tools to support 
              your journey to financial freedom.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
              Financial Disclaimer
            </h3>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 space-y-2">
              <p><strong>Not Financial Advice:</strong> The Freedom Compass App provides tools and calculations for informational purposes only. This is not professional financial, investment, or tax advice.</p>
              <p><strong>Consult Professionals:</strong> Always consult qualified financial advisors, accountants, or other professionals before making financial decisions.</p>
              <p><strong>Your Responsibility:</strong> You are solely responsible for your financial decisions and their outcomes.</p>
              <p><strong>No Guarantees:</strong> We make no guarantees about investment returns, financial outcomes, or the accuracy of projections.</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">User Responsibilities</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Accurate Information:</strong> Provide accurate financial data for reliable calculations</li>
              <li><strong>Account Security:</strong> Protect your account credentials and notify us of unauthorized access</li>
              <li><strong>Lawful Use:</strong> Use the Service only for lawful purposes</li>
              <li><strong>Personal Use:</strong> Use the Service for personal financial management only</li>
              <li><strong>Compliance:</strong> Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Prohibited Uses</h3>
            <p>You may not use The Freedom Compass App to:</p>
            <ul className="space-y-2 list-disc list-inside mt-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or attempt to hack the Service</li>
              <li>Share your account with others</li>
              <li>Use the Service for commercial purposes without permission</li>
              <li>Attempt to reverse engineer or copy our software</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-400" />
              Subscription & Payment Terms
            </h3>
            <div className="space-y-3">
              <p><strong>Founder's Circle:</strong> Limited-time offer for first 100 members at $7.49 USD /month</p>
              <p><strong>Billing:</strong> Subscriptions are billed monthly in advance</p>
              <p><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled</p>
              <p><strong>Cancellation:</strong> Cancel anytime - access continues until end of billing period</p>
              <p><strong>Refunds:</strong> No refunds for partial months, but you keep access until period ends</p>
              <p><strong>Price Changes:</strong> We'll notify you 30 days before any price changes</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Data Accuracy</h3>
            <p>
              While we strive for accuracy in our calculations and tools, we cannot guarantee that all information 
              is error-free. You should verify important calculations independently and consult professionals for 
              significant financial decisions.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Intellectual Property</h3>
            <p>
              The Freedom Compass App, including its design, features, algorithms, and content, is owned by us and 
              protected by copyright and other intellectual property laws. You may not copy, modify, or distribute 
              our software without permission.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Service Availability</h3>
            <p>
              We strive to provide reliable service but cannot guarantee 100% uptime. We may temporarily suspend 
              the Service for maintenance, updates, or other operational reasons. We are not liable for any losses 
              due to service interruptions.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h3>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p>
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong> We are not liable for any indirect, 
                incidental, special, or consequential damages arising from your use of the Service, including 
                but not limited to financial losses, lost profits, or data loss.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Account Termination</h3>
            <p>
              We may suspend or terminate your account if you violate these Terms. You may delete your account 
              at any time. Upon termination, your access to the Service will cease, and we will delete your 
              data according to our Privacy Policy.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Changes to Terms</h3>
            <p>
              We may update these Terms periodically. We will notify users of significant changes via email or 
              app notification. Continued use after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Governing Law</h3>
            <p>
              These Terms are governed by the laws of Canada. Any disputes will be resolved in the courts of 
              Quebec, Canada.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-400" />
              Contact Information
            </h3>
            <p>Questions about these Terms? Contact us at:</p>
            <div className="mt-2 p-3 bg-gray-700 rounded">
              <p><strong>Email:</strong> legal@survivebackpacking.com</p>
              <p><strong>Website:</strong> app.survivebackpacking.com</p>
            </div>
          </section>

          <div className="border-t border-gray-700 pt-4 text-sm text-gray-400">
            <p>
              By using The Freedom Compass App, you acknowledge that you have read, understood, and agree to be 
              bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;