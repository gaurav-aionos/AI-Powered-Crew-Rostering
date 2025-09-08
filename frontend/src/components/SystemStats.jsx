import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  ChartBarIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  ClockIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SystemStats = ({ stats }) => {
  if (!stats) return null;

  // Chart options and configurations
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    cutout: '60%',
  };

  // Prepare chart data
  const crewByRoleData = {
    labels: Object.keys(stats.crew_by_role || {}),
    datasets: [
      {
        label: 'Crew Members',
        data: Object.values(stats.crew_by_role || {}),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const flightsByAircraftData = {
    labels: Object.keys(stats.flights_by_aircraft || {}),
    datasets: [
      {
        label: 'Number of Flights',
        data: Object.values(stats.flights_by_aircraft || {}),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const performanceTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Coverage Rate (%)',
        data: [92, 94, 96, 95, 98, 97, 99],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Utilization Rate (%)',
        data: [85, 87, 89, 88, 91, 90, 92],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const dutyHoursDistributionData = {
    labels: ['Under 8h', '8-10h', '10-12h', '12-14h', 'Over 14h'],
    datasets: [
      {
        label: 'Crew Members',
        data: [45, 78, 92, 34, 12],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ProgressBar = ({ value, max, color = 'indigo', label, showValue = true }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        {showValue && <span>{value}/{max}</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ease-out ${
            color === 'indigo' ? 'bg-indigo-500' :
            color === 'green' ? 'bg-green-500' :
            color === 'red' ? 'bg-red-500' :
            'bg-blue-500'
          }`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'indigo', trend }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-${color}-300 group`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-${color}-100 to-${color}-200 group-hover:from-${color}-200 group-hover:to-${color}-300 transition-colors`}>
          <Icon className={`h-6 w-6 text-${color}-600 group-hover:text-${color}-700 transition-colors`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-700 mt-1`}>{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-1 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          System Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive overview of airline operations and performance metrics</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={PaperAirplaneIcon}
          title="Total Flights"
          value={stats.total_flights}
          color="blue"
          trend={2.5}
        />
        <StatCard
          icon={UserGroupIcon}
          title="Total Crew"
          value={stats.total_crew}
          color="green"
          trend={1.8}
        />
        <StatCard
          icon={UserGroupIcon}
          title="Active Crew"
          value={stats.active_crew}
          color="indigo"
          trend={3.2}
        />
        <StatCard
          icon={ChartBarIcon}
          title="Preferences"
          value={stats.crew_preferences || 0}
          color="purple"
          trend={4.1}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Crew by Role Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <UserGroupIcon className="h-5 w-5 text-indigo-600" />
            </div>
            Crew Distribution by Role
          </h3>
          <div className="h-64">
            <Bar data={crewByRoleData} options={barChartOptions} />
          </div>
        </div>

        {/* Flights by Aircraft Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <PaperAirplaneIcon className="h-5 w-5 text-blue-600" />
            </div>
            Flights by Aircraft Type
          </h3>
          <div className="h-64">
            <Bar data={flightsByAircraftData} options={barChartOptions} />
          </div>
        </div>

        {/* Performance Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
            </div>
            Weekly Performance Trends
          </h3>
          <div className="h-64">
            <Line data={performanceTrendData} options={lineChartOptions} />
          </div>
        </div>

        {/* Duty Hours Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-3">
              <ClockIcon className="h-5 w-5 text-orange-600" />
            </div>
            Duty Hours Distribution
          </h3>
          <div className="h-64">
            <Doughnut data={dutyHoursDistributionData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Current Roster Performance */}
      {stats.current_roster && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600" />
              </div>
              Roster Performance Metrics
            </h3>
            <div className="space-y-4">
              <ProgressBar
                value={stats.current_roster.covered_flights}
                max={stats.current_roster.total_flights}
                color="indigo"
                label="Flight Coverage"
              />
              <ProgressBar
                value={stats.current_roster.crew_utilized}
                max={stats.current_roster.total_crew}
                color="green"
                label="Crew Utilization"
              />
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-red-700">Rule Violations</span>
                </div>
                <span className="text-lg font-bold text-red-700">
                  {stats.current_roster.violations}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Max Duty Hours</span>
                </div>
                <span className="text-lg font-bold text-blue-700">
                  {stats.current_roster.max_duty_hours.toFixed(1)}h
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics Grid */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 rounded-xl shadow-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">AI Optimization Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">{stats.current_roster.coverage_percentage.toFixed(1)}%</div>
                <div className="text-indigo-200 text-sm">Coverage</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">{stats.current_roster.utilization_percentage.toFixed(1)}%</div>
                <div className="text-indigo-200 text-sm">Utilization</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">{stats.current_roster.crew_over_14h}</div>
                <div className="text-indigo-200 text-sm">Overtime</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-2xl font-bold">{stats.current_roster.duplicate_assignments}</div>
                <div className="text-indigo-200 text-sm">Duplicates</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200">
          <div className="flex items-center mb-3">
            <CheckBadgeIcon className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="font-semibold text-green-800">Success Rate</h4>
          </div>
          <div className="text-2xl font-bold text-green-700">98.7%</div>
          <div className="text-sm text-green-600 mt-1">Assignments completed successfully</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center mb-3">
            <ArrowPathIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-blue-800">Efficiency</h4>
          </div>
          <div className="text-2xl font-bold text-blue-700">87.3%</div>
          <div className="text-sm text-blue-600 mt-1">Optimal crew utilization</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-5 border border-amber-200">
          <div className="flex items-center mb-3">
            <ClockIcon className="h-5 w-5 text-amber-600 mr-2" />
            <h4 className="font-semibold text-amber-800">Avg. Duty Hours</h4>
          </div>
          <div className="text-2xl font-bold text-amber-700">9.2h</div>
          <div className="text-sm text-amber-600 mt-1">Per crew member daily</div>
        </div>
      </div>
    </div>
  );
};

export default SystemStats;