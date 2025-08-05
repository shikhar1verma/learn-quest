# GrindQuest Application Architecture

This document outlines the technical architecture of GrindQuest, showing how different layers and components interact to create the gamified learning platform.

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer (Browser)"
        UI[React 18 + TypeScript]
        Router[React Router v6]
        State[TanStack Query]
        Theme[Tailwind + shadcn/ui]
        Auth[Auth Context]
    end
    
    subgraph "Build & Development"
        Vite[Vite Build Tool]
        ESLint[ESLint + TypeScript]
        PostCSS[PostCSS + Autoprefixer]
    end
    
    subgraph "Backend Services (Supabase)"
        Database[(PostgreSQL Database)]
        AuthService[Supabase Auth]
        Realtime[Real-time Subscriptions]
        Storage[File Storage]
        EdgeFunctions[Edge Functions]
    end
    
    subgraph "External Services"
        Email[Email Service]
        Analytics[Analytics]
        CDN[CDN/Hosting]
    end
    
    %% Client Layer Connections
    UI --> Router
    UI --> State
    UI --> Theme
    Router --> Auth
    State --> AuthService
    State --> Database
    
    %% Build Process
    Vite --> UI
    ESLint --> UI
    PostCSS --> Theme
    
    %% Backend Connections
    AuthService --> Database
    Realtime --> Database
    AuthService --> Email
    
    %% External Connections
    UI --> CDN
    Database --> Analytics
    
    %% Data Flow
    UI -.->|API Calls| Database
    Database -.->|Real-time Updates| UI
    AuthService -.->|Auth State| Auth
```

## Frontend Architecture

```mermaid
graph TB
    subgraph "React Application Structure"
        App[App.tsx]
        
        subgraph "Context Providers"
            QueryProvider[QueryClientProvider]
            AuthProvider[AuthProvider]
            TooltipProvider[TooltipProvider]
        end
        
        subgraph "Routing & Guards"
            BrowserRouter[BrowserRouter]
            ProtectedRoute[ProtectedRoute]
            AdminGuard[AdminGuard]
        end
        
        subgraph "Layout Components"
            AppLayout[AppLayout]
            AdminLayout[AdminLayout]
            AppSidebar[AppSidebar]
            TopBar[TopBar]
        end
        
        subgraph "Pages"
            Dashboard[Dashboard]
            Quests[Quests]
            Skills[Skills]
            Events[Events]
            Store[Store]
            Analytics[Analytics]
            AdminPages[Admin Pages]
        end
        
        subgraph "Shared Components"
            UIComponents[shadcn/ui Components]
            CustomComponents[Custom Components]
        end
        
        subgraph "Hooks & Services"
            CustomHooks[Custom Hooks]
            SupabaseClient[Supabase Client]
            XPEngine[XP Engine]
        end
    end
    
    %% Connections
    App --> QueryProvider
    QueryProvider --> AuthProvider
    AuthProvider --> TooltipProvider
    TooltipProvider --> BrowserRouter
    BrowserRouter --> ProtectedRoute
    ProtectedRoute --> AdminGuard
    AdminGuard --> AppLayout
    AdminGuard --> AdminLayout
    AppLayout --> Pages
    AdminLayout --> AdminPages
    Pages --> UIComponents
    Pages --> CustomHooks
    CustomHooks --> SupabaseClient
    CustomHooks --> XPEngine
```

## Tech Stack Details

### **Frontend Stack**

#### **Core Framework**
- **React 18**: Modern React with Concurrent Features
- **TypeScript**: Type safety and better developer experience
- **Vite**: Fast build tool and development server
- **React Router v6**: Client-side routing with nested routes

#### **State Management**
- **TanStack Query (React Query v5)**: Server state management
  - Caching, background updates, optimistic updates
  - Real-time synchronization with Supabase
- **React Context**: Auth state and global UI state
- **React Hook Form**: Form state management with validation

#### **UI & Styling**
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components built on Radix UI
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Modern icon library
- **Custom Design System**: Gaming-inspired theme with CSS variables

#### **Development Tools**
- **ESLint**: Code linting and formatting
- **TypeScript ESLint**: TypeScript-specific linting rules
- **PostCSS**: CSS processing with autoprefixer
- **React DevTools**: Development debugging

### **Backend Stack**

#### **Database & Backend**
- **Supabase**: Backend-as-a-Service platform
  - **PostgreSQL**: Relational database with JSON support
  - **Row Level Security (RLS)**: Database-level authorization
  - **Real-time subscriptions**: Live data updates
  - **Edge functions**: Server-side logic

#### **Authentication**
- **Supabase Auth**: Complete auth system
  - Email/password authentication
  - Session management
  - User management
  - Email verification

#### **Additional Services**
- **File Storage**: Profile pictures, evidence attachments
- **Email Service**: Transactional emails
- **Analytics**: Usage tracking and insights

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant TQ as TanStack Query
    participant SC as Supabase Client
    participant DB as PostgreSQL
    participant RT as Real-time
    
    %% Authentication Flow
    U->>UI: Login
    UI->>SC: signInWithPassword()
    SC->>DB: Authenticate user
    DB-->>SC: Auth response
    SC-->>UI: User session
    UI-->>U: Redirect to dashboard
    
    %% Data Fetching Flow
    UI->>TQ: useQuery hook
    TQ->>SC: Supabase query
    SC->>DB: SQL query
    DB-->>SC: Data response
    SC-->>TQ: Formatted data
    TQ-->>UI: Cached data
    UI-->>U: Rendered UI
    
    %% Real-time Updates
    DB->>RT: Data change trigger
    RT->>SC: Real-time event
    SC->>TQ: Invalidate cache
    TQ->>UI: Re-render with new data
    UI-->>U: Updated UI
    
    %% Mutation Flow
    U->>UI: Submit form
    UI->>TQ: useMutation hook
    TQ->>SC: Insert/Update query
    SC->>DB: Transaction
    DB-->>SC: Success/Error
    SC-->>TQ: Response
    TQ->>TQ: Invalidate related queries
    TQ-->>UI: Success feedback
    UI-->>U: Toast notification
```

## Component Architecture Patterns

### **Page Structure Pattern**
```
Page Component
├── Custom Hooks (data fetching)
├── Local State (UI state)
├── Event Handlers (mutations)
├── UI Components
│   ├── Cards/Containers
│   ├── Forms/Inputs
│   ├── Tables/Lists
│   └── Modals/Dialogs
└── Loading/Error States
```

### **Hook Pattern**
```
Custom Hook
├── useQuery (data fetching)
├── useMutation (data modification)
├── Error Handling
├── Loading States
└── Cache Management
```

### **Component Composition**
- **Compound Components**: Dialog, Select, Form components
- **Render Props**: Flexible component composition
- **Higher-Order Components**: Authentication guards
- **Custom Hooks**: Reusable logic

## Key Design Principles

### **Performance**
- **Code Splitting**: Dynamic imports for pages
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Optimized Queries**: Efficient database queries
- **Caching**: Aggressive caching with TanStack Query

### **Security**
- **Row Level Security**: Database-level access control
- **Type Safety**: TypeScript for compile-time safety
- **Input Validation**: Zod schemas for runtime validation
- **XSS Protection**: Proper data sanitization
- **CSRF Protection**: Supabase built-in protection

### **Scalability**
- **Modular Architecture**: Independent, reusable components
- **Database Functions**: Complex logic in PostgreSQL
- **Edge Functions**: Serverless scaling
- **CDN Integration**: Global content delivery
- **Real-time Optimization**: Efficient websocket usage

### **Developer Experience**
- **TypeScript**: Full type safety
- **Hot Reload**: Instant development feedback
- **Component Docs**: Self-documenting components
- **Consistent Patterns**: Standardized approaches
- **Error Boundaries**: Graceful error handling

## Deployment Architecture

```mermaid
graph LR
    subgraph "Development"
        Dev[Local Development]
        Vite[Vite Dev Server]
    end
    
    subgraph "Build Process"
        Build[npm run build]
        Dist[Static Files]
        Optimize[Asset Optimization]
    end
    
    subgraph "Production"
        CDN[CDN/Hosting]
        Edge[Edge Locations]
        Users[End Users]
    end
    
    subgraph "Backend"
        Supabase[Supabase Cloud]
        DB[(PostgreSQL)]
        Auth[Auth Service]
    end
    
    Dev --> Vite
    Dev --> Build
    Build --> Dist
    Dist --> Optimize
    Optimize --> CDN
    CDN --> Edge
    Edge --> Users
    Users --> Supabase
    Supabase --> DB
    Supabase --> Auth
```

This architecture provides a robust, scalable foundation for the gamified learning platform while maintaining excellent developer experience and performance. 