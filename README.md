# Grocery Price Tracker (In Development)

A full-stack Next.js application being developed to help shoppers track grocery prices over time.

<img width="1212" alt="app-3" src="https://github.com/user-attachments/assets/07207b93-23e0-4110-8cee-03be8ea14c68" />

## Table of Contents

- [Project Overview](#preview)
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

### Smart Receipt Scanner

- ML-powered receipt processing using Azure Document Intelligence
- Automatic extraction of merchant, date, and line items
- Interactive UI for reviewing and editing extracted items
- Bulk import of multiple grocery items in a single operation

View demo on <a href="https://youtu.be/Bprjsu2sJTI">YouTube</a>

### Powerful Data Management

- Advanced search with multi-term filtering across product names and brands
- Flexible view options (list individual items or group by product)
- Customizable sorting by price or date

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

[comment]: # "TODO: Add simple db diagram"

<details> 
  <summary>Full diagram: </summary>
  <img width="1141" alt="db" src="https://github.com/user-attachments/assets/6e7835dd-719f-4435-b752-cec0485a01bb" />
</details>

The database is designed with:

- **Normalized schema**: Properly separated concerns with distinct tables for users, product groups, and price points
- **Relation modeling**: Proper foreign key constraints with cascade rules
- **Performance optimization**: Strategic indexes on foreign keys and frequently queried fields

<div id="data"></div>

## Data Access

The application uses Next.js for data fetching and mutations:

- **Server Components**: For server-rendered data fetching directly from the database
- **Server Actions**: For form submissions and data mutations
- **NextAuth Routes**: For authentication flows

[comment]: # "- **Route Handler**: Limited API endpoints for client-side data fetching e.g., price history"

<div id="security"></div>

## Security

Security is implemented at multiple levels:

**Authentication & Authorization**

- **JWT-based authentication** with NextAuth.js
- **Multiple providers** including credentials and OAuth (Google)  
  <img width="400" alt="login" src="https://github.com/user-attachments/assets/4305e9ba-9537-46b1-a6b0-0b3f47b6704e" />
- **Password hashing** using bcrypt
- **Middleware** for optimistic checks, pre-filtering unauthorized users
- **Data Access Layer (DAL)** for centralizing data requests, and authentication and authorization logic

**Data & Request Validation**

- **Input validation** using Zod schema validation
- **CSRF protection** through Next.js server actions
- **XSS prevention** through React's built-in escaping

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
- Item management (adding items)
- Search and sorting capabilities

### In Progress

- Item management (editing and deleting items)
- Authentication through credentials (add email verification, rate limiting, password reset)
