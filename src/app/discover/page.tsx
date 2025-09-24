"use client";

import { useState, useEffect } from "react";

interface Shift {
  id: string;
  restaurantName: string;
  role: string;
  hourlyRate: number;
  duration: string;
  startTime: string;
  date: string;
  distance: number;
  urgent: boolean;
  description: string;
  requirements: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

const mockShifts: Shift[] = [
  {
    id: "1",
    restaurantName: "The Blue Table",
    role: "Server",
    hourlyRate: 18,
    duration: "6 hours",
    startTime: "5:00 PM",
    date: "Today",
    distance: 2.3,
    urgent: true,
    description: "Busy dinner service, need experienced server",
    requirements: ["Customer Service", "POS Systems"],
    location: { lat: 40.7128, lng: -74.0060, address: "123 Main St, Downtown" }
  },
  {
    id: "2",
    restaurantName: "Mario's Kitchen",
    role: "Bartender",
    hourlyRate: 22,
    duration: "8 hours",
    startTime: "4:00 PM",
    date: "Today",
    distance: 1.8,
    urgent: false,
    description: "Evening shift at busy cocktail bar",
    requirements: ["Cocktail Making", "Wine Knowledge"],
    location: { lat: 40.7589, lng: -73.9851, address: "456 Broadway, Midtown" }
  },
  {
    id: "3",
    restaurantName: "Fresh Garden Bistro",
    role: "Dishwasher",
    hourlyRate: 16,
    duration: "4 hours",
    startTime: "6:00 PM",
    date: "Tomorrow",
    distance: 3.1,
    urgent: false,
    description: "Weekend dinner rush coverage",
    requirements: ["Team Leadership"],
    location: { lat: 40.7505, lng: -73.9934, address: "789 5th Ave, Upper East" }
  },
  {
    id: "4",
    restaurantName: "Sunset Grill",
    role: "Line Cook",
    hourlyRate: 20,
    duration: "6 hours",
    startTime: "3:00 PM",
    date: "Today",
    distance: 4.2,
    urgent: true,
    description: "Need experienced cook for busy lunch/dinner",
    requirements: ["Food Preparation", "Multi-tasking"],
    location: { lat: 40.7282, lng: -73.7949, address: "321 Ocean Blvd, Waterfront" }
  },
  {
    id: "5",
    restaurantName: "Coffee Corner",
    role: "Barista",
    hourlyRate: 15,
    duration: "5 hours",
    startTime: "7:00 AM",
    date: "Tomorrow",
    distance: 1.2,
    urgent: false,
    description: "Morning rush coverage needed",
    requirements: ["Customer Service"],
    location: { lat: 40.7614, lng: -73.9776, address: "159 Coffee St, Village" }
  }
];

export default function DiscoverShifts() {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>(mockShifts);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Filter states
  const [minRate, setMinRate] = useState(15);
  const [maxRate, setMaxRate] = useState(25);
  const [maxDistance, setMaxDistance] = useState(10);
  const [selectedRole, setSelectedRole] = useState("all");
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  const roles = ["all", "Server", "Bartender", "Dishwasher", "Line Cook", "Barista", "Host"];

  useEffect(() => {
    let filtered = shifts.filter(shift =>
      shift.hourlyRate >= minRate &&
      shift.hourlyRate <= maxRate &&
      shift.distance <= maxDistance &&
      (selectedRole === "all" || shift.role === selectedRole) &&
      (!showUrgentOnly || shift.urgent)
    );
    setFilteredShifts(filtered);
  }, [shifts, minRate, maxRate, maxDistance, selectedRole, showUrgentOnly]);

  const handleApplyToShift = (shiftId: string) => {
    alert(`Applied to shift ${shiftId}! This will be connected to the backend later.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Filters Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Discover Shifts
            </h1>

            {/* Filters */}
            <div className="space-y-6">
              {/* Hourly Rate Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hourly Rate: ${minRate} - ${maxRate}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Min: ${minRate}</label>
                    <input
                      type="range"
                      min="10"
                      max="30"
                      value={minRate}
                      onChange={(e) => setMinRate(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Max: ${maxRate}</label>
                    <input
                      type="range"
                      min="15"
                      max="35"
                      value={maxRate}
                      onChange={(e) => setMaxRate(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Distance: {maxDistance} miles
                </label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role === "all" ? "All Roles" : role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgent Filter */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showUrgentOnly}
                    onChange={(e) => setShowUrgentOnly(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Show urgent shifts only
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredShifts.length} shifts found
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Shift List */}
          <div className="w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Available Shifts
              </h2>
              <div className="space-y-3">
                {filteredShifts.map((shift) => (
                  <div
                    key={shift.id}
                    onClick={() => setSelectedShift(shift)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedShift?.id === shift.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {shift.restaurantName}
                      </h3>
                      {shift.urgent && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      {shift.role}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ${shift.hourlyRate}/hr • {shift.duration} • {shift.distance} mi
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {shift.date} at {shift.startTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map/Detail View */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 relative">
            {selectedShift ? (
              /* Shift Detail View */
              <div className="p-6 h-full overflow-y-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedShift.restaurantName}
                      </h2>
                      <p className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                        {selectedShift.role}
                      </p>
                    </div>
                    {selectedShift.urgent && (
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                        Urgent Hiring
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Rate</h4>
                      <p className="text-gray-600 dark:text-gray-400">${selectedShift.hourlyRate}/hour</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Duration</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedShift.duration}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">When</h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedShift.date} at {selectedShift.startTime}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Distance</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedShift.distance} miles away</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Location</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedShift.location.address}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedShift.description}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Requirements</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedShift.requirements.map((req, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyToShift(selectedShift.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Apply for This Shift
                  </button>
                </div>
              </div>
            ) : (
              /* Map Placeholder */
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Interactive Map Coming Soon
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                    Select a shift from the list to view details, or use the map feature when it becomes available.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      💡 <strong>Coming soon:</strong> Interactive map with shift locations, real-time updates, and navigation features.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}