import React from 'react';
import {
    PaperAirplaneIcon,
    UserGroupIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';

const colorClasses = {
  blue: "bg-blue-500",
  red: "bg-red-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
};

const RosterOverview = ({ roster, stats }) => {
    const metrics = roster.metrics;

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

    const ProgressBar = ({ label, value, max, color = 'indigo', suffix }) => (
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>{label}</span>
                <span className="text-indigo-600">{value}{suffix}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`${colorClasses[color] || "bg-blue-500"} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${(value / max) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Roster Overview</h1>
                <p className="text-gray-600 mt-1">AI-optimized crew scheduling performance</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={PaperAirplaneIcon}
                    title="Flight Coverage"
                    value={`${metrics.covered_flights}/${metrics.total_flights}`}
                    subtitle={`${metrics.coverage_percentage.toFixed(1)}% covered`}
                    color="indigo"
                />
                <StatCard
                    icon={UserGroupIcon}
                    title="Crew Utilization"
                    value={`${metrics.crew_utilized}/${metrics.total_crew}`}
                    subtitle={`${metrics.utilization_percentage.toFixed(1)}% utilized`}
                    color="green"
                />
                <StatCard
                    icon={ClockIcon}
                    title="Max Duty Hours"
                    value={metrics.max_duty_hours.toFixed(1)}
                    subtitle="Highest individual hours"
                    color={metrics.max_duty_hours > 16 ? 'red' : 'blue'}
                />
                <StatCard
                    icon={metrics.violations > 0 ? ExclamationTriangleIcon : CheckBadgeIcon}
                    title="Violations"
                    value={metrics.violations}
                    subtitle="DGCA rule issues"
                    color={metrics.violations > 0 ? 'red' : 'green'}
                />
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Flight Coverage Progress</h3>
                    <ProgressBar
                        label="Flights Covered"
                        value={metrics.covered_flights}
                        max={metrics.total_flights}
                        suffix={` / ${metrics.total_flights}`}
                        color="indigo"
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Crew Utilization Progress</h3>
                    <ProgressBar
                        label="Crew Utilized"
                        value={metrics.crew_utilized}
                        max={metrics.total_crew}
                        suffix={` / ${metrics.total_crew}`}
                        color="green"
                    />
                </div>
            </div>

            {/* Duty Hours Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Duty Hours Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition-colors">
                        <div className="text-2xl font-bold text-green-700">
                            {metrics.crew_utilized - metrics.crew_over_12h - metrics.crew_over_14h}
                        </div>
                        <div className="text-sm text-green-600 mt-1">0-8 Hours</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors">
                        <div className="text-2xl font-bold text-blue-700">
                            {metrics.crew_over_12h - metrics.crew_over_14h}
                        </div>
                        <div className="text-sm text-blue-600 mt-1">12-14 Hours</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200 hover:border-orange-300 transition-colors">
                        <div className="text-2xl font-bold text-orange-700">
                            {metrics.crew_over_14h}
                        </div>
                        <div className="text-sm text-orange-600 mt-1">14+ Hours</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="text-2xl font-bold text-gray-700">
                            {metrics.crew_utilized}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Total Crew</div>
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">AI Optimization Summary</h3>
                <p className="text-indigo-100">
                    Successfully optimized {metrics.covered_flights} flights with {metrics.crew_utilized} crew members
                    while maintaining {metrics.violations === 0 ? 'perfect' : 'acceptable'} DGCA compliance.
                </p>
            </div>
        </div>
    );
};

export default RosterOverview;