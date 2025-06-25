# UBS Swiss Digital Banking Platform

## Overview

This is a full-stack banking application built with Express.js, React, TypeScript, and PostgreSQL. The platform provides secure digital banking services including account management, transactions, and administrative features. It uses modern technologies like Drizzle ORM for database operations, Radix UI for components, and Firebase for authentication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom UBS brand colors
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Auth integration
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Pooled connections via @neondatabase/serverless

## Key Components

### Database Schema (shared/schema.ts)
- **Users**: Account holders with approval workflow and UBS ID system
- **Accounts**: Multiple account types (current, savings, business, treasury)
- **Transactions**: Credit/debit/transfer operations with admin approval
- **Notifications**: System messaging for users
- **Support Chats**: Customer service integration

### Authentication System
- Firebase Authentication for secure login/registration
- Role-based access (admin vs regular users)
- Session management with PIN verification for sensitive operations
- Account approval workflow for new registrations

### User Interface Components
- Responsive design with mobile-first approach
- Banking-themed UI with UBS brand colors (red #DC2626, gold)
- Modular component architecture using Radix UI
- Dark/light theme support
- Accessibility-compliant components

### Administrative Features
- Admin dashboard for user management
- Transaction approval system
- User fund management capabilities
- Account status controls (freeze/unfreeze)

## Data Flow

1. **User Registration**: Firebase Auth → Backend validation → Database storage → Approval workflow
2. **Authentication**: Firebase Auth → Session creation → Role verification
3. **Account Operations**: PIN verification → Database transaction → Real-time updates
4. **Transactions**: User initiation → Admin approval → Balance updates → Notifications
5. **Admin Actions**: Permission checks → Database operations → Audit logging

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm and drizzle-kit for database operations
- **Authentication**: Firebase SDK for user management
- **UI Framework**: Radix UI components for accessible interface
- **Styling**: Tailwind CSS for responsive design
- **State Management**: TanStack Query for server synchronization

### Development Tools
- **Build**: Vite with React plugin and runtime error overlay
- **TypeScript**: Strict mode with path mapping
- **Linting**: ESBuild for production bundling
- **Development**: TSX for TypeScript execution

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Vite dev server with HMR
- **Database**: PostgreSQL module in Replit
- **Port**: Development server on port 5000

### Production Build
- **Frontend**: Vite build to dist/public directory
- **Backend**: ESBuild bundle to dist/index.js
- **Deployment**: Replit autoscale deployment target
- **Environment**: Production NODE_ENV with optimizations

### Environment Configuration
- **Database URL**: Required DATABASE_URL environment variable
- **Firebase Config**: Embedded Firebase project configuration
- **Session Security**: PostgreSQL session store for scalability

## Changelog

```
Changelog:
- June 25, 2025. Initial setup with Express.js backend and React frontend
- June 25, 2025. Firebase/Firestore integration implementation
- June 25, 2025. Authentication system with email/password and admin approval workflow
- June 25, 2025. Banking features: account management, transactions, admin dashboard
- June 25, 2025. UBS brand theming and responsive UI components
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```