import React from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  ClockIcon,
  MapPinIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const SystemStats = ({ stats }) => {
  if (!stats) return null;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'indigo', trend }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-${color}-300`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  const ListItem = ({ icon: Icon, primary, secondary, value, color = 'gray' }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`flex-shrink-0 p-2 rounded-lg bg-${color}-50`}>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{primary}</p>
          <p className="text-sm text-gray-500">{secondary}</p>
        </div>
      </div>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Statistics</h1>
        <p className="text-gray-600 mt-1">Comprehensive overview of airline operations</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={PaperAirplaneIcon}
          title="Total Flights"
          value={stats.total_flights}
          color="blue"
        />
        <StatCard
          icon={UserGroupIcon}
          title="Total Crew"
          value={stats.total_crew}
          color="green"
        />
        <StatCard
          icon={UserGroupIcon}
          title="Active Crew"
          value={stats.active_crew}
          color="indigo"
        />
        <StatCard
          icon={ChartBarIcon}
          title="Preferences"
          value={stats.crew_preferences || 0}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crew by Role */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 text-indigo-600 mr-2" />
            Crew by Role
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.crew_by_role || {}).map(([role, count]) => (
              <ListItem
                key={role}
                icon={UserGroupIcon}
                primary={role}
                secondary={`${count} crew members`}
                value={count}
                color="indigo"
              />
            ))}
          </div>
        </div>

        {/* Flights by Aircraft */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PaperAirplaneIcon className="h-5 w-5 text-blue-600 mr-2" />
            Flights by Aircraft Type
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.flights_by_aircraft || {}).map(([aircraft, count]) => (
              <ListItem
                key={aircraft}
                icon={PaperAirplaneIcon}
                primary={aircraft}
                secondary={`${count} flights`}
                value={count}
                color="blue"
              />
            ))}
          </div>
        </div>

        {/* Flights by Origin */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
            Flights by Origin
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.flights_by_origin || {}).map(([origin, count]) => (
              <ListItem
                key={origin}
                icon={MapPinIcon}
                primary={origin}
                secondary={`${count} flights`}
                value={count}
                color="green"
              />
            ))}
          </div>
        </div>

        {/* Current Roster Performance */}
        {stats.current_roster && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600 mr-2" />
              Roster Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                <span className="text-sm font-medium text-indigo-700">Flight Coverage</span>
                <span className="text-lg font-bold text-indigo-700">
                  {stats.current_roster.covered_flights}/{stats.current_roster.total_flights}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-700">Crew Utilization</span>
                <span className="text-lg font-bold text-green-700">
                  {stats.current_roster.crew_utilized}/{stats.current_roster.total_crew}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-700">Rule Violations</span>
                <span className="text-lg font-bold text-red-700">
                  {stats.current_roster.violations}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Max Duty Hours</span>
                <span className="text-lg font-bold text-blue-700">
                  {stats.current_roster.max_duty_hours.toFixed(1)}h
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics Grid */}
      {stats.current_roster && (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">AI Optimization Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.current_roster.coverage_percentage.toFixed(1)}%</div>
              <div className="text-indigo-200 text-sm">Coverage Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.current_roster.utilization_percentage.toFixed(1)}%</div>
              <div className="text-indigo-200 text-sm">Utilization Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.current_roster.crew_over_14h}</div>
              <div className="text-indigo-200 text-sm">Crew &gt;14h</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.current_roster.duplicate_assignments}</div>
              <div className="text-indigo-200 text-sm">Duplicates</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStats;