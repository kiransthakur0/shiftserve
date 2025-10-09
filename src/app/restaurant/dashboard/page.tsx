"use client";

import { useState, useEffect } from "react";
import { useShifts, Shift } from "../../../contexts/ShiftContext";
import { useRestaurantProfiles } from "../../../context/RestaurantProfilesContext";
import { createClient } from "@/lib/supabase/client";
import Chat from "../../../components/Chat";

const roles = [
  "Server", "Bartender", "Host/Hostess", "Busser", "Line Cook",
  "Dishwasher", "Barback", "Food Runner", "Kitchen Manager"
];

const requirements = [
  "Customer Service", "POS Systems", "Cocktail Making", "Wine Knowledge",
  "Food Safety Certification", "Cash Handling", "Team Leadership", "Multi-tasking"
];

export default function RestaurantDashboard() {
  const supabase = createClient();
  const { shifts, addShift, updateShift, deleteShift, acceptApplication, declineApplication } = useShifts();
  const { getProfile } = useRestaurantProfiles();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const currentRestaurantId = "rest_current"; // Legacy - would come from auth
  const restaurantProfile = getProfile(currentRestaurantId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [applicationsShift, setApplicationsShift] = useState<Shift | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatShift, setChatShift] = useState<Shift | null>(null);

  // Get restaurant profile ID on mount
  useEffect(() => {
    const fetchRestaurantProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('restaurant_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setRestaurantId(profile.id);
        }
      }
    };
    fetchRestaurantProfile();
  }, [supabase]);

  const [newShift, setNewShift] = useState({
    role: "",
    date: "",
    startTime: "",
    endTime: "",
    hourlyRate: 15,
    urgencyLevel: "medium" as "low" | "medium" | "high" | "critical",
    bonusPercentage: 0,
    description: "",
    requirements: [] as string[]
  });

  const urgencyColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800"
  };

  const urgencyBonusMap = {
    low: 0,
    medium: 5,
    high: 15,
    critical: 30
  };

  const handleCreateShift = async () => {
    if (!restaurantId) {
      setError("Restaurant profile not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const duration = calculateDuration(newShift.startTime, newShift.endTime);

      // Insert shift into Supabase
      const { error: insertError } = await supabase
        .from('shifts')
        .insert({
          restaurant_id: restaurantId,
          restaurant_name: restaurantProfile?.restaurantName || "Your Restaurant",
          role: newShift.role,
          hourly_rate: newShift.hourlyRate,
          duration: duration,
          start_time: newShift.startTime,
          shift_date: newShift.date,
          urgent: newShift.urgencyLevel === 'high' || newShift.urgencyLevel === 'critical',
          description: newShift.description,
          requirements: newShift.requirements,
          urgency_level: newShift.urgencyLevel,
          bonus_percentage: newShift.bonusPercentage,
          status: 'draft'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Also add to local context for immediate UI update
      const shift = {
        restaurantName: restaurantProfile?.restaurantName || "Your Restaurant",
        restaurantId: currentRestaurantId,
        ...newShift,
        published: false,
        status: "draft" as const,
        location: restaurantProfile?.location && restaurantProfile?.address ? {
          lat: restaurantProfile.location.lat,
          lng: restaurantProfile.location.lng,
          address: restaurantProfile.address
        } : undefined
      };

      addShift(shift);

      setShowCreateModal(false);
      setNewShift({
        role: "",
        date: "",
        startTime: "",
        endTime: "",
        hourlyRate: 15,
        urgencyLevel: "medium",
        bonusPercentage: 0,
        description: "",
        requirements: []
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create shift');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string): string => {
    if (!start || !end) return "0h";
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const togglePublishShift = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      const newPublished = !shift.published;
      const newStatus = shift.published ? "draft" : "published";

      // Update local context
      updateShift(shiftId, {
        published: newPublished,
        status: newStatus
      });

    }
  };

  const handleDeleteShift = (shiftId: string) => {
    if (confirm("Are you sure you want to delete this shift?")) {
      deleteShift(shiftId);
    }
  };

  const handleUrgencyChange = (urgency: "low" | "medium" | "high" | "critical") => {
    setNewShift({
      ...newShift,
      urgencyLevel: urgency,
      bonusPercentage: urgencyBonusMap[urgency]
    });
  };

  const handleRequirementToggle = (requirement: string) => {
    setNewShift({
      ...newShift,
      requirements: newShift.requirements.includes(requirement)
        ? newShift.requirements.filter(r => r !== requirement)
        : [...newShift.requirements, requirement]
    });
  };

  const handleAcceptApplication = (shiftId: string, workerId: string) => {
    acceptApplication(shiftId, workerId);
  };

  const handleDeclineApplication = (shiftId: string, workerId: string) => {
    declineApplication(shiftId, workerId);
  };

  const viewApplications = (shift: Shift) => {
    setApplicationsShift(shift);
    setShowApplicationsModal(true);
  };

  const openChat = (shift: Shift) => {
    setChatShift(shift);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Restaurant Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your shifts and hiring
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Shift
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Shifts</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{shifts.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Published</h3>
            <p className="text-3xl font-bold text-green-600">{shifts.filter(s => s.published).length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applicants</h3>
            <p className="text-3xl font-bold text-blue-600">{shifts.reduce((acc, s) => acc + s.applicants, 0)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgent Shifts</h3>
            <p className="text-3xl font-bold text-red-600">{shifts.filter(s => s.urgencyLevel === 'high' || s.urgencyLevel === 'critical').length}</p>
          </div>
        </div>

        {/* Shifts List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Shifts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role & Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time & Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Urgency & Bonus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{shift.role}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{shift.date}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">{shift.startTime} - {shift.endTime}</div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">${shift.hourlyRate}/hr</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${urgencyColors[shift.urgencyLevel]}`}>
                          {shift.urgencyLevel}
                        </span>
                        {shift.bonusPercentage > 0 && (
                          <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                            +{shift.bonusPercentage}% bonus
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        shift.published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {shift.applications.length}
                      {shift.applications.length > 0 && (
                        <button
                          onClick={() => viewApplications(shift)}
                          className="ml-2 text-blue-600 hover:text-blue-900 text-xs underline"
                        >
                          View
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {shift.status !== "filled" && (
                        <button
                          onClick={() => togglePublishShift(shift.id)}
                          className={`${
                            shift.published
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          } transition-colors`}
                        >
                          {shift.published ? "Unpublish" : "Publish"}
                        </button>
                      )}
                      {shift.status === "filled" && shift.assignment && (
                        <button
                          onClick={() => openChat(shift)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Chat
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedShift(shift)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        View
                      </button>
                      {shift.status !== "filled" && (
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Shift Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Shift</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role *
                  </label>
                  <select
                    value={newShift.role}
                    onChange={(e) => setNewShift({...newShift, role: e.target.value})}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newShift.date}
                    onChange={(e) => setNewShift({...newShift, date: e.target.value})}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hourly Rate *
                  </label>
                  <input
                    type="number"
                    value={newShift.hourlyRate}
                    onChange={(e) => setNewShift({...newShift, hourlyRate: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="10"
                    max="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Urgency Level
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(["low", "medium", "high", "critical"] as const).map(level => (
                    <label key={level} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        checked={newShift.urgencyLevel === level}
                        onChange={() => handleUrgencyChange(level)}
                        className="mr-2 h-4 w-4"
                      />
                      <div>
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{level}</span>
                        <div className="text-xs text-gray-500">+{urgencyBonusMap[level]}% bonus</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Bonus % (optional)
                </label>
                <input
                  type="number"
                  value={newShift.bonusPercentage}
                  onChange={(e) => setNewShift({...newShift, bonusPercentage: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                  max="100"
                  placeholder="Override default bonus"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newShift.description}
                  onChange={(e) => setNewShift({...newShift, description: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Brief description of the shift..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requirements
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {requirements.map(req => (
                    <label key={req} className="flex items-center p-2 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newShift.requirements.includes(req)}
                        onChange={() => handleRequirementToggle(req)}
                        className="mr-2 h-4 w-4 text-orange-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{req}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShift}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {loading ? 'Creating Shift...' : 'Create Shift'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Detail Modal */}
      {selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedShift.role} - {selectedShift.date}
              </h3>
              <button
                onClick={() => setSelectedShift(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Time</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedShift.startTime} - {selectedShift.endTime}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Rate</h4>
                  <p className="text-gray-600 dark:text-gray-400">${selectedShift.hourlyRate}/hr</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Urgency & Bonus</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${urgencyColors[selectedShift.urgencyLevel]}`}>
                    {selectedShift.urgencyLevel}
                  </span>
                  {selectedShift.bonusPercentage > 0 && (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      +{selectedShift.bonusPercentage}% bonus
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Description</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedShift.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Requirements</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedShift.requirements.map(req => (
                    <span key={req} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-sm">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Status</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedShift.applications.length} applicants</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && applicationsShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Applications for {applicationsShift.role} - {applicationsShift.date}
              </h3>
              <button
                onClick={() => setShowApplicationsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {applicationsShift.applications.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No applications yet
                </p>
              ) : (
                <div className="space-y-4">
                  {applicationsShift.applications.map((application) => (
                    <div key={application.workerId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {application.workerName}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Applied on {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          application.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : application.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>

                      {application.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleAcceptApplication(applicationsShift.id, application.workerId);
                              setShowApplicationsModal(false);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineApplication(applicationsShift.id, application.workerId)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {application.status === "accepted" && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3 mt-3">
                          <p className="text-green-800 dark:text-green-200 text-sm">
                            ✓ This worker has been accepted for this shift. A private chat is now available.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Component */}
      {showChat && chatShift && (
        <Chat
          shift={chatShift}
          currentUserId="rest_current"
          currentUserType="restaurant"
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}