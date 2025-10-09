import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ShiftProvider } from "../contexts/ShiftContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import { RestaurantProfilesProvider } from "../context/RestaurantProfilesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShiftServe",
  description: "Connect restaurants with last-minute shift coverage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProfileProvider>
          <RestaurantProfilesProvider>
            <ShiftProvider>
              {children}
            </ShiftProvider>
          </RestaurantProfilesProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
