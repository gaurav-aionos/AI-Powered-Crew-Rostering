import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ExclamationTriangleIcon,
  PlusIcon,
  PaperAirplaneIcon,
  UserIcon,
  CloudIcon,
  SunIcon,
  BoltIcon,
  EyeIcon,
  XMarkIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

// Move ManualDisruptionForm outside the main component to prevent re-renders
const ManualDisruptionForm = ({ showManualForm, setShowManualForm, formData, setFormData, handleFormSubmit }) => {
  if (!showManualForm) return null;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-semibold text-gray-900">Add Disruption Manually</h3>
            <button
              onClick={() => setShowManualForm(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="crewId" className="block text-sm font-medium text-gray-700 mb-2">
                  Crew ID
                </label>
                <input
                  type="text"
                  id="crewId"
                  value={formData.crewId}
                  onChange={handleInputChange}
                  placeholder="e.g., PIL0012"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="flightId" className="block text-sm font-medium text-gray-700 mb-2">
                  Flight ID
                </label>
                <input
                  type="text"
                  id="flightId"
                  value={formData.flightId}
                  onChange={handleInputChange}
                  placeholder="e.g., 6E1431"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
                >
                  Add Disruption
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DisruptionSimulator = ({ onDisruption }) => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your disruption assistant. I can help you with weather updates, crew availability, and potential disruptions. What would you like to know?", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeWeather, setActiveWeather] = useState('current');
  const messagesEndRef = useRef(null);
  const [formData, setFormData] = useState({
    crewId: '',
    flightId: ''
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    const userMessage = { 
      id: Date.now(), 
      text: inputMessage, 
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      const botResponse = { 
        id: Date.now() + 1, 
        text: getBotResponse(inputMessage), 
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
    
    setInputMessage('');
  };

  const getBotResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('weather') || lowerMsg.includes('forecast')) {
      return "Based on current forecasts, we're expecting some fog in the morning with visibility around 800m. Thunderstorms are possible in the afternoon. I recommend monitoring flights between 2-5 PM.";
    } else if (lowerMsg.includes('delay') || lowerMsg.includes('cancel')) {
      return "I can help check potential delays. Which flight number or route are you concerned about? Currently, we're seeing potential delays for flights to DFW and ORD due to weather.";
    } else if (lowerMsg.includes('crew') || lowerMsg.includes('staff')) {
      return "Crew availability looks good for today. We have 95% of scheduled crew checked in and ready. There are 3 reserve crew members available if needed.";
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      return "Hello! How can I assist with disruption management today? I can provide weather updates, crew status, or potential disruption alerts.";
    } else if (lowerMsg.includes('fog') || lowerMsg.includes('visibility')) {
      return "Current visibility is at 2km, expected to drop to 800m by early morning. This may affect takeoffs and landings. Please review the minimum visibility requirements for affected flights.";
    } else if (lowerMsg.includes('thunderstorm') || lowerMsg.includes('storm')) {
      return "Thunderstorm activity is predicted between 3-7 PM today with a 65% probability. We might need to reroute some flights or adjust schedules. I'll keep you updated.";
    } else {
      return "I understand you're asking about disruptions. Could you provide more details so I can assist better? I can help with weather, crew status, or potential delays.";
    }
  };

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setShowManualForm(false);
    
    try {
      const response = await fetch(`http://localhost:8000/api/disrupt/${formData.crewId}/${formData.flightId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Disruption added successfully:", data);
        onDisruption();
        setFormData({
          crewId: '',
          flightId: '',
        });
      } else {
        console.error('Failed to add disruption');
      }
    } catch (err) {
      console.error('Failed to connect to server:', err);
    }
  }, [formData, onDisruption]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 text-gray-900">
      {/* Header with Add Disruption Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Disruption Management Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage operational disruptions in real-time</p>
        </div>
        <button
          onClick={() => setShowManualForm(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-5 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-blue-500/30 group"
        >
          <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
          Add Disruption Manually
        </button>
      </div>

      {/* Main Content - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Chat Bot Interface */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Disruption Assistant</h2>
            <div className="flex items-center bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Online
            </div>
          </div>
          
          <div className="h-80 overflow-y-auto mb-4 space-y-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-2xl p-4 transition-all duration-300 ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  <div className="flex items-start">
                    {message.sender === 'bot' && (
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-2">{formatTime(message.timestamp)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about weather, delays, or crew status..."
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right Side - Chat Input Suggestions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Input Suggestions</h2>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button 
                onClick={() => setActiveWeather('common')}
                className={`px-3 py-1 text-sm rounded-xl transition-all duration-200 ${activeWeather === 'common' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Common
              </button>
              <button 
                onClick={() => setActiveWeather('weather')}
                className={`px-3 py-1 text-sm rounded-xl transition-all duration-200 ${activeWeather === 'weather' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Weather
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Click to fill the chat input:</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                "Any fog or visibility issues expected?",
                "Probability of thunderstorms today",
                "Which flights might be affected by weather?",
                "Do we have backup crew available?",
                "What's the minimum visibility requirement?"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Disruption Form Modal */}
      <ManualDisruptionForm 
        showManualForm={showManualForm}
        setShowManualForm={setShowManualForm}
        formData={formData}
        setFormData={setFormData}
        handleFormSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default DisruptionSimulator;