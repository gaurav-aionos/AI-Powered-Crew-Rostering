import React, { useState } from 'react';
import { 
  PaperAirplaneIcon, 
  UserIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const FlightSchedule = ({ roster }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Create a map of flight details for easy lookup
  const flightDetailsMap = {};
  if (roster.metrics && roster.metrics.flight_details) {
    roster.metrics.flight_details.forEach(flight => {
      flightDetailsMap[flight.flight_id] = flight;
    });
  }

  const filteredFlights = roster.roster.filter(assignment => {
    const matchesSearch = assignment.flight_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.crew_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || 
      new Date(assignment.departure_time).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
    
    return matchesSearch && matchesDate;
  });

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

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Flight Schedule</h1>
        <p className="text-gray-600 mt-1">Crew assignments across all flights</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search - takes remaining space */}
        <div className="relative flex-grow">
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

        {/* Date Filter - fixed width on the right */}
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {(searchTerm || dateFilter) && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setDateFilter('');
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Flight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(flightsGrouped).map(([flightId, assignments]) => {
          const flightDetails = flightDetailsMap[flightId] || {};
          const departureTime = assignments[0]?.departure_time;
          
          return (
            <div key={flightId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all duration-200">
              {/* Flight Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <PaperAirplaneIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{flightId}</h3>
                    {flightDetails.aircraft_type && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md mt-1">
                        {flightDetails.aircraft_type}
                      </span>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {assignments.length} crew
                </span>
              </div>

              {/* Flight Route */}
              {flightDetails.origin && flightDetails.destination && (
                <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{flightDetails.origin}</div>
                    <div className="text-xs text-gray-500">Origin</div>
                  </div>
                  <div className="flex-1 mx-3 relative">
                    <div className="h-px bg-blue-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PaperAirplaneIcon className="h-4 w-4 text-blue-500 transform " />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{flightDetails.destination}</div>
                    <div className="text-xs text-gray-500">Destination</div>
                  </div>
                </div>
              )}

              {/* Flight Date and Time */}
              {departureTime && (
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(departureTime)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatTime(departureTime)}
                    </span>
                  </div>
                </div>
              )}

              {/* Crew Assignments */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                  Crew Members
                </h4>
                <div className="space-y-2">
                  {assignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            assignment.role === 'Captain' ? 'bg-red-100 text-red-600' :
                            assignment.role === 'First Officer' ? 'bg-orange-100 text-orange-600' :
                            assignment.role === 'Senior Crew' ? 'bg-blue-100 text-blue-600' :
                            assignment.role === 'Crew Member' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            <UserIcon className="h-4 w-4" />
                          </div>
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
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(flightsGrouped).length === 0 && (
        <div className="text-center py-12">
          <PaperAirplaneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No flights found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || dateFilter ? 'Try different filters' : 'No flight assignments available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FlightSchedule;