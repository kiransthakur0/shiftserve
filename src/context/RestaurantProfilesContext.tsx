'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface RestaurantProfile {
  id: string;
  restaurantName: string;
  address: string;
  location?: {
    lat: number;
    lng: number;
    displayName?: string;
  };
  cuisineType?: string;
  description?: string;
  operatingHours?: { [day: string]: { open: string; close: string; closed: boolean } };
}

interface RestaurantProfilesContextType {
  profiles: RestaurantProfile[];
  addProfile: (profile: RestaurantProfile) => void;
  updateProfile: (id: string, updates: Partial<RestaurantProfile>) => void;
  deleteProfile: (id: string) => void;
  getProfile: (id: string) => RestaurantProfile | undefined;
  getProfilesWithLocation: () => RestaurantProfile[];
}

const RestaurantProfilesContext = createContext<RestaurantProfilesContextType | undefined>(undefined);

export function RestaurantProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<RestaurantProfile[]>([]);

  const addProfile = (profile: RestaurantProfile) => {
    setProfiles((prev) => {
      // Replace if exists, otherwise add
      const exists = prev.find(p => p.id === profile.id);
      if (exists) {
        return prev.map(p => p.id === profile.id ? profile : p);
      }
      return [...prev, profile];
    });
  };

  const updateProfile = (id: string, updates: Partial<RestaurantProfile>) => {
    setProfiles((prev) =>
      prev.map((profile) => (profile.id === id ? { ...profile, ...updates } : profile))
    );
  };

  const deleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((profile) => profile.id !== id));
  };

  const getProfile = (id: string) => {
    return profiles.find(p => p.id === id);
  };

  const getProfilesWithLocation = () => {
    return profiles.filter(p => p.location && p.location.lat && p.location.lng);
  };

  return (
    <RestaurantProfilesContext.Provider
      value={{ profiles, addProfile, updateProfile, deleteProfile, getProfile, getProfilesWithLocation }}
    >
      {children}
    </RestaurantProfilesContext.Provider>
  );
}

export function useRestaurantProfiles() {
  const context = useContext(RestaurantProfilesContext);
  if (context === undefined) {
    throw new Error('useRestaurantProfiles must be used within a RestaurantProfilesProvider');
  }
  return context;
}
