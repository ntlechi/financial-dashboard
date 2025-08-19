import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Check, 
  Star, 
  Globe, 
  Smartphone, 
  TrendingUp, 
  Shield, 
  Users, 
  Clock,
  Gift,
  Plane,
  DollarSign,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import StripeCheckout from './StripeCheckout';

const LandingPage = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Countdown timer
    const launchEnd = new Date('2024-10-26T23:59:59');
    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchEnd - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft('Expired');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => setShowCheckout(false)}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to details
          </button>
          <StripeCheckout />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            {/* Birthday Badge */}
            <div className="inline-flex items-center bg-yellow-500 text-yellow-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              🎂 Founder's Birthday Launch Special
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Financial Freedom
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                For Free Spirits
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              The only financial dashboard built by nomads, for nomads. Track your money across 47 countries without the corporate BS.
            </p>

            {/* Countdown Timer */}
            <div className="bg-red-600 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <div className="text-sm font-semibold mb-2">⏰ BIRTHDAY SPECIAL ENDS IN:</div>
              <div className="text-3xl font-bold">{timeLeft}</div>
              <div className="text-sm text-red-200 mt-2">Only 1,000 lifetime memberships available</div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setShowCheckout(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-400 hover:to-orange-400 transform hover:scale-105 transition-all flex items-center gap-2"
              >
                Get Lifetime Access - $147
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="text-blue-200 text-sm">
                <span className="line-through">Regular: $397</span> • 
                <span className="text-yellow-400 font-semibold ml-1">Save $250!</span>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-8 text-blue-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                30-day guarantee
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                500+ nomads joined
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                4.9/5 rating
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto px-4 -mb-20">
          <div className="bg-white rounded-lg shadow-2xl p-4 transform rotate-1 hover:rotate-0 transition-transform">
            <div className="bg-gray-100 rounded h-80 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <div className="text-lg font-semibold">Dashboard Preview</div>
                <div className="text-sm">Multi-currency • Real-time • Beautiful</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Tired of Financial Apps That Don't Get Your Lifestyle?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-red-500 text-4xl mb-4">😤</div>
              <h3 className="font-semibold mb-2">Banking Nightmares</h3>
              <p className="text-gray-600">Foreign transaction fees eating your budget alive</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-red-500 text-4xl mb-4">🤯</div>
              <h3 className="font-semibold mb-2">Currency Chaos</h3>
              <p className="text-gray-600">Tracking expenses across 12 different currencies</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-red-500 text-4xl mb-4">📱</div>
              <h3 className="font-semibold mb-2">App Frustration</h3>
              <p className="text-gray-600">Financial apps built for 9-5 office workers, not nomads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution/Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Finally, A Financial Dashboard That Gets It
            </h2>
            <p className="text-xl text-gray-600">Built by a nomad who's lived in 32 countries</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <Globe className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Currency Magic</h3>
              <p className="text-gray-700">Track expenses in 150+ currencies with real-time conversion</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <Plane className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Travel Categories</h3>
              <p className="text-gray-700">Visas, flights, accommodation - categories that make sense</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <TrendingUp className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Investment Tracking</h3>
              <p className="text-gray-700">Monitor your portfolio from anywhere in the world</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
              <DollarSign className="w-10 h-10 text-yellow-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Business Income</h3>
              <p className="text-gray-700">Track multiple income streams and side hustles</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
              <Target className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Freedom Goals</h3>
              <p className="text-gray-700">Calculate your path to financial independence</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl">
              <Zap className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Sync</h3>
              <p className="text-gray-700">Access your data from any device, anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3">
              <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto flex items-center justify-center">
                <div className="text-6xl">👨‍💻</div>
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-6">Why I Built This</h2>
              <p className="text-lg text-gray-300 mb-4">
                After 5 years as a digital nomad and visiting 32 countries, I was frustrated by financial apps that didn't understand our lifestyle.
              </p>
              <p className="text-lg text-gray-300 mb-4">
                I needed something that could handle multiple currencies, track business income from different countries, and help me plan for true financial freedom.
              </p>
              <p className="text-lg text-gray-300 mb-6">
                So I built it. And now I'm sharing it with fellow free spirits on my birthday 🎂
              </p>
              <div className="flex items-center gap-4">
                <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                <span className="text-gray-400">"This is exactly what I needed!" - Sarah, Digital Nomad</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Birthday Special Pricing
          </h2>

          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto border-4 border-yellow-400">
            <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold mb-6">
              🎂 BIRTHDAY LAUNCH ONLY
            </div>
            
            <div className="text-gray-500 text-xl line-through mb-2">Regular: $397</div>
            <div className="text-5xl font-bold text-gray-900 mb-2">$147</div>
            <div className="text-green-600 font-semibold mb-6">Save $250 (63% off)</div>
            
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Lifetime access - never pay again</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>All features included</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>Free updates forever</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all"
            >
              Get Lifetime Access Now
            </button>

            <div className="text-xs text-gray-500 mt-4">
              ⚡ Limited to first 1,000 customers • Offer expires Oct 26th
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Why lifetime pricing?</h3>
              <p className="text-gray-700">I believe in building a tool that serves nomads long-term. No monthly fees, no surprises - just pay once and use it forever.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">What if I don't like it?</h3>
              <p className="text-gray-700">30-day money-back guarantee, no questions asked. I'm confident you'll love it, but if not, full refund.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Will this work on my phone?</h3>
              <p className="text-gray-700">Yes! Fully responsive design works perfectly on desktop, tablet, and mobile. Access your data anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Take Control of Your Nomad Finances?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join 500+ nomads who've already started their journey to financial freedom
          </p>
          
          <button
            onClick={() => setShowCheckout(true)}
            className="bg-yellow-500 text-yellow-900 px-8 py-4 rounded-lg font-bold text-xl hover:bg-yellow-400 transform hover:scale-105 transition-all"
          >
            Get Your Lifetime Access - $147
          </button>
          
          <div className="mt-6 text-blue-200">
            ⏰ Birthday special ends in {timeLeft} • Only 1,000 spots available
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">Financial Freedom Dashboard</div>
          <div className="text-gray-400 mb-6">Built with ❤️ by nomads, for nomads</div>
          
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="hover:text-blue-400">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400">Terms of Service</a>
            <a href="#" className="hover:text-blue-400">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;