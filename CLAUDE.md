# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ShiftBnB is a Next.js 15 application that connects restaurants with workers for last-minute shift coverage. The application uses React 19, TypeScript, and Tailwind CSS v4.

## Development Commands

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production with Turbopack
- `npm start`: Start production server
- `npm run lint`: Run ESLint for code linting

## Architecture

### Application Structure
- **Next.js App Router**: Uses the modern app directory structure with route-based organization
- **TypeScript Configuration**: Strict TypeScript setup with path aliases (`@/*` → `./src/*`)
- **Styling**: Tailwind CSS v4 with PostCSS configuration
- **Fonts**: Geist Sans and Geist Mono fonts from next/font/google

### Key Routes and Pages
- `/` - Landing page with dual signup for workers and restaurants
- `/onboarding/worker` - Multi-step worker profile creation (4 steps: certifications/skills, roles, service area/availability, review)
- `/onboarding/restaurant` - Multi-step restaurant profile creation (4 steps: basic info, manager details, operations, hiring preferences)
- `/discover` - Worker dashboard for browsing and filtering available shifts
- `/restaurant/dashboard` - Restaurant dashboard for creating and managing shifts

### Data Models

#### Worker Profile Structure
```typescript
{
  selectedCertifications: string[],
  selectedSkills: string[],
  selectedRoles: string[],
  serviceRadius: number,
  experience: "entry" | "intermediate" | "experienced" | "expert",
  availability: { [day: string]: boolean }
}
```

#### Restaurant Profile Structure
```typescript
{
  restaurantName: string,
  description: string,
  cuisineType: string,
  restaurantType: string,
  address: string,
  operatingHours: { [day]: { open: string, close: string, closed: boolean } },
  payRange: { min: number, max: number },
  commonRoles: string[],
  benefits: string[]
}
```

#### Shift Structure
```typescript
{
  id: string,
  restaurantName: string,
  role: string,
  hourlyRate: number,
  duration: string,
  startTime: string,
  date: string,
  distance: number,
  urgent: boolean,
  description: string,
  requirements: string[],
  urgencyLevel: "low" | "medium" | "high" | "critical",
  bonusPercentage: number,
  status: "draft" | "published" | "filled" | "cancelled"
}
```

### UI/UX Patterns
- **Dark Mode Support**: All components support dark/light themes using Tailwind's dark: variants
- **Multi-step Forms**: Both onboarding flows use step-based navigation with progress bars
- **Modal Dialogs**: Used for shift creation and detail views
- **Responsive Design**: Mobile-first approach with responsive grid layouts
- **Interactive Filtering**: Real-time filtering on discover page with sliders and checkboxes

### State Management
- Currently uses React useState for local component state
- Form data is logged to console (placeholder for future backend integration)
- Mock data arrays are used throughout for development

## Development Notes

- The application uses Turbopack for faster builds and development
- ESLint is configured with Next.js recommended rules
- All TypeScript files use strict mode
- Component structure follows Next.js 15 conventions with 'use client' directives for interactive components
- CSS classes follow Tailwind utility-first approach with consistent spacing and color schemes