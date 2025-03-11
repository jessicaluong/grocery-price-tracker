# Grocery Price Tracker (In Development)

A full-stack Next.js application being developed to help shoppers track grocery prices over time.

<img width="1212" alt="app-2" src="https://github.com/user-attachments/assets/125cd889-3fab-4c8c-9701-221d75573aec" />

## Table of Contents

- [Project Overview](#preview)
- [Technologies Used](#tech)
- [Database Design](#db)
- [Data Access](#data)
- [Security](#security)
- [Testing Strategy](#test)
- [Current Development Status](#status)

<div id="preview"></div>

## Project Overview

This application aims to help users determine if grocery prices represent good value by providing historical prices for an item. 

  <img width="450" alt="price-table" src="https://github.com/user-attachments/assets/0dbfe3af-2c6b-4d41-a6f8-6c2699f86191" />  

The application allows users to:
- Track prices across different stores, brands, and product sizes
- Compare unit pricing for better value assessment
- Search for and sort products

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

<img width="1141" alt="db" src="https://github.com/user-attachments/assets/6e7835dd-719f-4435-b752-cec0485a01bb" />

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
- **Authentication and authorization** checks on data access functions
- **Middleware protection** for secured routes
- **Password hashing** using bcrypt

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

### Possible Future Enhancements

- Receipt scanning with computer vision
- Product image integration via public APIs
