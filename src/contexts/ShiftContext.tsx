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
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: "1",
      restaurantName: "The Blue Table",
      restaurantId: "rest_1",
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
      applicants: 0,
      status: "published",
      createdAt: "2024-09-23",
      duration: "6 hours",
      distance: 2.3,
      urgent: true,
      location: { lat: 40.7128, lng: -74.0060, address: "123 Main St, Downtown" },
      applications: [],
      chatMessages: []
    },
    {
      id: "2",
      restaurantName: "Mario's Kitchen",
      restaurantId: "rest_2",
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
      applicants: 0,
      status: "published",
      createdAt: "2024-09-22",
      duration: "8 hours",
      distance: 1.8,
      urgent: false,
      location: { lat: 40.7589, lng: -73.9851, address: "456 Broadway, Midtown" },
      applications: [],
      chatMessages: []
    }
  ]);

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
      // Default distance for new shifts (would be calculated based on restaurant location)
      distance: Math.round(Math.random() * 5 + 1),
      // Set urgent flag based on urgency level
      urgent: shiftData.urgencyLevel === "high" || shiftData.urgencyLevel === "critical",
      // Default location (would be set based on restaurant profile)
      location: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
        address: `${Math.floor(Math.random() * 999) + 100} Random St, NYC`
      }
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
      getShiftsByWorker
    }}>
      {children}
    </ShiftContext.Provider>
  );
};