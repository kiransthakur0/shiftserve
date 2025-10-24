"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useShifts, Shift } from "../../contexts/ShiftContext";
import { createClient } from "@/lib/supabase/client";
import Chat from "../../components/Chat";
import Navigation from "../../components/Navigation";

// Dynamic import for ShiftMap to avoid SSR issues with Leaflet
const ShiftMap = dynamic(() => import("../../components/ShiftMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    </div>
  ),
});

// Available skills for filtering
const availableSkills = [
  "Customer Service", "POS Systems", "Cocktail Making", "Wine Knowledge",
  "Food Safety Certification", "Cash Handling", "Team Leadership", "Multi-tasking",
  "Food Preparation", "Inventory Management", "Cleaning", "Communication"
];

export default function DiscoverShifts() {
  const { applyToShift, getPublishedShifts, shifts, addShift } = useShifts();
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingShifts, setLoadingShifts] = useState(true);

  // Simulated current worker ID (would come from authentication)
  const currentWorkerId = "worker_1";
  const currentWorkerName = "John Doe";
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatShift, setChatShift] = useState<Shift | null>(null);

  // Filter states
  const [minRate, setMinRate] = useState(15);
  const [maxRate, setMaxRate] = useState(25);
  const [maxDistance, setMaxDistance] = useState(50);
  const [selectedRole, setSelectedRole] = useState("all");
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillMatchMode, setSkillMatchMode] = useState<"any" | "all">("any");

  const roles = ["all", "Server", "Bartender", "Dishwasher", "Line Cook", "Barista", "Host/Hostess", "Busser", "Food Runner", "Kitchen Manager", "Barback"];

  // Load published shifts from database
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const supabase = createClient();
        const { data: shiftsData, error } = await supabase
          .from('shifts')
          .select('*')
          .eq('status', 'published')
          .order('shift_date', { ascending: true });

        if (error) {
          console.error('Error fetching shifts:', error);
          setLoadingShifts(false);
          return;
        }

        if (shiftsData) {
          // Transform database shifts to match Shift interface
          shiftsData.forEach((dbShift) => {
            // Calculate distance if location data exists
            // In a real app, you'd calculate distance from worker's location to restaurant location
            // For now, we'll use a placeholder or skip distance calculation
            const distance = undefined;

            const shift: Shift = {
              id: dbShift.id,
              restaurantName: dbShift.restaurant_name,
              restaurantId: dbShift.restaurant_id,
              role: dbShift.role,
              date: dbShift.shift_date,
              startTime: dbShift.start_time,
              endTime: '23:00', // End time not in DB schema, would need to calculate from duration
              hourlyRate: parseFloat(dbShift.hourly_rate),
              urgencyLevel: dbShift.urgency_level as "low" | "medium" | "high" | "critical",
              bonusPercentage: dbShift.bonus_percentage,
              description: dbShift.description || '',
              requirements: dbShift.requirements || [],
              published: dbShift.status === 'published',
              applicants: 0, // Would need to count from shift_applications table
              status: dbShift.status as "draft" | "published" | "filled" | "cancelled",
              createdAt: dbShift.created_at,
              duration: dbShift.duration,
              distance: distance,
              urgent: dbShift.urgent,
              applications: [],
              chatMessages: []
            };

            // Add to local context if not already present
            if (!shifts.find(s => s.id === shift.id)) {
              addShift(shift);
            }
          });
        }
        setLoadingShifts(false);
      } catch (err) {
        console.error('Error loading shifts:', err);
        setLoadingShifts(false);
      }
    };

    // Fetch shifts regardless of userLocation
    fetchShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get user's geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
        },
        () => {
          setLocationError("Unable to get your location. Using default location.");
          // Use a default location if geolocation fails (e.g., New York City)
          const defaultLocation = { lat: 40.7128, lng: -74.0060 };
          setUserLocation(defaultLocation);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      // Use default location
      const defaultLocation = { lat: 40.7128, lng: -74.0060 };
      setUserLocation(defaultLocation);
    }
  }, []);

  useEffect(() => {
    const publishedShifts = getPublishedShifts();
    const filtered = publishedShifts.filter(shift => {
      // Basic filters
      const rateMatch = shift.hourlyRate >= minRate && shift.hourlyRate <= maxRate;
      const distanceMatch = !shift.distance || shift.distance <= maxDistance;
      const roleMatch = selectedRole === "all" || shift.role === selectedRole;
      const urgentMatch = !showUrgentOnly || shift.urgent;

      // Skills filter
      let skillsMatch = true;
      if (selectedSkills.length > 0) {
        if (skillMatchMode === "all") {
          // All selected skills must be in shift requirements
          skillsMatch = selectedSkills.every(skill => shift.requirements.includes(skill));
        } else {
          // Any selected skill must be in shift requirements
          skillsMatch = selectedSkills.some(skill => shift.requirements.includes(skill));
        }
      }

      return rateMatch && distanceMatch && roleMatch && urgentMatch && skillsMatch;
    });
    setFilteredShifts(filtered);
  }, [shifts, minRate, maxRate, maxDistance, selectedRole, showUrgentOnly, selectedSkills, skillMatchMode, getPublishedShifts]);

  const handleApplyToShift = (shiftId: string) => {
    const success = applyToShift(shiftId, currentWorkerId, currentWorkerName);
    if (success) {
      alert("Application submitted successfully!");
    } else {
      alert("Unable to apply. You may have already applied or the shift is no longer available.");
    }
  };

  // Check if current worker has applied to a shift
  const hasApplied = (shift: Shift) => {
    return shift.applications.some(app => app.workerId === currentWorkerId);
  };

  // Get application status for current worker
  const getApplicationStatus = (shift: Shift) => {
    const application = shift.applications.find(app => app.workerId === currentWorkerId);
    return application?.status;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex h-screen pt-28">
        {/* Filters Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 shadow-lg overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Discover Shifts
            </h1>

            {/* Filters */}
            <div className="space-y-6">
              {/* Skills Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Skills/Requirements
                </label>
                <div className="mb-3">
                  <label className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="skillMatch"
                      checked={skillMatchMode === "any"}
                      onChange={() => setSkillMatchMode("any")}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Match ANY selected skill</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="skillMatch"
                      checked={skillMatchMode === "all"}
                      onChange={() => setSkillMatchMode("all")}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Match ALL selected skills</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {availableSkills.map(skill => (
                    <label key={skill} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkills([...selectedSkills, skill]);
                          } else {
                            setSelectedSkills(selectedSkills.filter(s => s !== skill));
                          }
                        }}
                        className="mr-2 h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

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
                  min="10"
                  max="50"
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
              {selectedSkills.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 mb-1">Filtering by skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSkills.map(skill => (
                      <span key={skill} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
              {loadingShifts ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading shifts...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredShifts.map((shift) => (
                  <div
                    key={shift.id}
                    onClick={() => setSelectedShift(selectedShift?.id === shift.id ? null : shift)}
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
              )}
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

                  {selectedShift.location && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Location</h4>
                      <p className="text-gray-600 dark:text-gray-400">{selectedShift.location.address}</p>
                    </div>
                  )}

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

                  {(() => {
                    const applicationStatus = getApplicationStatus(selectedShift);
                    const applied = hasApplied(selectedShift);

                    if (selectedShift.status === "filled") {
                      return (
                        <button className="w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed">
                          Position Filled
                        </button>
                      );
                    }

                    if (applied) {
                      switch (applicationStatus) {
                        case "pending":
                          return (
                            <button className="w-full bg-yellow-500 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed">
                              Application Pending
                            </button>
                          );
                        case "accepted":
                          return (
                            <div className="space-y-2">
                              <button className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed">
                                Application Accepted!
                              </button>
                              <button
                                onClick={() => {
                                  setChatShift(selectedShift);
                                  setShowChat(true);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                              >
                                Open Chat
                              </button>
                            </div>
                          );
                        case "declined":
                          return (
                            <button className="w-full bg-red-500 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed">
                              Application Declined
                            </button>
                          );
                      }
                    }

                    return (
                      <button
                        onClick={() => handleApplyToShift(selectedShift.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Apply for This Shift
                      </button>
                    );
                  })()}
                </div>
              </div>
            ) : (
              /* Interactive Map */
              <div className="p-4 h-full">
                {locationError && (
                  <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg mb-4">
                    {locationError}
                  </div>
                )}
                <ShiftMap
                  shifts={filteredShifts}
                  maxDistance={maxDistance}
                  selectedShift={selectedShift}
                  onShiftSelect={setSelectedShift}
                  userLocation={userLocation}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Component */}
      {showChat && chatShift && (
        <Chat
          shift={chatShift}
          currentUserId={currentWorkerId}
          currentUserType="worker"
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}