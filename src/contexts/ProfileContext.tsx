"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useShifts } from "./ShiftContext";

export interface Profile {
  id: string;
  name: string;
  type: "restaurant" | "worker";
  averageRating: number;
  totalRatings: number;
  ratings: {
    rating: number;
    comment?: string;
    fromId: string;
    fromName: string;
    shiftId: string;
    date: string;
  }[];
}

interface ProfileContextType {
  profiles: Profile[];
  getProfile: (id: string) => Profile | undefined;
  updateProfileRatings: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfiles = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfiles must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { shifts } = useShifts();
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: "rest_1",
      name: "The Blue Table",
      type: "restaurant",
      averageRating: 0,
      totalRatings: 0,
      ratings: []
    },
    {
      id: "rest_2",
      name: "Mario's Kitchen",
      type: "restaurant",
      averageRating: 0,
      totalRatings: 0,
      ratings: []
    },
    {
      id: "rest_current",
      name: "Your Restaurant",
      type: "restaurant",
      averageRating: 0,
      totalRatings: 0,
      ratings: []
    },
    {
      id: "worker_1",
      name: "John Doe",
      type: "worker",
      averageRating: 0,
      totalRatings: 0,
      ratings: []
    }
  ]);

  const updateProfileRatings = () => {
    const updatedProfiles = profiles.map(profile => {
      const newRatings: Profile['ratings'] = [];
      let totalRating = 0;
      let ratingCount = 0;

      // Collect ratings from completed shifts
      shifts.forEach(shift => {
        if (shift.assignment && shift.assignment.completed) {
          if (profile.type === "restaurant" && shift.restaurantId === profile.id) {
            // Restaurant being rated by worker
            if (shift.assignment.workerRating) {
              newRatings.push({
                rating: shift.assignment.workerRating,
                comment: shift.assignment.workerComment,
                fromId: shift.assignment.workerId,
                fromName: shift.assignment.workerName,
                shiftId: shift.id,
                date: shift.assignment.completedAt!
              });
              totalRating += shift.assignment.workerRating;
              ratingCount++;
            }
          } else if (profile.type === "worker" && shift.assignment.workerId === profile.id) {
            // Worker being rated by restaurant
            if (shift.assignment.restaurantRating) {
              newRatings.push({
                rating: shift.assignment.restaurantRating,
                comment: shift.assignment.restaurantComment,
                fromId: shift.restaurantId,
                fromName: shift.restaurantName,
                shiftId: shift.id,
                date: shift.assignment.completedAt!
              });
              totalRating += shift.assignment.restaurantRating;
              ratingCount++;
            }
          }
        }
      });

      return {
        ...profile,
        ratings: newRatings,
        totalRatings: ratingCount,
        averageRating: ratingCount > 0 ? Math.round((totalRating / ratingCount) * 10) / 10 : 0
      };
    });

    setProfiles(updatedProfiles);
  };

  const getProfile = (id: string) => {
    return profiles.find(profile => profile.id === id);
  };

  // Update profile ratings whenever shifts change
  useEffect(() => {
    updateProfileRatings();
  }, [shifts]);

  return (
    <ProfileContext.Provider value={{
      profiles,
      getProfile,
      updateProfileRatings
    }}>
      {children}
    </ProfileContext.Provider>
  );
};