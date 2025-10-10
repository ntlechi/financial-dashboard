import React, { useState, useEffect } from 'react';
import { BookOpen, Download, Lock, Calendar, MapPin, Eye, EyeOff } from 'lucide-react';

export default function ReflectionsPage({ data, userPlan, onExportPDF }) {
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [allJournalEntries, setAllJournalEntries] = useState([]);

  // Collect all journal entries from all trips
  useEffect(() => {
    const entries = [];
    const trips = data?.travel?.trips || [];
    
    trips.forEach(trip => {
      if (trip.journalEntries && trip.journalEntries.length > 0) {
        trip.journalEntries.forEach(entry => {
          entries.push({
            ...entry,
            tripName: trip.name,
            tripId: trip.id,
            tripCountries: trip.countries || []
          });
        });
      }
    });

    // Sort by timestamp (newest first)
    entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setAllJournalEntries(entries);
  }, [data]);

  // Toggle entry expansion
  const toggleEntry = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get excerpt of text
  const getExcerpt = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Check if user has Operator access
  const hasOperatorAccess = userPlan === 'OPERATOR' || userPlan === 'FOUNDER\'S_CIRCLE';

  return (
    <div className="col-span-1 md:col-span-6 lg:col-span-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg p-6 border border-slate-500/40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-amber-400" />
              📓 Reflections Archive
            </h1>
            <p className="text-slate-300">
              Your collection of memories and lessons from the trail
            </p>
          </div>
          
          {/* Export PDF Button */}
          <div className="flex flex-col items-end">
            <button
              onClick={hasOperatorAccess ? onExportPDF : () => {}} // Will trigger upgrade modal if not Operator
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                hasOperatorAccess
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed relative'
              }`}
            >
              {hasOperatorAccess ? (
                <>
                  <Download className="w-5 h-5" />
                  Export as PDF
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Export as PDF
                </>
              )}
            </button>
            {!hasOperatorAccess && (
              <p className="text-xs text-gray-400 mt-2 text-right">
                Operator feature
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Journal Entries */}
      {allJournalEntries.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg p-8 border border-slate-500/40 text-center">
          <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No Reflections Yet</h3>
          <p className="text-slate-400 mb-4">
            Start documenting your adventures by adding journal entries to your trips.
          </p>
          <p className="text-sm text-slate-500">
            Go to the Travel page and add your first Freedom Journal entry!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {allJournalEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.entryID);
            const excerpt = getExcerpt(entry.text);
            
            return (
              <div
                key={entry.entryID}
                className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg border border-slate-500/40 overflow-hidden"
              >
                {/* Entry Header */}
                <div className="p-4 border-b border-slate-600/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {entry.tripName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(entry.timestamp)}
                        </div>
                        {entry.tripCountries.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {entry.tripCountries.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEntry(entry.entryID)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Entry Content */}
                <div className="p-4">
                  {entry.prompt && (
                    <div className="bg-amber-900/20 rounded-lg p-3 mb-3 border border-amber-600/30">
                      <p className="text-amber-200 text-sm font-medium italic">
                        "{entry.prompt}"
                      </p>
                    </div>
                  )}
                  
                  <p className="text-slate-300 leading-relaxed">
                    {isExpanded ? entry.text : excerpt}
                  </p>
                  
                  {!isExpanded && entry.text.length > 150 && (
                    <button
                      onClick={() => toggleEntry(entry.entryID)}
                      className="text-amber-400 hover:text-amber-300 text-sm mt-2 transition-colors"
                    >
                      Read more...
                    </button>
                  )}
                  
                  {/* Photo */}
                  {entry.photoURL && (
                    <div className="mt-4">
                      <img
                        src={entry.photoURL}
                        alt="Journal entry photo"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-600/30"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {allJournalEntries.length > 0 && (
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-lg p-4 border border-slate-500/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{allJournalEntries.length}</div>
              <div className="text-slate-400 text-sm">Total Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {new Set(allJournalEntries.map(e => e.tripId)).size}
              </div>
              <div className="text-slate-400 text-sm">Trips Documented</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {allJournalEntries.filter(e => e.photoURL).length}
              </div>
              <div className="text-slate-400 text-sm">Photos Captured</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
