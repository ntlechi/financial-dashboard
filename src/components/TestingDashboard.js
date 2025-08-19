import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  Link, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3,
  Users,
  DollarSign,
  Target,
  RefreshCw,
  Eye,
  MousePointer
} from 'lucide-react';

const TestingDashboard = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState('all');

  // Mock data for testing
  const mockInfluencers = [
    { 
      id: 'influencerA', 
      name: 'Travel Sarah', 
      code: 'sarahtravel', 
      platform: 'Instagram',
      audience: 150000,
      status: 'active'
    },
    { 
      id: 'influencerB', 
      name: 'Nomad Marcus', 
      code: 'marcusnomad', 
      platform: 'YouTube',
      audience: 250000,
      status: 'active'
    }
  ];

  const testScenarios = [
    {
      id: 'link_tracking',
      name: 'Link Tracking',
      description: 'Test if tracking parameters are properly captured',
      status: 'passed',
      lastRun: '2 mins ago',
      details: 'UTM parameters and referral codes working correctly'
    },
    {
      id: 'promo_codes',
      name: 'Promo Code Validation',
      description: 'Test promo code application and discounts',
      status: 'passed',
      lastRun: '5 mins ago',
      details: 'All influencer codes applying 35% discount correctly'
    },
    {
      id: 'conversion_tracking',
      name: 'Conversion Tracking',
      description: 'Test purchase attribution and commission calculation',
      status: 'passed',
      lastRun: '1 hour ago',
      details: 'Sales properly attributed to influencers, commissions calculated'
    },
    {
      id: 'analytics_sync',
      name: 'Analytics Sync',
      description: 'Test real-time data sync to influencer dashboards',
      status: 'warning',
      lastRun: '30 mins ago',
      details: 'Minor delay in real-time updates (< 5 minutes acceptable)'
    },
    {
      id: 'email_automation',
      name: 'Email Automation',
      description: 'Test automated email sequences trigger correctly',
      status: 'passed',
      lastRun: '15 mins ago',
      details: 'All email sequences triggering on schedule'
    }
  ];

  const runAllTests = async () => {
    setIsRunningTests(true);
    
    // Simulate running tests
    for (let i = 0; i < testScenarios.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update test status (in real app, this would be actual test results)
    }
    
    setIsRunningTests(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Testing Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and test your influencer tracking system
          </p>
        </div>
        
        <button
          onClick={runAllTests}
          disabled={isRunningTests}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRunningTests ? 'animate-spin' : ''}`} />
          {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {/* Test Results Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TestTube className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{testScenarios.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Passed</p>
              <p className="text-2xl font-bold text-gray-900">
                {testScenarios.filter(t => t.status === 'passed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {testScenarios.filter(t => t.status === 'warning').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">
                {testScenarios.filter(t => t.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Scenarios */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Test Scenarios
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {testScenarios.map((test) => (
            <div key={test.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
                    <p className="text-sm text-gray-500">{test.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Last run: {test.lastRun}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    test.status === 'passed' ? 'bg-green-100 text-green-800' :
                    test.status === 'failed' ? 'bg-red-100 text-red-800' :
                    test.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {test.status.toUpperCase()}
                  </span>
                  
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View Details →
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-3">
                {test.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Testing Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Link Tester */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Link className="w-5 h-5 mr-2 text-blue-600" />
            Link Tester
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test URL
              </label>
              <input
                type="url"
                placeholder="https://yourapp.com/?utm_source=test&ref=TEST"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Test Link Tracking
            </button>
            
            <div className="text-sm text-gray-600">
              This will simulate a click and show you what tracking data is captured.
            </div>
          </div>
        </div>

        {/* Conversion Simulator */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            Conversion Simulator
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Influencer Code
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select influencer</option>
                {mockInfluencers.map(inf => (
                  <option key={inf.id} value={inf.code}>{inf.name} ({inf.code})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Amount
              </label>
              <input
                type="number"
                value="147"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Simulate Conversion
            </button>
          </div>
        </div>
      </div>

      {/* Influencer Performance Preview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Live Influencer Performance
          </h2>
          
          <select 
            value={selectedInfluencer}
            onChange={(e) => setSelectedInfluencer(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Influencers</option>
            {mockInfluencers.map(inf => (
              <option key={inf.id} value={inf.id}>{inf.name}</option>
            ))}
          </select>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <MousePointer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">247</div>
              <div className="text-sm text-gray-600">Total Clicks</div>
            </div>
            
            <div className="text-center">
              <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">89</div>
              <div className="text-sm text-gray-600">Page Views</div>
            </div>
            
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Conversions</div>
            </div>
            
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">4.9%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            🧪 This is test data. Real metrics will appear during the live campaign.
          </div>
        </div>
      </div>

      {/* Testing Checklist */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Pre-Launch Testing Checklist
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Tracking links generate correctly</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Promo codes apply discounts</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Attribution data captures correctly</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Payment processing works</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Email sequences trigger</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Analytics dashboard updates</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Commission calculations accurate</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Mobile experience optimized</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4 mr-2" />
            System Ready for Launch
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingDashboard;