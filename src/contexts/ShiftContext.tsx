"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface WorkerApplication {
  workerId: string;
  workerName: string;
  appliedAt: string;
  status: "pending" | "accepted" | "declined";
  workerRating?: number;
  workerExperience?: string;
}

export interface ShiftAssignment {
  workerId: string;
  workerName: string;
  assignedAt: string;
  completed: boolean;
  completedAt?: string;
  restaurantRating?: number;
  workerRating?: number;
  restaurantComment?: string;
  workerComment?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: "restaurant" | "worker";
  message: string;
  timestamp: string;
}

export interface Shift {
  id: string;
  restaurantName: string;
  restaurantId: string;
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
  status: "draft" | "published" | "filled" | "cancelled" | "completed";
  createdAt: string;
  duration?: string;
  distance?: number;
  urgent?: boolean;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  applications: WorkerApplication[];
  assignment?: ShiftAssignment;
  chatMessages: ChatMessage[];
}

interface ShiftContextType {
  shifts: Shift[];
  addShift: (shift: Omit<Shift, 'id' | 'createdAt' | 'applicants' | 'applications' | 'chatMessages'>) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  getPublishedShifts: () => Shift[];
  applyToShift: (shiftId: string, workerId: string, workerName: string) => boolean;
  acceptApplication: (shiftId: string, workerId: string) => void;
  declineApplication: (shiftId: string, workerId: string) => void;
  addChatMessage: (shiftId: string, senderId: string, senderType: "restaurant" | "worker", message: string) => void;
  markShiftCompleted: (shiftId: string) => void;
  rateShift: (shiftId: string, raterType: "restaurant" | "worker", rating: number, comment?: string) => void;
  getShiftsByRestaurant: (restaurantId: string) => Shift[];
  getShiftsByWorker: (workerId: string) => Shift[];
  generateRandomShifts: (userLat: number, userLng: number) => void;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const useShifts = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShifts must be used within a ShiftProvider');
  }
  return context;
};

export const ShiftProvider = ({ children }: { children: ReactNode }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);

  const addShift = (shiftData: Omit<Shift, 'id' | 'createdAt' | 'applicants' | 'applications' | 'chatMessages'>) => {
    const newShift: Shift = {
      ...shiftData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      applicants: 0,
      applications: [],
      chatMessages: [],
      // Calculate duration
      duration: calculateDuration(shiftData.startTime, shiftData.endTime),
      // Default distance for new shifts (would be calculated based on worker's location and restaurant location)
      distance: shiftData.location ? Math.round(Math.random() * 5 + 1) : undefined,
      // Set urgent flag based on urgency level
      urgent: shiftData.urgencyLevel === "high" || shiftData.urgencyLevel === "critical",
      // Use provided location or undefined (will require location to be set when creating shift)
      location: shiftData.location
    };

    setShifts(prev => [...prev, newShift]);
  };

  const updateShift = (id: string, updates: Partial<Shift>) => {
    setShifts(prev => prev.map(shift =>
      shift.id === id
        ? {
            ...shift,
            ...updates,
            // Update urgent flag when urgency level changes
            urgent: updates.urgencyLevel
              ? (updates.urgencyLevel === "high" || updates.urgencyLevel === "critical")
              : shift.urgent
          }
        : shift
    ));
  };

  const deleteShift = (id: string) => {
    setShifts(prev => prev.filter(shift => shift.id !== id));
  };

  const getPublishedShifts = () => {
    return shifts.filter(shift => shift.published && shift.status === "published");
  };

  const applyToShift = (shiftId: string, workerId: string, workerName: string): boolean => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift || shift.status !== "published") return false;

    // Check if worker already applied
    if (shift.applications.some(app => app.workerId === workerId)) return false;

    const application: WorkerApplication = {
      workerId,
      workerName,
      appliedAt: new Date().toISOString(),
      status: "pending"
    };

    setShifts(prev => prev.map(s =>
      s.id === shiftId
        ? {
            ...s,
            applications: [...s.applications, application],
            applicants: s.applicants + 1
          }
        : s
    ));
    return true;
  };

  const acceptApplication = (shiftId: string, workerId: string) => {
    setShifts(prev => prev.map(shift =>
      shift.id === shiftId
        ? {
            ...shift,
            status: "filled" as const,
            applications: shift.applications.map(app =>
              app.workerId === workerId
                ? { ...app, status: "accepted" as const }
                : { ...app, status: "declined" as const }
            ),
            assignment: {
              workerId,
              workerName: shift.applications.find(app => app.workerId === workerId)?.workerName || "Unknown",
              assignedAt: new Date().toISOString(),
              completed: false
            }
          }
        : shift
    ));
  };

  const declineApplication = (shiftId: string, workerId: string) => {
    setShifts(prev => prev.map(shift =>
      shift.id === shiftId
        ? {
            ...shift,
            applications: shift.applications.map(app =>
              app.workerId === workerId
                ? { ...app, status: "declined" as const }
                : app
            )
          }
        : shift
    ));
  };

  const addChatMessage = (shiftId: string, senderId: string, senderType: "restaurant" | "worker", message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId,
      senderType,
      message,
      timestamp: new Date().toISOString()
    };

    setShifts(prev => prev.map(shift =>
      shift.id === shiftId
        ? { ...shift, chatMessages: [...shift.chatMessages, newMessage] }
        : shift
    ));
  };

  const markShiftCompleted = (shiftId: string) => {
    setShifts(prev => prev.map(shift =>
      shift.id === shiftId && shift.assignment
        ? {
            ...shift,
            status: "completed" as const,
            assignment: {
              ...shift.assignment,
              completed: true,
              completedAt: new Date().toISOString()
            }
          }
        : shift
    ));
  };

  const rateShift = (shiftId: string, raterType: "restaurant" | "worker", rating: number, comment?: string) => {
    setShifts(prev => prev.map(shift =>
      shift.id === shiftId && shift.assignment
        ? {
            ...shift,
            assignment: {
              ...shift.assignment,
              ...(raterType === "restaurant" ? {
                restaurantRating: rating,
                restaurantComment: comment
              } : {
                workerRating: rating,
                workerComment: comment
              })
            }
          }
        : shift
    ));
  };

  const getShiftsByRestaurant = (restaurantId: string) => {
    return shifts.filter(shift => shift.restaurantId === restaurantId);
  };

  const getShiftsByWorker = (workerId: string) => {
    return shifts.filter(shift =>
      shift.assignment?.workerId === workerId ||
      shift.applications.some(app => app.workerId === workerId)
    );
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    // Handle overnight shifts
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return `${diffHours} hours`;
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Generate a random location at a specific distance from a point
  const generateLocationAtDistance = (lat: number, lng: number, distanceMiles: number) => {
    const R = 3959; // Earth's radius in miles
    const randomAngle = Math.random() * 2 * Math.PI;

    const distanceRadians = distanceMiles / R;
    const latRadians = lat * Math.PI / 180;
    const lngRadians = lng * Math.PI / 180;

    const newLatRadians = Math.asin(
      Math.sin(latRadians) * Math.cos(distanceRadians) +
      Math.cos(latRadians) * Math.sin(distanceRadians) * Math.cos(randomAngle)
    );

    const newLngRadians = lngRadians + Math.atan2(
      Math.sin(randomAngle) * Math.sin(distanceRadians) * Math.cos(latRadians),
      Math.cos(distanceRadians) - Math.sin(latRadians) * Math.sin(newLatRadians)
    );

    return {
      lat: newLatRadians * 180 / Math.PI,
      lng: newLngRadians * 180 / Math.PI
    };
  };

  const generateRandomShifts = (userLat: number, userLng: number) => {
    const restaurantNames = [
      "The Blue Table", "Mario's Kitchen", "Sunset Bistro", "Harbor Grill",
      "Maple Street Cafe", "Golden Wok", "The Garden Room", "Riverside Tavern",
      "Corner Bakery", "Ocean View Restaurant"
    ];

    const roles = ["Server", "Bartender", "Dishwasher", "Line Cook", "Busser", "Host/Hostess"];
    const requirements = [
      ["Customer Service", "POS Systems"],
      ["Cocktail Making", "Wine Knowledge"],
      ["Food Safety Certification", "Cash Handling"],
      ["Team Leadership", "Multi-tasking"],
      ["Food Preparation", "Inventory Management"]
    ];

    const distances = [10, 20, 30];
    const newShifts: Shift[] = [];

    distances.forEach((targetDistance, index) => {
      const location = generateLocationAtDistance(userLat, userLng, targetDistance);
      const actualDistance = calculateDistance(userLat, userLng, location.lat, location.lng);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const role = roles[Math.floor(Math.random() * roles.length)];
      const hourlyRate = Math.floor(Math.random() * 10) + 15; // $15-$24
      const urgencyLevels: Array<"low" | "medium" | "high" | "critical"> = ["low", "medium", "high", "critical"];
      const urgencyLevel = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
      const urgent = urgencyLevel === "high" || urgencyLevel === "critical";

      const shift: Shift = {
        id: `generated_${Date.now()}_${index}`,
        restaurantName: restaurantNames[Math.floor(Math.random() * restaurantNames.length)],
        restaurantId: `rest_gen_${index}`,
        role,
        date: dateStr,
        startTime: "17:00",
        endTime: "23:00",
        hourlyRate,
        urgencyLevel,
        bonusPercentage: urgencyLevel === "critical" ? 30 : urgencyLevel === "high" ? 15 : urgencyLevel === "medium" ? 5 : 0,
        description: `${urgent ? "Urgent! " : ""}We need a ${role.toLowerCase()} for tomorrow's dinner service.`,
        requirements: requirements[Math.floor(Math.random() * requirements.length)],
        published: true,
        applicants: 0,
        status: "published",
        createdAt: new Date().toISOString().split('T')[0],
        duration: "6 hours",
        distance: Math.round(actualDistance * 10) / 10,
        urgent,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: `${Math.floor(Math.random() * 9000) + 1000} ${["Main", "Oak", "Maple", "Pine", "Cedar"][Math.floor(Math.random() * 5)]} St`
        },
        applications: [],
        chatMessages: []
      };

      newShifts.push(shift);
    });

    setShifts(prev => {
      // Remove old generated shifts and add new ones
      const nonGeneratedShifts = prev.filter(s => !s.id.startsWith('generated_'));
      return [...nonGeneratedShifts, ...newShifts];
    });
  };

  return (
    <ShiftContext.Provider value={{
      shifts,
      addShift,
      updateShift,
      deleteShift,
      getPublishedShifts,
      applyToShift,
      acceptApplication,
      declineApplication,
      addChatMessage,
      markShiftCompleted,
      rateShift,
      getShiftsByRestaurant,
      getShiftsByWorker,
      generateRandomShifts
    }}>
      {children}
    </ShiftContext.Provider>
  );
};