import React, { useState } from 'react';
import { 
  PaperAirplaneIcon, 
  UserIcon, 
  ClockIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const FlightSchedule = ({ roster }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFlights = roster.roster.filter(assignment =>
    assignment.flight_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.crew_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const flightsGrouped = filteredFlights.reduce((acc, assignment) => {
    if (!acc[assignment.flight_id]) {
      acc[assignment.flight_id] = [];
    }
    acc[assignment.flight_id].push(assignment);
    return acc;
  }, {});

  const getRoleColor = (role) => {
    const colors = {
      'Captain': 'bg-red-100 text-red-800 border-red-200',
      'First Officer': 'bg-orange-100 text-orange-800 border-orange-200',
      'Senior Crew': 'bg-blue-100 text-blue-800 border-blue-200',
      'Crew Member': 'bg-green-100 text-green-800 border-green-200',
      'Trainee': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  console.log("roster----->",roster)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Flight Schedule</h1>
        <p className="text-gray-600 mt-1">Crew assignments across all flights</p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search flights or crew members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
        />
      </div>

      {/* Flight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(flightsGrouped).map(([flightId, assignments]) => (
          <div key={flightId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all duration-200">
            {/* Flight Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <PaperAirplaneIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">{flightId}</h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {assignments.length} crew
              </span>
            </div>

            {/* Flight Date and Time */}
            <div className="text-sm text-gray-500 mb-4">
              <p><strong>Date:</strong> {new Date(assignments[0].departure_time).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(assignments[0].departure_time).toLocaleTimeString()}</p>
            </div>

            {/* Crew Assignments */}
            <div className="space-y-3">
              {assignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{assignment.crew_id}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(assignment.role)}`}>
                        {assignment.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <span>{assignment.duty_hours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {Object.keys(flightsGrouped).length === 0 && (
        <div className="text-center py-12">
          <PaperAirplaneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No flights found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try a different search term' : 'No flight assignments available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FlightSchedule;
