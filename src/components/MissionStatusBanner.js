import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getRankFromXp } from '../utils/xp';
import { Gamepad2, X, Award, Zap, Target, TrendingUp } from 'lucide-react';

const RANK_INSIGNIA = {
  'Recruit': { icon: '^', material: 'bronze', color: '#CD7F32' },
  'Climber': { icon: '⛏️', material: 'bronze', color: '#CD7F32' },
  'Operator': { icon: '🧭', material: 'silver', color: '#C0C0C0' },
  'Pathfinder': { icon: '🗺️', material: 'silver', color: '#C0C0C0' },
  'Vanguard': { icon: '🦅', material: 'gold', color: '#FFD700' },
  'Free Agent': { icon: '🕊️', material: 'gold', color: '#FFD700' }
};

export default function MissionStatusBanner({ userId, refreshTrigger }) {
  const [profile, setProfile] = useState(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!userId) return;
      try {
        // FIX: Use userProfiles collection with userId as document ID (2 segments)
        const snap = await getDoc(doc(db, 'userProfiles', userId));
        if (isMounted) setProfile(snap.exists() ? snap.data() : { xpPoints: 0, rank: 'Recruit', rankLevel: 1 });
      } catch (e) {
        if (isMounted) setProfile({ xpPoints: 0, rank: 'Recruit', rankLevel: 1 });
      }
    }
    load();
    return () => { isMounted = false; };
  }, [userId, refreshTrigger]); // FIX: Also refresh when refreshTrigger changes!

  if (!profile) return null;
  const { current, next, progress } = getRankFromXp(profile.xpPoints || 0);
  const currentInsignia = RANK_INSIGNIA[current.name] || RANK_INSIGNIA['Recruit'];
  const nextInsignia = next ? RANK_INSIGNIA[next.name] : null;

  return (
    <>
      <div className="mb-4 p-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-gray-800/70 to-gray-900/70 text-amber-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Current Rank with Insignia + How to Play Button */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-bold shadow-lg"
              style={{ 
                borderColor: currentInsignia.color,
                backgroundColor: `${currentInsignia.color}20`,
                boxShadow: `0 0 10px ${currentInsignia.color}40`
              }}
            >
              {currentInsignia.icon}
            </div>
            <div>
              <div className="text-sm sm:text-base flex items-center gap-2">
                <span className="font-semibold">Status:</span> {current.name} <span className="opacity-80">(Lvl {current.level})</span>
                <button
                  onClick={() => setShowGuide(true)}
                  className="text-amber-400 hover:text-amber-300 transition-colors p-1 hover:bg-amber-900/20 rounded"
                  title="How to Play"
                >
                  <Gamepad2 className="w-4 h-4" />
                </button>
              </div>
              {/* FIX: Show total XP earned (motivating!) */}
              <div className="text-xs font-bold text-amber-400">
                ⚡ {(profile.xpPoints || 0).toLocaleString()} XP Earned
              </div>
              {next && (
                <div className="text-xs opacity-90">
                  {next.xpRequired - (profile.xpPoints || 0)} XP to {next.name}
                </div>
              )}
            </div>
          </div>

        {/* Progress Bar with Next Rank Preview */}
        <div className="w-full sm:w-80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Progress to Next Rank</span>
            {next && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Next:</span>
                <div 
                  className="w-4 h-4 rounded-full border flex items-center justify-center text-xs"
                  style={{ 
                    borderColor: nextInsignia.color,
                    backgroundColor: `${nextInsignia.color}20`
                  }}
                >
                  {nextInsignia.icon}
                </div>
              </div>
            )}
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-2 bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {next && (
            <div className="text-xs text-gray-400 mt-1">
              {next.xpRequired - (profile.xpPoints || 0)} XP to {next.name}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* 🎮 How to Play Gamification Guide Modal */}
    {showGuide && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl w-full max-w-4xl border border-amber-500/30 shadow-2xl my-8">
          <div className="flex justify-between items-center p-6 border-b border-amber-500/30">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-amber-400" />
              🎮 How to Play The Freedom Compass
            </h2>
            <button
              onClick={() => setShowGuide(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Introduction */}
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg p-5 border border-amber-600/30">
              <h3 className="text-xl font-bold text-amber-300 mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Welcome to Your Financial Adventure!
              </h3>
              <p className="text-gray-300">
                The Freedom Compass gamifies your financial journey. Every action earns <strong>XP (Experience Points)</strong>, 
                helping you level up through <strong>6 ranks</strong> and unlock <strong>Freedom Milestones</strong>. 
                Think of it as your financial RPG - you're the hero, and financial freedom is the endgame! 🎯
              </p>
            </div>

            {/* How to Earn XP */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                ⚡ How to Earn XP
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-green-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-semibold">Quick Expense</span>
                    <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-sm font-bold">+5 XP</span>
                  </div>
                  <p className="text-xs text-gray-400">Log expenses with the Quick Expense button</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-400 font-semibold">Add Transaction</span>
                    <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-sm font-bold">+1 XP</span>
                  </div>
                  <p className="text-xs text-gray-400">Manually add income or expenses</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-400 font-semibold">Pay Off Debt</span>
                    <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-sm font-bold">+50 XP</span>
                  </div>
                  <p className="text-xs text-gray-400">Completely pay off any debt</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-orange-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-orange-400 font-semibold">Create Business</span>
                    <span className="bg-orange-600/20 text-orange-300 px-2 py-1 rounded text-sm font-bold">+50 XP</span>
                  </div>
                  <p className="text-xs text-gray-400">Start a new side hustle</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-yellow-400 font-semibold">Add Investment</span>
                    <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded text-sm font-bold">+50 XP</span>
                  </div>
                  <p className="text-xs text-gray-400">Add a new investment holding</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-pink-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-pink-400 font-semibold">Create Goal</span>
                    <span className="bg-pink-600/20 text-pink-300 px-2 py-1 rounded text-sm font-bold">+25 XP</span>
                  </div>
                  <p className="text-xs text-gray-400">Set a new financial goal</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-indigo-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-indigo-400 font-semibold">Create Budget</span>
                    <span className="bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded text-sm font-bold">+25 XP</span>
                  </div>
                  <p className="text-xs text-gray-400">Set up budget categories</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-teal-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-teal-400 font-semibold">Journal Entry</span>
                    <span className="bg-teal-600/20 text-teal-300 px-2 py-1 rounded text-sm font-bold">+10 XP</span>
                  </div>
                  <p className="text-xs text-gray-400">Write a Freedom Journal entry</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-violet-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-violet-400 font-semibold">Create Moment</span>
                    <span className="bg-violet-600/20 text-violet-300 px-2 py-1 rounded text-sm font-bold">+10 XP</span>
                  </div>
                  <p className="text-xs text-gray-400">Capture a financial milestone</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-cyan-400 font-semibold">Add Side Hustle Item</span>
                    <span className="bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded text-sm font-bold">+1-10 XP</span>
                  </div>
                  <p className="text-xs text-gray-400">Log income/expenses for your business</p>
                </div>
              </div>
            </div>

            {/* Rank System */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                🏆 Rank Progression System
              </h3>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-orange-900/30 to-amber-900/30 rounded-lg p-4 border border-orange-600/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#CD7F32', backgroundColor: '#CD7F3220' }}>
                      ^
                    </div>
                    <div>
                      <div className="font-bold text-orange-300">Rank 1: Recruit</div>
                      <div className="text-xs text-gray-400">0 - 999 XP • Starting your journey</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-900/30 to-amber-900/30 rounded-lg p-4 border border-orange-600/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#CD7F32', backgroundColor: '#CD7F3220' }}>
                      ⛏️
                    </div>
                    <div>
                      <div className="font-bold text-orange-300">Rank 2: Climber</div>
                      <div className="text-xs text-gray-400">1,000 - 4,999 XP • Building momentum</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg p-4 border border-gray-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#C0C0C0', backgroundColor: '#C0C0C020' }}>
                      🧭
                    </div>
                    <div>
                      <div className="font-bold text-gray-300">Rank 3: Operator</div>
                      <div className="text-xs text-gray-400">5,000 - 14,999 XP • Taking control</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg p-4 border border-gray-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#C0C0C0', backgroundColor: '#C0C0C020' }}>
                      🗺️
                    </div>
                    <div>
                      <div className="font-bold text-gray-300">Rank 4: Pathfinder</div>
                      <div className="text-xs text-gray-400">15,000 - 29,999 XP • Charting your course</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-lg p-4 border border-yellow-600/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#FFD700', backgroundColor: '#FFD70020' }}>
                      🦅
                    </div>
                    <div>
                      <div className="font-bold text-yellow-300">Rank 5: Vanguard</div>
                      <div className="text-xs text-gray-400">30,000 - 59,999 XP • Leading the way</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-lg p-4 border border-yellow-600/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#FFD700', backgroundColor: '#FFD70020' }}>
                      🕊️
                    </div>
                    <div>
                      <div className="font-bold text-yellow-300">Rank 6: Free Agent</div>
                      <div className="text-xs text-gray-400">60,000+ XP • Financial freedom achieved!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Freedom Milestones */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                🏔️ Freedom Milestones
              </h3>
              <div className="space-y-2">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-emerald-600/30 flex items-center gap-3">
                  <span className="text-2xl">🏕️</span>
                  <div>
                    <div className="font-bold text-emerald-300">Basecamp Secured - 10% Freedom Ratio</div>
                    <div className="text-xs text-gray-400">Your passive income covers 10% of expenses</div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3 border border-emerald-600/30 flex items-center gap-3">
                  <span className="text-2xl">🗺️</span>
                  <div>
                    <div className="font-bold text-emerald-300">First Trail Opened - 25% Freedom Ratio</div>
                    <div className="text-xs text-gray-400">Passive income covers 25% of expenses</div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3 border border-emerald-600/30 flex items-center gap-3">
                  <span className="text-2xl">🏔️</span>
                  <div>
                    <div className="font-bold text-emerald-300">Halfway to Summit - 50% Freedom Ratio</div>
                    <div className="text-xs text-gray-400">Halfway there! Passive income covers half your expenses</div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3 border border-emerald-600/30 flex items-center gap-3">
                  <span className="text-2xl">🔭</span>
                  <div>
                    <div className="font-bold text-emerald-300">Summit in Sight - 75% Freedom Ratio</div>
                    <div className="text-xs text-gray-400">Almost there! Passive income covers 75% of expenses</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 rounded-lg p-3 border border-yellow-600/50 flex items-center gap-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="font-bold text-yellow-300">Operator Elite - 100% Freedom Ratio</div>
                    <div className="text-xs text-gray-400">🎉 FINANCIAL FREEDOM! Your passive income exceeds expenses!</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg p-5 border border-blue-600/30">
              <h3 className="text-xl font-bold text-blue-300 mb-3">💡 Pro Tips for Fast Progression</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">1.</span>
                  <span><strong>Log everything!</strong> Use Quick Expense daily to track spending and earn XP.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span><strong>Set goals!</strong> Creating financial goals gives you +25 XP and keeps you motivated.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">3.</span>
                  <span><strong>Pay off debt!</strong> Each debt you eliminate gives you +50 XP and improves your net worth.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 font-bold">4.</span>
                  <span><strong>Build side hustles!</strong> Track your business income to increase passive income and earn XP.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 font-bold">5.</span>
                  <span><strong>Capture moments!</strong> Document your financial wins to stay motivated and earn +10 XP.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">6.</span>
                  <span><strong>Aim for 100% Freedom Ratio!</strong> Build passive income streams to unlock all milestones.</span>
                </li>
              </ul>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg p-5 border border-amber-600/50 text-center">
              <h3 className="text-xl font-bold text-amber-300 mb-2">🚀 Your Mission Starts Now!</h3>
              <p className="text-gray-300 mb-4">
                Every action you take brings you closer to financial freedom. Start earning XP today!
              </p>
              <button
                onClick={() => setShowGuide(false)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg"
              >
                Let's Go! 🎯
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}



