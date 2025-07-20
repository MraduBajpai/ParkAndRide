# replit.md

## Overview

This is a comprehensive smart parking and ride-sharing application built with modern web technologies. The system provides users with the ability to find parking spots near metro stations, book parking spaces, and arrange last-mile transportation with QR code verification for seamless access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built as a Single Page Application (SPA) using:
- **React 18** with TypeScript for the user interface
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TailwindCSS** with **shadcn/ui** components for styling and UI components
- **TanStack Query** for server state management and API data fetching
- **React Hook Form** with **Zod** for form handling and validation
- **Vite** as the build tool and development server

The frontend follows a component-based architecture with:
- Page components for different routes (`/pages`)
- Reusable UI components (`/components/ui`)
- Feature-specific components (`/components/parking`, `/components/navigation`)
- Custom hooks for shared logic (`/hooks`)

### Backend Architecture
The server uses a Node.js/Express setup with:
- **Express.js** as the web framework
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Neon Database** (PostgreSQL) as the cloud database provider
- RESTful API design with clear endpoint structure

### Key Components

#### Database Layer
- **PostgreSQL** database hosted on Neon with Drizzle ORM
- Comprehensive schema including:
  - Users (authentication and profiles)
  - Parking stations and individual spots
  - Booking management for both parking and rides
  - System alerts and monitoring
- Database migrations managed through Drizzle Kit

#### API Layer
- RESTful endpoints for:
  - Parking station search and details (`/api/parking-stations`)
  - Booking management (`/api/bookings`)
  - QR code verification (`/api/qr/verify`)
  - User management and dashboard data
  - Admin analytics and system monitoring

#### Authentication & Authorization
- Session-based authentication (prepared for implementation)
- Role-based access control (user/admin roles)
- Secure API endpoints with proper middleware

### Data Flow

1. **User Journey**: Users search for parking → view available stations → book spots → receive QR codes → verify on-site
2. **Real-time Updates**: Parking availability updates through API polling
3. **Payment Processing**: Integrated payment flow (prepared for payment gateway integration)
4. **Admin Monitoring**: System alerts, analytics, and station management

### External Dependencies

#### Frontend Dependencies
- **@radix-ui/react-*** - Accessible UI primitives for complex components
- **@tanstack/react-query** - Server state management and caching
- **wouter** - Lightweight routing solution
- **tailwindcss** - Utility-first CSS framework
- **class-variance-authority** - Component variant management
- **date-fns** - Date manipulation utilities

#### Backend Dependencies
- **drizzle-orm** - Type-safe ORM for PostgreSQL
- **@neondatabase/serverless** - Neon database client
- **express** - Web application framework
- **zod** - Schema validation library

#### Development Tools
- **vite** - Fast build tool and dev server
- **typescript** - Type safety across the stack
- **tsx** - TypeScript execution for development
- **esbuild** - Fast JavaScript bundler for production

### Deployment Strategy

The application is designed for deployment on Replit with:
- **Development Mode**: Hot reloading with Vite middleware
- **Production Build**: Optimized client build with Express server
- **Database**: Neon PostgreSQL (serverless, auto-scaling)
- **Environment Variables**: Database URL and other secrets managed through Replit Secrets

#### Build Process
1. Client build: `vite build` creates optimized static assets
2. Server build: `esbuild` bundles the Express server
3. Production start: Serves static files and API from single process

#### Key Architectural Decisions

**Database Choice**: PostgreSQL with Drizzle ORM was chosen for its robust relational capabilities, especially important for managing complex relationships between users, bookings, parking spots, and payment records.

**Frontend State Management**: TanStack Query handles server state while keeping local state minimal, reducing complexity and improving performance through intelligent caching.

**Component Library**: shadcn/ui provides accessible, customizable components built on Radix UI primitives, ensuring good UX while maintaining design flexibility.

**Routing**: Wouter was chosen over React Router for its smaller bundle size and simpler API, suitable for this focused application.

**Real-time Features**: Currently using polling for updates, but architecture supports WebSocket integration for real-time parking availability updates.

The architecture prioritizes developer experience, type safety, and scalability while maintaining a clean separation of concerns between the client and server layers.