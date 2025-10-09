'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Shift {
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
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  bonusPercentage: number;
  status: 'draft' | 'published' | 'filled' | 'cancelled';
  address?: string;
  cuisineType?: string;
  location?: {
    address: string;
    lat?: number;
    lng?: number;
  };
  applications?: Array<{
    workerId: string;
    workerName: string;
    appliedAt: string;
    status: 'pending' | 'accepted' | 'declined';
  }>;
}

interface ShiftsContextType {
  shifts: Shift[];
  addShift: (shift: Shift) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  getPublishedShifts: () => Shift[];
}

const ShiftsContext = createContext<ShiftsContextType | undefined>(undefined);

export function ShiftsProvider({ children }: { children: ReactNode }) {
  const [shifts, setShifts] = useState<Shift[]>([]);

  const addShift = (shift: Shift) => {
    setShifts((prev) => [...prev, shift]);
  };

  const updateShift = (id: string, updates: Partial<Shift>) => {
    setShifts((prev) =>
      prev.map((shift) => (shift.id === id ? { ...shift, ...updates } : shift))
    );
  };

  const deleteShift = (id: string) => {
    setShifts((prev) => prev.filter((shift) => shift.id !== id));
  };

  const getPublishedShifts = () => {
    return shifts.filter((shift) => shift.status === 'published');
  };

  return (
    <ShiftsContext.Provider
      value={{ shifts, addShift, updateShift, deleteShift, getPublishedShifts }}
    >
      {children}
    </ShiftsContext.Provider>
  );
}

export function useShifts() {
  const context = useContext(ShiftsContext);
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftsProvider');
  }
  return context;
}
