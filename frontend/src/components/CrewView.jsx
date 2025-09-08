import React, { useState } from 'react';
import { 
  UserIcon, 
  ClockIcon, 
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const CrewView = ({ roster }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const crewAssignments = roster.roster.reduce((acc, assignment) => {
    if (!acc[assignment.crew_id]) {
      acc[assignment.crew_id] = [];
    }
    acc[assignment.crew_id].push(assignment);
    return acc;
  }, {});

  const crewHours = {};
  Object.entries(crewAssignments).forEach(([crewId, assignments]) => {
    crewHours[crewId] = assignments.reduce((total, assignment) => total + assignment.duty_hours, 0);
  });

  const filteredCrew = Object.entries(crewAssignments)
    .filter(([crewId]) => crewId.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(([crewA], [crewB]) => crewA.localeCompare(crewB));

  const getRoleColor = (role) => {
    const colors = {
      'Captain': 'bg-red-500',
      'First Officer': 'bg-orange-500',
      'Senior Crew': 'bg-blue-500',
      'Crew Member': 'bg-green-500',
      'Trainee': 'bg-purple-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  const getDutyLevelColor = (hours) => {
    if (hours > 14) return 'bg-red-500';
    if (hours > 12) return 'bg-orange-500';
    if (hours > 10) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crew Assignments</h1>
        <p className="text-gray-600 mt-1">Individual crew member schedules and duty hours</p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search crew members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
        />
      </div>

      {/* Crew Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCrew.map(([crewId, assignments]) => {
          const totalHours = crewHours[crewId];
          const role = assignments[0]?.role || 'Unknown';
          
          return (
            <div key={crewId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all duration-200">
              {/* Crew Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${getRoleColor(role)}`}>
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{crewId}</h3>
                    <p className="text-sm text-gray-500">{role}</p>
                  </div>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  totalHours > 14 ? 'bg-red-100 text-red-800' :
                  totalHours > 12 ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {totalHours.toFixed(1)}h
                </div>
              </div>

              {/* Duty Hours Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Duty Hours</span>
                  <span>{totalHours.toFixed(1)} / 14h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getDutyLevelColor(totalHours)}`}
                    style={{ width: `${Math.min((totalHours / 14) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Flight Assignments */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Flight Assignments ({assignments.length})</h4>
                <div className="space-y-2">
                  {assignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        <PaperAirplaneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{assignment.flight_id}</span>
                      </div>
                      <span className="text-sm text-gray-500">{assignment.duty_hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCrew.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No crew members found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try a different search term' : 'No crew assignments available'}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Crew Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{Object.keys(crewAssignments).length}</div>
            <div className="text-sm text-blue-600">Total Crew</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {Object.values(crewHours).filter(h => h <= 10).length}
            </div>
            <div className="text-sm text-green-600">Under 10h</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">
              {Object.values(crewHours).filter(h => h > 10 && h <= 14).length}
            </div>
            <div className="text-sm text-orange-600">10-14h</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {Object.values(crewHours).filter(h => h > 14).length}
            </div>
            <div className="text-sm text-red-600">Over 14h</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewView;