import React, { useState } from 'react';
import { 
  User, 
  Link, 
  DollarSign, 
  BarChart3, 
  Copy, 
  CheckCircle, 
  Download,
  Mail,
  Calendar,
  Users,
  Target,
  Zap
} from 'lucide-react';

const InfluencerOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [influencerData, setInfluencerData] = useState({
    name: '',
    email: '',
    platform: '',
    audience: '',
    niche: '',
    code: ''
  });
  const [generatedLinks, setGeneratedLinks] = useState({});

  const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Audience Details', icon: Users },
    { id: 3, title: 'Tracking Setup', icon: Link },
    { id: 4, title: 'Materials', icon: Download },
    { id: 5, title: 'Testing', icon: CheckCircle }
  ];

  const generateInfluencerCode = (name, platform) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const platformCode = platform.toLowerCase().substring(0, 2);
    return `${cleanName}${platformCode}${Math.random().toString(36).substring(2, 5)}`;
  };

  const generateTrackingLinks = (code) => {
    const baseUrl = 'https://yourapp.com';
    return {
      primary: `${baseUrl}/?utm_source=${code}&utm_medium=social&utm_campaign=birthday_launch&ref=${code.toUpperCase()}`,
      email: `${baseUrl}/?utm_source=${code}&utm_medium=email&utm_campaign=birthday_launch&ref=${code.toUpperCase()}`,
      story: `${baseUrl}/?utm_source=${code}&utm_medium=story&utm_campaign=birthday_launch&ref=${code.toUpperCase()}`,
      bio: `${baseUrl}/?utm_source=${code}&utm_medium=bio&utm_campaign=birthday_launch&ref=${code.toUpperCase()}`
    };
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Generate influencer code and links
      const code = generateInfluencerCode(influencerData.name, influencerData.platform);
      setInfluencerData({...influencerData, code});
      setGeneratedLinks(generateTrackingLinks(code));
    }
    setCurrentStep(currentStep + 1);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Influencer Onboarding
        </h1>
        <p className="text-gray-600">
          Let's get you set up for the birthday launch campaign
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive 
                      ? 'border-blue-600 bg-blue-50' 
                      : isCompleted 
                      ? 'border-green-600 bg-green-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs mt-2 font-medium">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-8">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={influencerData.name}
                    onChange={(e) => setInfluencerData({...influencerData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Smith"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={influencerData.email}
                    onChange={(e) => setInfluencerData({...influencerData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Platform *
                </label>
                <select
                  value={influencerData.platform}
                  onChange={(e) => setInfluencerData({...influencerData, platform: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="email">Email Newsletter</option>
                  <option value="blog">Blog/Website</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Audience Details */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Audience Information</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audience Size *
                  </label>
                  <input
                    type="number"
                    value={influencerData.audience}
                    onChange={(e) => setInfluencerData({...influencerData, audience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niche/Topic *
                  </label>
                  <select
                    value={influencerData.niche}
                    onChange={(e) => setInfluencerData({...influencerData, niche: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select niche</option>
                    <option value="travel">Travel</option>
                    <option value="digital-nomad">Digital Nomad</option>
                    <option value="finance">Personal Finance</option>
                    <option value="entrepreneur">Entrepreneurship</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="productivity">Productivity</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Campaign Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Commission:</span>
                    <div className="text-blue-900">35% per sale</div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Price Point:</span>
                    <div className="text-blue-900">$147 lifetime</div>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Your Earnings:</span>
                    <div className="text-blue-900 font-bold">$51.45 per sale</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Tracking Setup */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Tracking Links</h2>
            
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">Your Influencer Code:</span>
                </div>
                <div className="text-2xl font-mono font-bold text-green-900">
                  {influencerData.code}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(generatedLinks).map(([type, link]) => (
                <div key={type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize">{type} Link</h3>
                    <button
                      onClick={() => copyToClipboard(link)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded p-2 font-mono text-sm break-all">
                    {link}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Use for: {type === 'primary' ? 'Main promotions' : 
                             type === 'email' ? 'Email newsletters' :
                             type === 'story' ? 'Instagram/TikTok stories' :
                             'Bio links & profiles'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use different links for different platforms to track performance</li>
                <li>• Links automatically track clicks and conversions</li>
                <li>• Commission is paid within 48 hours of each sale</li>
                <li>• Campaign runs October 19-26, 2024</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 4: Materials */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Promotional Materials</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visual Assets */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Download className="w-6 h-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold">Visual Assets</h3>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="font-medium">Instagram Stories (9:16)</div>
                    <div className="text-sm text-gray-600">5 story templates with countdown timer</div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="font-medium">Instagram Posts (1:1)</div>
                    <div className="text-sm text-gray-600">3 post designs with product mockups</div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="font-medium">YouTube Thumbnails</div>
                    <div className="text-sm text-gray-600">2 thumbnail options for video content</div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="font-medium">Email Graphics</div>
                    <div className="text-sm text-gray-600">Header images for newsletter promotion</div>
                  </button>
                </div>
              </div>

              {/* Copy Templates */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Mail className="w-6 h-6 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold">Copy Templates</h3>
                </div>
                
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="font-medium">Email Templates</div>
                    <div className="text-sm text-gray-600">3 email templates for your newsletter</div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="font-medium">Social Media Captions</div>
                    <div className="text-sm text-gray-600">Instagram, Twitter, LinkedIn captions</div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="font-medium">YouTube Script</div>
                    <div className="text-sm text-gray-600">5-minute video script template</div>
                  </button>
                  
                  <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="font-medium">Story Copy</div>
                    <div className="text-sm text-gray-600">Short-form content for stories/reels</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Access */}
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-purple-900">Demo Access</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">Demo URL</label>
                  <div className="bg-white rounded p-2 font-mono text-sm">
                    https://demo.yourapp.com
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-1">Password</label>
                  <div className="bg-white rounded p-2 font-mono text-sm">
                    demo2024
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-purple-700 mt-3">
                Use this demo to explore the product and create authentic content about the features.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Testing */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Test Your Setup</h2>
            
            <div className="space-y-6">
              {/* Link Testing */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🔗 Link Testing</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Primary tracking link</span>
                    <button 
                      onClick={() => window.open(generatedLinks.primary, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Test Link →
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Email tracking link</span>
                    <button 
                      onClick={() => window.open(generatedLinks.email, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Test Link →
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  Click the links above to test tracking. You should see your referral info on the landing page.
                </div>
              </div>

              {/* Analytics Access */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Analytics Dashboard</h3>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Your Performance Dashboard</span>
                  </div>
                  
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Access Analytics →
                  </button>
                  
                  <p className="text-sm text-blue-700 mt-3">
                    Track clicks, conversions, and earnings in real-time during the campaign.
                  </p>
                </div>
              </div>

              {/* Support Contact */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🤝 Support & Contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Mail className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-900">Direct Email</span>
                    </div>
                    <div className="text-sm text-green-700">support@yourapp.com</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-medium text-purple-900">1-on-1 Call</span>
                    </div>
                    <button className="text-sm text-purple-700 underline">
                      Schedule call →
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaign Timeline */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📅 Campaign Timeline</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="font-medium">Oct 19, 12pm EST:</span>
                    <span className="ml-2 text-gray-600">Launch begins</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="font-medium">Oct 19-26:</span>
                    <span className="ml-2 text-gray-600">Active promotion period</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="font-medium">Oct 26, 11:59pm EST:</span>
                    <span className="ml-2 text-gray-600">Campaign ends</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="font-medium">Oct 28:</span>
                    <span className="ml-2 text-gray-600">Commission payments sent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          <div className="flex space-x-3">
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!influencerData.name || !influencerData.email || !influencerData.platform)) ||
                  (currentStep === 2 && (!influencerData.audience || !influencerData.niche))
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            ) : (
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Complete Setup ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerOnboarding;