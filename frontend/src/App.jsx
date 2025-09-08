import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  PaperAirplaneIcon, 
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import RosterOverview from './components/RosterOverview';
import FlightSchedule from './components/FlightSchedule';
import CrewView from './components/CrewView';
import SystemStats from './components/SystemStats';
import DisruptionSimulator from './components/DisruptionSimulator';

const API_BASE = 'http://localhost:8000';

function App() {
  const [roster, setRoster] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const navigation = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'flights', name: 'Flight Schedule', icon: PaperAirplaneIcon },
    { id: 'crew', name: 'Crew View', icon: UserGroupIcon },
    { id: 'stats', name: 'Statistics', icon: ChartBarIcon },
    { id: 'disrupt', name: 'Disruption Sim', icon: ExclamationTriangleIcon },
  ];

  const fetchRoster = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/roster`);
      if (response.ok) {
        const data = await response.json();
        setRoster(data);
        console.log("roster:  ",data)
      } else {
        setError('No roster available. Generate one first.');
      }
    } catch (err) {
      setError('Failed to fetch roster');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const generateRoster = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/generate-roster`, {
        method: 'POST'
      });
      if (response.ok) {
        await fetchRoster();
        await fetchStats();
      } else {
        setError('Failed to generate roster');
      }
    } catch (err) {
      setError('Failed to generate roster');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    fetchRoster();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <PaperAirplaneIcon className="h-8 w-8 text-indigo-600 transform rotate-45" />
                  <span className="text-2xl font-bold text-gray-900">IndiGo</span>
                  <span className="text-2xl font-light text-gray-600">Crew Rostering</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={generateRoster}
                disabled={loading}
                className="hidden md:flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                )}
                {roster ? 'Regenerate' : 'Generate Roster'}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <button
                onClick={generateRoster}
                disabled={loading}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Roster'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!roster ? (
          <div className="text-center py-12">
            <PaperAirplaneIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No roster available</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by generating your first AI-optimized crew roster.</p>
            <div className="mt-6">
              <button
                onClick={generateRoster}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                )}
                Generate Roster
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <RosterOverview roster={roster} stats={stats} />}
            {activeTab === 'flights' && <FlightSchedule roster={roster} />}
            {activeTab === 'crew' && <CrewView roster={roster} />}
            {activeTab === 'stats' && <SystemStats stats={stats} />}
            {activeTab === 'disrupt' && <DisruptionSimulator onDisruption={fetchRoster} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PaperAirplaneIcon className="h-6 w-6 text-indigo-600 transform rotate-45" />
              <span className="text-lg font-bold text-gray-900">IndiGo</span>
              <span className="text-lg text-gray-600">Crew Rostering System</span>
            </div>
            <p className="text-sm text-gray-500">AI-Powered Crew Optimization</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;