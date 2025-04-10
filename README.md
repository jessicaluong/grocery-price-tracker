# Grocery Price Tracker (In Development)

A full-stack Next.js application being developed to help shoppers track grocery prices over time.

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

### Comprehensive Price Tracking

- Interactive price history charts for data visualization using Recharts
- Automatic calculation of normalized price comparisons (\$/100g, \$/100mL)
- Support for multiple measurement units (weight, volume, count)
- Sale price flagging for spotting deals and discounts

https://github.com/user-attachments/assets/087fab49-9df2-4f6c-87d3-4ad6f9f62568

[comment]: # "![price-chart-demo](https://github.com/user-attachments/assets/12bc90d6-cc3d-44bd-8c7e-bc5992a75bc4)"

### Smart Receipt Scanner

- ML-powered receipt processing using Azure Document Intelligence
- Automatic extraction of merchant, date, and line items
- Interactive UI for reviewing and editing extracted items
- Bulk import of multiple grocery items in a single operation
- View demo on <a href="https://youtu.be/Bprjsu2sJTI">YouTube</a>

<img width="1220" alt="receipt-scanner" src="https://github.com/user-attachments/assets/41bce44d-7b73-4e59-889f-43614f7ca489" />

### Powerful Data Management

- Advanced search with multi-term filtering across product names and brands
- Flexible view options (list individual items or group by product)
- Customizable sorting by price or date

https://github.com/user-attachments/assets/15f69913-d63d-40c1-bd75-08e65bc1a01b

[comment]: # "![search-and-sort-demo](https://github.com/user-attachments/assets/869c667e-7b8c-42fa-a94b-0e4fda9dff86)"

<div id="tech"></div>

## Technologies Used

### Core

![Core tech](https://skillicons.dev/icons?i=nextjs,ts)

- **Next.js** for full-stack **React** development
- **TypeScript** for type-safe code across the entire application

### Frontend

![Frontend tech](https://skillicons.dev/icons?i=react,tailwind)

- **Shadcn** component library
- **Tailwind CSS** for styling and responsive design

### Backend

![Backend tech](https://skillicons.dev/icons?i=prisma,postgres)

- **PostgreSQL** for database
- **Prisma ORM** for type-safe database queries
- **NextAuth.js** for authentication

### Testing

![Testing tech](https://skillicons.dev/icons?i=jest)

- **Jest** for unit and integration testing
- **Playwright** for end-to-end testing

<div id="db"></div>

## Database Design

### Key tables include:

- **Group**: Product details (name, brand, store, etc.)
- **Item**: Price points with timestamps
- **User**: Account information and authentication
- Supporting tables for authentication

![db_simple](https://github.com/user-attachments/assets/7cba52d8-09f8-4c34-a0ec-0d4a2366df58)

<details> 
  <summary>View full diagram with supporting tables for authentication </summary>
  <img width="1141" alt="db" src="https://github.com/user-attachments/assets/6e7835dd-719f-4435-b752-cec0485a01bb" />
</details>

The database is designed with:

- **Normalized schema**: Properly separated concerns with distinct tables for users, product groups, and price points
- **Relation modeling**: Proper foreign key constraints with cascade rules
- **Performance optimization**: Strategic indexes on foreign keys and frequently queried fields

<div id="data"></div>

## Data Access

The application leverages Next.js 14's modern data access patterns:

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

- **JWT-based sessions**: Secure authentication managed by NextAuth.js
- **Multi-provider Support** Email/password (with bcrypt) and OAuth (Google)
  <img width="400" alt="login" src="https://github.com/user-attachments/assets/4305e9ba-9537-46b1-a6b0-0b3f47b6704e" />
- **Middleware** for optimistic checks, pre-filtering unauthorized users
- **Data Access Layer (DAL)** for centralizing data requests, and authentication and authorization logic

**Input Handling & Validation**

- **Schema Validation**: Type-safe request validation with Zod
- **Server Actions**: Inherent CSRF protection via Next.js architecture
- **Content Security**: React's automatic output encoding for XSS prevention
- **Error Boundaries**: Controlled error exposure preventing information leakage

<div id="test"></div>

## Testing Strategy

- **Unit testing**: Jest for testing complex components (e.g., forms) and utility functions
- **Integration testing**: Jest for verifying interactions with a real database (i.e., functions in data access layer)
- **End-to-end testing**: Playwright for testing user flows (e.g., logging in, adding an item, editing an item)

<div id="status"></div>

## Current Development Status

The application is under active development.

### Completed

- Core data model and database schema
- User authentication
- Complete item management (add, edit, delete)
- Group management for related items
- Search and sorting capabilities
- Historical price tracking with visualization in interactive price chart
- Receipt scanning with Azure Document Intelligence for adding multiple items

### In Progress

- Enhanced authentication (email verification, rate limiting)
- Password reset functionality
- Price chart enhancements (implementing 3-month view)
- Database-level filtering optimization for pagination
- Rate-limiting for third-party API requests
