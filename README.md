# Grocery Price Tracker (In Development)

A full-stack Next.js application being developed to help shoppers track grocery prices over time.

![app](https://github.com/user-attachments/assets/77a2c533-cf29-4991-8229-69269b8ded59)

## Table of Contents

- [Project Overview](#preview)
- [Technologies Used](#tech)
- [Database Design](#db)
- [Data Access](#data)
- [Security](#security)
- [Testing Strategy](#tests)
- [Current Development Status](#status)

<div id="preview"></div>

## Project Overview

This application aims to help users determine if grocery prices represent good value by providing historical prices for an item. The application allows users to:

- Track prices across different stores, brands, and product sizes
- Compare unit pricing for better value assessment
- Search and sort products with responsive UI

[comment]: # "insert image of data table"

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
- **Prisma ORM** for type-safe database queries and database schema management
- **NextAuth.js** for authentication

### Testing

![Testing tech](https://skillicons.dev/icons?i=jest)

- **Jest** for unit and integration testing
- **Playwright** for end-to-end testing

<div id="db"></div>

## Database Design

[comment]: # "insert image of database schema"

The database is designed with:

- Normalized schema: Optimized for complex querying and analysis
- Relation modeling: Proper foreign key constraints and indexes
- Migration management: Version-controlled schema changes

### Key tables include:

- User: Account information and authentication
- Group: Product details (name, brand, store, etc.)
- Item: Price points with timestamps
- Supporting tables for authentication

<div id="data access"></div>

## Data Access

The application uses Next.js for data fetching and mutations:

- **Server Components**: For server-rendered data fetching directly from the database
- **Server Actions**: For form submissions and data mutations

[comment]: # "- **Route Handler**: Limited API endpoints for client-side data fetching e.g., price history"

<div id="security"></div>

## Security

Security is implemented at multiple levels:

- JWT-based authentication with NextAuth.js
- Multiple providers including credentials and OAuth (Google)
- Authentication and authorization checks on all data access functions
- Middleware protection for secured routes
- Password hashing using bcrypt

[comment]: # "- CSRF protection through Next.js server actions"

<div id="test"></div>

## Testing Strategy

- **Unit testing**: Jest for testing complex components (e.g., forms) and utility functions
- **Integration testing**: Jest for verifying interactions with a real database (i.e., functions in data access layer)
- **End-to-end testing**: Playwright for testing user flows (e.g., logging in, adding an item, editing an item)

<div id="status"></div>

## Current Development Status

The application is under active development.

### Completed

- Item management: adding an item
- View items: filter items (search), group items or display them individually
- Authentication through Google account and credentials (basic)

### In Progress

- Item management: editing and deleting items
- Authentication through credentials (add email verification, rate limiting, password reset)

### Possible Future Enhancements

- Receipt scanning with computer vision
- Product image integration via public APIs
