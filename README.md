# Grocery Price Tracker

A full-stack Next.js application developed to help shoppers track grocery prices over time.

<img width="1212" alt="app-3" src="https://github.com/user-attachments/assets/07207b93-23e0-4110-8cee-03be8ea14c68" />

## Table of Contents

- [Features](#features)
- [Technologies Used](#tech)
- [Database Design](#db)
- [Data Access](#data)
- [Security](#security)
- [Testing Strategy](#test)
- [Current Development Status](#status)

<div id="features"></div>

## Features

### Price Tracking and Comparison

- Interactive price history chart with different time frames and date navigation
- Calculates normalized prices for easy comparison (e.g., price per 100g, price per 100mL)
- Sale price flagging

https://github.com/user-attachments/assets/087fab49-9df2-4f6c-87d3-4ad6f9f62568

[comment]: # "![price-chart-demo](https://github.com/user-attachments/assets/12bc90d6-cc3d-44bd-8c7e-bc5992a75bc4)"

### Receipt Scanner

- ML-powered receipt processing using Azure Document Intelligence to extract merchant, date, and line items
- Interactive UI for reviewing and editing extracted items
- Add multiple grocery items to tracker at once
- View demo on <a href="https://youtu.be/Bprjsu2sJTI">YouTube</a>

<img width="1220" alt="receipt-scanner" src="https://github.com/user-attachments/assets/41bce44d-7b73-4e59-889f-43614f7ca489" />

### Data Management

- Search by product name and/or brand
- View items individually or group by product
- Sort by price or date

https://github.com/user-attachments/assets/15f69913-d63d-40c1-bd75-08e65bc1a01b

[comment]: # "![search-and-sort-demo](https://github.com/user-attachments/assets/869c667e-7b8c-42fa-a94b-0e4fda9dff86)"

<div id="tech"></div>

## Technologies Used

![tech](https://skillicons.dev/icons?i=nextjs,ts,react,tailwind,prisma,postgres,jest)

### Core

- **Next.js** for full-stack **React** development
- **TypeScript** for type-safe code across the entire application

### Frontend

- **Shadcn** component library
- **Tailwind CSS** for styling and responsive design

### Backend

- **PostgreSQL** for database
- **Prisma ORM** for type-safe database queries
- **NextAuth.js** for authentication

### Testing

- **Jest** for unit and integration testing
- **Playwright** for end-to-end testing

<div id="db"></div>

## Database Design

### Key tables include:

- **Group**: Product details (name, brand, store, etc.)
- **Item**: Price points with timestamps
- **User**: Account information and authentication
- Supporting tables for authentication (not shown)

![db_simple](https://github.com/user-attachments/assets/7cba52d8-09f8-4c34-a0ec-0d4a2366df58)

The database is designed with:

- **Normalized schema**: Properly separated concerns with distinct tables for users, product groups, and price points
- **Relation modeling**: Proper foreign key constraints with cascade rules
- **Performance optimization**: Strategic indexes on foreign keys and frequently queried fields

<div id="data"></div>

## Data Access

The application uses Next.js data access patterns:

- **Server Components**: Fetch data directly from the database for efficient server-rendered content
- **Server Actions**: Handle form submissions and data mutations securely on the server, preventing direct client access to the database
- **Route Handler**: Limited API endpoints for client-side data fetching (e.g., price history)
- **React Query**: Manage client-side data fetching, caching, and synchronization for dynamic UI updates
- **NextAuth Integration**: Secure authentication with protected routes and session validation
- **External API Integration**: Access Azure Document Intelligence for receipt scanning via secure server actions

<div id="security"></div>

## Security

Security is implemented at multiple levels:

**Authentication & Authorization**

![login2](https://github.com/user-attachments/assets/0df6b13d-e6ca-434c-8eac-7b903eab8576)

- **Authentication**: Secure sign-in with Google (OAuth) and JWT-based sessions via NextAuth.js
- **Middleware** for optimistic checks, pre-filtering unauthorized users
- **Data Access Layer** for centralizing data requests, and authentication and authorization logic

**Input Handling & Validation**

- **Schema Validation**: Type-safe request validation with Zod
- **Error Boundaries**: Controlled error exposure preventing information leakage

## External Services & Resource Management

### Azure AI Document Intelligence

- **Usage Quotas**: Implemented daily and monthly limits (5 scans per day per user, 450 scans per month for all users) to control usage of the external service
- **Database Tracking**: Used a database model to track scan usage

<div id="test"></div>

## Testing Strategy

- **Unit testing**: Jest for testing complex components (e.g., forms) and utility functions
- **Integration testing**: Jest for verifying interactions with a real database (i.e., functions in data access layer)
- **End-to-end testing**: Playwright for testing user flows (e.g., adding an item)

<div id="status"></div>

## Current Development Status

The application is under active development.

### Completed

- Core data model and database schema
- User authentication with OAuth Provider (Google)
- Credentials Provider used for testing and development only
- Complete item and group management (add, edit, delete)
- Search and sorting capabilities
- Interactive price chart with different time frames and date navigation
- Receipt scanning with Azure Document Intelligence for adding multiple items
- Rate limiting for Azure

### In Progress

- Demo mode with limited functionality
- Deploy on Vercel
- Finish E2E tests

### Future Enhancements

- Database-level filtering optimization for pagination
- Make manually adding grocery items easier by pooling grocery items from all users (name, brand, quantity, amount only) and integrating third party API for auto-complete
