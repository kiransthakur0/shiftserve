"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const certifications = [
  "Food Safety Certification",
  "Alcohol Service Certification",
  "CPR Certified",
  "First Aid Certified",
  "ServSafe Certified",
  "TIPS Certified",
  "Allergen Awareness",
  "Cash Handling Experience"
];

const skills = [
  "POS Systems",
  "Wine Knowledge",
  "Cocktail Making",
  "Customer Service",
  "Team Leadership",
  "Inventory Management",
  "Food Preparation",
  "Multi-tasking",
  "Communication",
  "Problem Solving"
];

const roles = [
  { id: "bartender", label: "Bartender", description: "Mix drinks and serve customers at the bar" },
  { id: "server", label: "Server", description: "Take orders and serve food to restaurant guests" },
  { id: "dishwasher", label: "Dishwasher", description: "Clean dishes, utensils, and kitchen equipment" },
  { id: "host", label: "Host/Hostess", description: "Greet guests and manage seating arrangements" },
  { id: "busser", label: "Busser", description: "Clear and set tables, assist servers" },
  { id: "cook", label: "Line Cook", description: "Prepare food items in the kitchen" },
  { id: "barback", label: "Barback", description: "Support bartenders with supplies and cleaning" },
  { id: "runner", label: "Food Runner", description: "Deliver food from kitchen to tables" }
];

export default function WorkerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    selectedCertifications: [] as string[],
    selectedSkills: [] as string[],
    selectedRoles: [] as string[],
    serviceRadius: 10,
    experience: "",
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();

      // Try multiple times to get the user session (it might take a moment after signup)
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          console.log('User authenticated in onboarding:', user.id);
          return; // User is authenticated, stop checking
        }

        // Wait 500ms before trying again
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      // If we still don't have a user after all attempts, redirect to signup
      console.error('No user found after multiple attempts');
      router.push('/auth/signup?type=worker');
    };

    checkAuth();
  }, [router]);

  const handleCertificationToggle = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCertifications: prev.selectedCertifications.includes(cert)
        ? prev.selectedCertifications.filter(c => c !== cert)
        : [...prev.selectedCertifications, cert]
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleId)
        ? prev.selectedRoles.filter(r => r !== roleId)
        : [...prev.selectedRoles, roleId]
    }));
  };

  const handleAvailabilityToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: !prev.availability[day as keyof typeof prev.availability]
      }
    }));
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get the current user (check again in case userId state isn't set)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("User not authenticated. Please log in again.");
        setLoading(false);
        setTimeout(() => router.push('/auth/login?type=worker'), 2000);
        return;
      }

      console.log('Submitting worker profile for user:', user.id);

      // Insert worker profile
      const { error: insertError } = await supabase
        .from('worker_profiles')
        .insert({
          user_id: user.id,
          certifications: formData.selectedCertifications,
          skills: formData.selectedSkills,
          roles: formData.selectedRoles,
          service_radius: formData.serviceRadius,
          experience: formData.experience,
          availability: formData.availability,
        });

      if (insertError) {
        console.error('Error inserting worker profile:', insertError);
        throw insertError;
      }

      console.log('Worker profile saved successfully');
      // Use hard navigation to ensure session is maintained
      window.location.href = "/discover";
    } catch (err: unknown) {
      console.error('Profile submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-blue-600 h-2">
            <div
              className="bg-blue-400 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create Your Worker Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Step {step} of 4: {step === 1 ? "Certifications & Skills" : step === 2 ? "Preferred Roles" : step === 3 ? "Service Area & Availability" : "Review & Submit"}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Certifications & Skills */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Select Your Certifications
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {certifications.map((cert) => (
                      <label key={cert} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedCertifications.includes(cert)}
                          onChange={() => handleCertificationToggle(cert)}
                          className="mr-3 h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Select Your Skills
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {skills.map((skill) => (
                      <label key={skill} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.selectedSkills.includes(skill)}
                          onChange={() => handleSkillToggle(skill)}
                          className="mr-3 h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Preferred Roles */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Select Your Preferred Roles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      onClick={() => handleRoleToggle(role.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.selectedRoles.includes(role.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {role.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {role.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Service Area & Availability */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Service Radius
                  </h2>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-gray-700 dark:text-gray-300 mb-2 block">
                        How far are you willing to travel? ({formData.serviceRadius} miles)
                      </span>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={formData.serviceRadius}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceRadius: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>1 mile</span>
                        <span>50 miles</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    General Availability
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(formData.availability).map(([day, available]) => (
                      <label key={day} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={available}
                          onChange={() => handleAvailabilityToggle(day)}
                          className="mr-3 h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Experience Level
                  </h2>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select experience level</option>
                    <option value="entry">Entry Level (0-1 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="experienced">Experienced (5+ years)</option>
                    <option value="expert">Expert (10+ years)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Review Your Profile
                </h2>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Certifications ({formData.selectedCertifications.length})</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {formData.selectedCertifications.length > 0 ? formData.selectedCertifications.join(", ") : "None selected"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Skills ({formData.selectedSkills.length})</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {formData.selectedSkills.length > 0 ? formData.selectedSkills.join(", ") : "None selected"}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Preferred Roles ({formData.selectedRoles.length})</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {formData.selectedRoles.length > 0
                      ? formData.selectedRoles.map(roleId => roles.find(r => r.id === roleId)?.label).join(", ")
                      : "None selected"
                    }
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Service Details</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Radius: {formData.serviceRadius} miles | Experience: {formData.experience || "Not specified"}
                  </p>
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
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                  >
                    {loading ? 'Saving Profile...' : 'Complete Profile'}
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