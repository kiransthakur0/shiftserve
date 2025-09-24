"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const cuisineTypes = [
  "American", "Italian", "Mexican", "Asian", "Mediterranean",
  "French", "Indian", "Thai", "Japanese", "Chinese", "Greek", "Other"
];

const restaurantTypes = [
  "Fast Casual", "Fine Dining", "Casual Dining", "Quick Service",
  "Bar/Pub", "Cafe", "Bakery", "Food Truck", "Catering"
];

export default function RestaurantOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Restaurant Basic Info
    restaurantName: "",
    description: "",
    cuisineType: "",
    restaurantType: "",
    address: "",
    phone: "",
    website: "",

    // Manager Info
    managerName: "",
    managerEmail: "",
    managerPhone: "",
    managerPosition: "",

    // Business Details
    operatingHours: {
      monday: { open: "09:00", close: "22:00", closed: false },
      tuesday: { open: "09:00", close: "22:00", closed: false },
      wednesday: { open: "09:00", close: "22:00", closed: false },
      thursday: { open: "09:00", close: "22:00", closed: false },
      friday: { open: "09:00", close: "23:00", closed: false },
      saturday: { open: "09:00", close: "23:00", closed: false },
      sunday: { open: "10:00", close: "21:00", closed: false }
    },
    teamSize: "",
    averageShiftsPerWeek: "",

    // Hiring Preferences
    preferredExperience: [] as string[],
    commonRoles: [] as string[],
    payRange: { min: 15, max: 25 },
    benefits: [] as string[]
  });

  const experienceLevels = [
    "Entry Level (0-1 years)",
    "Intermediate (2-5 years)",
    "Experienced (5+ years)",
    "Expert (10+ years)"
  ];

  const roles = [
    "Server", "Bartender", "Host/Hostess", "Busser",
    "Line Cook", "Dishwasher", "Barback", "Food Runner",
    "Kitchen Manager", "Sous Chef"
  ];

  const benefitOptions = [
    "Flexible Scheduling", "Tips", "Meal Discounts",
    "Professional Development", "Team Events", "Uniform Provided"
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).includes(item)
        ? (prev[field as keyof typeof prev] as string[]).filter((i: string) => i !== item)
        : [...(prev[field as keyof typeof prev] as string[]), item]
    }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log("Restaurant profile data:", formData);
    // TODO: Save to database/state management
    router.push("/restaurant/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-orange-600 h-2">
            <div
              className="bg-orange-400 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create Your Restaurant Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Step {step} of 4: {step === 1 ? "Restaurant Information" : step === 2 ? "Manager Details" : step === 3 ? "Business Operations" : "Hiring Preferences"}
              </p>
            </div>

            {/* Step 1: Restaurant Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      value={formData.restaurantName}
                      onChange={(e) => handleInputChange("restaurantName", e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter restaurant name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Full restaurant address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief description of your restaurant..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cuisine Type
                    </label>
                    <select
                      value={formData.cuisineType}
                      onChange={(e) => handleInputChange("cuisineType", e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select cuisine type</option>
                      {cuisineTypes.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Restaurant Type
                    </label>
                    <select
                      value={formData.restaurantType}
                      onChange={(e) => handleInputChange("restaurantType", e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select restaurant type</option>
                      {restaurantTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://yourrestaurant.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Manager Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Manager Name *
                    </label>
                    <input
                      type="text"
                      value={formData.managerName}
                      onChange={(e) => handleInputChange("managerName", e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position/Title *
                    </label>
                    <input
                      type="text"
                      value={formData.managerPosition}
                      onChange={(e) => handleInputChange("managerPosition", e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="General Manager, Owner, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.managerEmail}
                      onChange={(e) => handleInputChange("managerEmail", e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="manager@restaurant.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Direct Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.managerPhone}
                      onChange={(e) => handleInputChange("managerPhone", e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Manager's direct line"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Business Operations */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Team Size
                    </label>
                    <select
                      value={formData.teamSize}
                      onChange={(e) => handleInputChange("teamSize", e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select team size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-25">11-25 employees</option>
                      <option value="26-50">26-50 employees</option>
                      <option value="51+">51+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Average Shifts Per Week
                    </label>
                    <select
                      value={formData.averageShiftsPerWeek}
                      onChange={(e) => handleInputChange("averageShiftsPerWeek", e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select frequency</option>
                      <option value="1-3">1-3 shifts per week</option>
                      <option value="4-7">4-7 shifts per week</option>
                      <option value="8-15">8-15 shifts per week</option>
                      <option value="16+">16+ shifts per week</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Operating Hours
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(formData.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-4">
                        <div className="w-24">
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{day}</span>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hours.closed}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                operatingHours: {
                                  ...prev.operatingHours,
                                  [day]: { ...hours, closed: e.target.checked }
                                }
                              }));
                            }}
                            className="mr-2 h-4 w-4"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Closed</span>
                        </label>
                        {!hours.closed && (
                          <>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  operatingHours: {
                                    ...prev.operatingHours,
                                    [day]: { ...hours, open: e.target.value }
                                  }
                                }));
                              }}
                              className="p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => {
                                setFormData(prev => ({
                                  ...prev,
                                  operatingHours: {
                                    ...prev.operatingHours,
                                    [day]: { ...hours, close: e.target.value }
                                  }
                                }));
                              }}
                              className="p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Hiring Preferences */}
            {step === 4 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Pay Range (per hour)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">
                        Min: ${formData.payRange.min} - Max: ${formData.payRange.max}
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Minimum Rate</label>
                        <input
                          type="range"
                          min="10"
                          max="30"
                          value={formData.payRange.min}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            payRange: { ...prev.payRange, min: parseInt(e.target.value) }
                          }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400">Maximum Rate</label>
                        <input
                          type="range"
                          min="15"
                          max="40"
                          value={formData.payRange.max}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            payRange: { ...prev.payRange, max: parseInt(e.target.value) }
                          }))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Common Roles You Hire For
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {roles.map((role) => (
                      <label key={role} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.commonRoles.includes(role)}
                          onChange={() => handleArrayToggle("commonRoles", role)}
                          className="mr-3 h-4 w-4 text-orange-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Benefits & Perks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {benefitOptions.map((benefit) => (
                      <label key={benefit} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.benefits.includes(benefit)}
                          onChange={() => handleArrayToggle("benefits", benefit)}
                          className="mr-3 h-4 w-4 text-orange-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
              )}

              <div className="ml-auto">
                {step < 4 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Create Restaurant Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}