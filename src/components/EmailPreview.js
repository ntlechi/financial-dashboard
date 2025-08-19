import React, { useState } from 'react';
import { EMAIL_SEQUENCES, replaceTokens } from '../utils/emailTemplates';
import { Mail, Calendar, Users, Send, Eye } from 'lucide-react';

const EmailPreview = () => {
  const [selectedSequence, setSelectedSequence] = useState('prelaunch');
  const [selectedEmail, setSelectedEmail] = useState(0);
  const [previewData, setPreviewData] = useState({
    firstName: 'Sarah',
    email: 'sarah@example.com',
    checkoutLink: 'https://yourapp.com/checkout',
    loginLink: 'https://yourapp.com/dashboard'
  });

  const sequences = {
    prelaunch: 'Pre-Launch Sequence',
    launch: 'Launch Day Sequence', 
    followup: 'Follow-up Sequence',
    welcome: 'Welcome Sequence'
  };

  const currentSequence = EMAIL_SEQUENCES[selectedSequence];
  const currentEmail = currentSequence[selectedEmail];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Email Campaign Preview
        </h1>
        <p className="text-gray-600">
          Preview and test your launch email sequences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sequence Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Email Sequences</h3>
            
            <div className="space-y-2">
              {Object.entries(sequences).map(([key, name]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedSequence(key);
                    setSelectedEmail(0);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedSequence === key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-gray-500">
                    {EMAIL_SEQUENCES[key].length} emails
                  </div>
                </button>
              ))}
            </div>

            {/* Affiliate Templates */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Affiliate Templates</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedSequence('affiliate')}
                  className="w-full text-left p-2 rounded hover:bg-gray-50"
                >
                  <div className="text-sm font-medium">Influencer Invitation</div>
                </button>
                <button 
                  onClick={() => setSelectedSequence('affiliate')}
                  className="w-full text-left p-2 rounded hover:bg-gray-50"
                >
                  <div className="text-sm font-medium">Promo Materials</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {sequences[selectedSequence]} 
            </h3>
            
            {selectedSequence !== 'affiliate' ? (
              <div className="space-y-2">
                {currentSequence.map((email, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedEmail(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedEmail === index
                        ? 'bg-blue-50 border-blue-200'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        Day {email.day}
                      </span>
                    </div>
                    <div className="font-medium text-sm mb-1">
                      {email.subject}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="font-medium text-sm">Influencer Invitation</div>
                  <div className="text-xs text-gray-500">Partnership outreach</div>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="font-medium text-sm">Promotional Materials</div>
                  <div className="text-xs text-gray-500">Assets & tracking setup</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {/* Email Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Email Preview</h3>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedSequence !== 'affiliate' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">To:</span> {previewData.email}
                    </div>
                    <div>
                      <span className="text-gray-500">Day:</span> {currentEmail?.day}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-500">Subject:</span> 
                    <span className="ml-2 font-medium">{currentEmail?.subject}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Email Body */}
            <div className="p-6">
              {selectedSequence !== 'affiliate' ? (
                <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap">
                  {currentEmail && replaceTokens(currentEmail.template, previewData)}
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Influencer Invitation Email</h4>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                      {EMAIL_SEQUENCES.affiliate.invitation}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Promotional Materials Email</h4>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                      {EMAIL_SEQUENCES.affiliate.materials}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Controls */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Preview Settings</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={previewData.firstName}
                  onChange={(e) => setPreviewData({...previewData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={previewData.email}
                  onChange={(e) => setPreviewData({...previewData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">Total Email Templates</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">7</div>
          <div className="text-sm text-gray-600">Day Launch Sequence</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">2</div>
          <div className="text-sm text-gray-600">Influencer Templates</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Send className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">4</div>
          <div className="text-sm text-gray-600">Automated Sequences</div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;