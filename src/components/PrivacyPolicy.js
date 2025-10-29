import React from 'react';
import { X, Shield, Lock, Eye, Database, Cookie, UserCheck } from 'lucide-react';

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
            <strong>Effective Date:</strong> October 7, 2025
          </div>

          <section className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-white mb-3">Our Core Mission</h3>
            <p>
              Our entire expedition at Survive Backpacking is built on a foundation of trust. We guide the climb from any setback, and that mission is impossible without your absolute confidence in how we handle your personal information. This document is not just a legal requirement; it is our handshake promise to you. It is the operational plan for how we protect your most valuable asset: your data.
            </p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-400" />
              1. The Intel We Gather (Information We Collect)
            </h3>
            <p className="mb-4">
              To run this operation effectively, we gather only what is essential. We collect it by fair and lawful means, with your knowledge and consent.
            </p>
            <div className="space-y-3">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="font-semibold text-white mb-1">Financial Data (Your Input):</p>
                <p>We collect the financial information you voluntarily enter into Kompul (income, expenses, assets, etc.). This is your data. You are the sole operator of it.</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="font-semibold text-white mb-1">Account Information:</p>
                <p>When you create an account to join the tribe, we collect your email address and secure authentication information.</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <p className="font-semibold text-white mb-1">Operational & Analytics Data:</p>
                <p>We automatically collect anonymous information about how you use our app and website (which features are most valuable, site traffic) and basic device information. This is our "after-action report" that helps us improve the basecamp for everyone. We use tools like Google Analytics for this purpose, and these are only used with your consent.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Database className="w-5 h-5 mr-2 text-purple-400" />
              2. How We Use Your Intel (Our Mission Objectives)
            </h3>
            <p className="mb-3">
              Your data has one purpose: to help you achieve your mission of financial freedom. We do not share personally identifying information publicly or with third parties, except when required by law.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>To provide and maintain the core services of Kompul.</li>
              <li>To calculate the financial metrics and intelligence you see on your dashboard.</li>
              <li>To securely sync your data across your devices.</li>
              <li>To send you mission-critical account and service notifications.</li>
              <li>To provide support when you request it.</li>
              <li>To ensure the security of our basecamp and prevent fraudulent activity.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-amber-400" />
              3. Fortifying the Armory (Data Security & Storage)
            </h3>
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-4">
              <p className="font-semibold text-amber-200 mb-2">Your trust is our fortress. We protect it with commercially acceptable, military-grade security.</p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-white">Encryption:</p>
                <p>All data is encrypted in transit using HTTPS and at rest using industry-standard protocols.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Firebase Security:</p>
                <p>Your data is stored securely on Google's Firebase platform with strict, role-based access controls. Our system is architected so that only you can access your specific financial information.</p>
              </div>
              <div>
                <p className="font-semibold text-white">The "No-Sell" Doctrine:</p>
                <p>We will never sell, rent, or share your personal financial data with third parties for their marketing purposes. Period.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Data Isolation:</p>
                <p>Each operator's data is completely isolated in our database. It is impossible for one user to access another user's financial information.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Data Retention:</p>
                <p>We retain your financial data for as long as your account is active. If you delete your account, we will permanently and irretrievably delete your data within 30 days, except where required by law.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-green-400" />
              4. Your Command & Control (Your Rights Under Quebec Law 25)
            </h3>
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
              <p className="font-semibold text-green-200 mb-2">You are the Commander of your data. As a resident of Quebec, you have specific rights, and we are committed to upholding them.</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <p className="font-semibold text-white mb-2">Designated Privacy Officer:</p>
              <p className="mb-2">For all matters concerning your data privacy, you have a direct line to HQ. Your designated Privacy Officer is:</p>
              <div className="bg-gray-800 rounded p-3 mt-2">
                <p><strong>Name:</strong> Janara Nguon</p>
                <p><strong>Email:</strong> privacy@survivebackpacking.com</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-white mb-2">Your Specific Rights:</p>
              <ul className="space-y-2 list-disc list-inside ml-4">
                <li><strong>Right to Access:</strong> You have the right to request access to the personal information we hold about you.</li>
                <li><strong>Right to Rectification:</strong> If any intel we have is inaccurate, you have the right to request a correction.</li>
                <li><strong>Right to Withdraw Consent:</strong> You have the right to withdraw your consent for data processing at any time.</li>
              </ul>
              <p className="mt-3 text-sm text-gray-400">To exercise any of these rights, please contact your Privacy Officer.</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Cookie className="w-5 h-5 mr-2 text-orange-400" />
              5. Our Cookie Protocol (How We Use Cookies)
            </h3>
            <p className="mb-3">Our basecamp uses cookies to function and improve your experience.</p>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-white">What Are Cookies?</p>
                <p>Small text files stored on your device that help our site work and remember your preferences.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Essential Cookies:</p>
                <p>These are necessary for core functionality like security and keeping you logged in. They are always active.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Analytics & Performance Cookies:</p>
                <p>These help us understand how our tribe uses the website, allowing us to improve our operations. These are only used if you give us your consent via our cookie banner.</p>
              </div>
              <div>
                <p className="font-semibold text-white">Your Control:</p>
                <p>You can refuse our request for non-essential cookies. You can also configure your browser to refuse them, though some parts of the site may not function as intended.</p>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-700 pt-4 mt-6 bg-gray-700/30 rounded-lg p-4">
            <p className="text-white font-semibold mb-2">
              Your continued use of our website and app will be regarded as acceptance of our practices.
            </p>
            <p className="text-gray-300">
              This Privacy Policy is our commitment. Your trust is our mission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
