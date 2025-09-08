import React, { useState } from 'react';
import {
  ExclamationTriangleIcon,
  UserIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const DisruptionSimulator = ({ onDisruption }) => {
  const [crewId, setCrewId] = useState('');
  const [flightId, setFlightId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const sampleDisruptions = [
    { crew: 'PIL0012', flight: '6E1431', description: 'Captain sickness on main flight' },
    { crew: 'CAB0076', flight: '6E2280', description: 'Senior crew emergency leave' },
    { crew: 'PIL0009', flight: 'I54264', description: 'First Officer family emergency' }
  ];

  const handleSimulateDisruption = async () => {
    if (!crewId || !flightId) {
      setError('Please enter both Crew ID and Flight ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`http://localhost:8000/api/disrupt/${crewId}/${flightId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        console.log("the result is ",data)
        setResult(data);
        onDisruption();
      } else {
        setError('Failed to simulate disruption');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const StatusCard = ({ icon: Icon, title, value, color = 'gray' }) => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
      <div className="flex items-center">
        <Icon className={`h-5 w-5 text-${color}-600 mr-2`} />
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      <p className={`text-lg font-bold text-${color}-700 mt-1`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disruption Simulator</h1>
        <p className="text-gray-600 mt-1">Test AI recovery from crew unavailability scenarios</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-2" />
            Simulate Crew Unavailability
          </h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="crewId" className="block text-sm font-medium text-gray-700 mb-2">
                Crew ID
              </label>
              <input
                type="text"
                id="crewId"
                value={crewId}
                onChange={(e) => setCrewId(e.target.value.toUpperCase())}
                placeholder="e.g., PIL0012"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="flightId" className="block text-sm font-medium text-gray-700 mb-2">
                Flight ID
              </label>
              <input
                type="text"
                id="flightId"
                value={flightId}
                onChange={(e) => setFlightId(e.target.value.toUpperCase())}
                placeholder="e.g., 6E1431"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>

            <button
              onClick={handleSimulateDisruption}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                  Handling Disruption...
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Simulate Disruption
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Examples */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Examples</h4>
            <div className="space-y-2">
              {sampleDisruptions.map((disruption, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setCrewId(disruption.crew);
                    setFlightId(disruption.flight);
                  }}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {disruption.crew} on {disruption.flight}
                    </p>
                    <p className="text-xs text-gray-500">{disruption.description}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Try
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <CheckBadgeIcon className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Disruption Handled Successfully</h3>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <CheckBadgeIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-700">
                    Successfully removed {result.removed_crew} from flight {result.affected_flight}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <StatusCard
                  icon={ArrowPathIcon}
                  title="Recovery Score"
                  value={result.recovery_score.toFixed(1)}
                  color="blue"
                />
                <StatusCard
                  icon={PaperAirplaneIcon}
                  title="New Coverage"
                  value={`${result.new_metrics.covered_flights}/${result.new_metrics.total_flights}`}
                  color="green"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Metrics</h4>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-xs font-medium text-gray-600">Violations:</span>
                  <span className={`text-xs font-bold ${result.new_metrics.violations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {result.new_metrics.violations}
                  </span>
                  
                  <span className="text-xs font-medium text-gray-600">Crew Utilized:</span>
                  <span className="text-xs font-bold text-blue-600">{result.new_metrics.crew_utilized}</span>
                  
                  <span className="text-xs font-medium text-gray-600">Max Hours:</span>
                  <span className={`text-xs font-bold ${result.new_metrics.max_duty_hours > 14 ? 'text-red-600' : 'text-green-600'}`}>
                    {result.new_metrics.max_duty_hours.toFixed(1)}h
                  </span>
                  
                  <span className="text-xs font-medium text-gray-600">Duplicates:</span>
                  <span className="text-xs font-bold text-gray-600">{result.new_metrics.duplicate_assignments}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                How It Works
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600">1</span>
                  </div>
                  <p className="text-sm text-gray-600">Enter a Crew ID and Flight ID to simulate removal</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600">2</span>
                  </div>
                  <p className="text-sm text-gray-600">AI system will automatically reassign and optimize</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600">3</span>
                  </div>
                  <p className="text-sm text-gray-600">New roster maintains compliance and coverage standards</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600">4</span>
                  </div>
                  <p className="text-sm text-gray-600">View recovery performance metrics and results</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Tip:</strong> Use the quick examples to test common disruption scenarios
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add missing icon component
const InformationCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default DisruptionSimulator;