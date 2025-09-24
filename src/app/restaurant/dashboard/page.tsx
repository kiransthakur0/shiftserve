"use client";

import { useState } from "react";

interface Shift {
  id: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  bonusPercentage: number;
  description: string;
  requirements: string[];
  published: boolean;
  applicants: number;
  status: "draft" | "published" | "filled" | "cancelled";
  createdAt: string;
}

const mockShifts: Shift[] = [
  {
    id: "1",
    role: "Server",
    date: "2024-09-24",
    startTime: "17:00",
    endTime: "23:00",
    hourlyRate: 18,
    urgencyLevel: "high",
    bonusPercentage: 20,
    description: "Busy dinner service, need experienced server",
    requirements: ["Customer Service", "POS Systems"],
    published: true,
    applicants: 3,
    status: "published",
    createdAt: "2024-09-23"
  },
  {
    id: "2",
    role: "Bartender",
    date: "2024-09-25",
    startTime: "16:00",
    endTime: "00:00",
    hourlyRate: 22,
    urgencyLevel: "medium",
    bonusPercentage: 10,
    description: "Weekend evening shift",
    requirements: ["Cocktail Making", "Wine Knowledge"],
    published: true,
    applicants: 1,
    status: "published",
    createdAt: "2024-09-22"
  }
];

const roles = [
  "Server", "Bartender", "Host/Hostess", "Busser", "Line Cook",
  "Dishwasher", "Barback", "Food Runner", "Kitchen Manager"
];

const requirements = [
  "Customer Service", "POS Systems", "Cocktail Making", "Wine Knowledge",
  "Food Safety Certification", "Cash Handling", "Team Leadership", "Multi-tasking"
];

export default function RestaurantDashboard() {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

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

  const handleCreateShift = () => {
    const shift: Shift = {
      id: (shifts.length + 1).toString(),
      ...newShift,
      published: false,
      applicants: 0,
      status: "draft",
      createdAt: new Date().toISOString().split('T')[0]
    };

    setShifts([...shifts, shift]);
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
  };

  const togglePublishShift = (shiftId: string) => {
    setShifts(shifts.map(shift =>
      shift.id === shiftId
        ? {
            ...shift,
            published: !shift.published,
            status: shift.published ? "draft" : "published"
          }
        : shift
    ));
  };

  const deleteShift = (shiftId: string) => {
    if (confirm("Are you sure you want to delete this shift?")) {
      setShifts(shifts.filter(shift => shift.id !== shiftId));
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
                      {shift.applicants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
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
                      <button
                        onClick={() => setSelectedShift(shift)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteShift(shift.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
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
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Create Shift
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
                <p className="text-gray-600 dark:text-gray-400">{selectedShift.applicants} applicants</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}