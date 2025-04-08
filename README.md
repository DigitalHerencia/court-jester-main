
# <p align="center">Court⚖️Jester</p>    

<p align="center">
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-15-blue.svg" alt="Next.js" />
  </a>
  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/React-19-blue.svg" alt="React" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind%20CSS-4-green.svg" alt="Tailwind CSS" />
  </a>
  <a href="https://www.framer.com/motion/">
    <img src="https://img.shields.io/badge/Framer%20Motion-12-purple.svg" alt="Framer Motion" />
  </a>
</p>

<p align="center">
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/Node.js-14-green.svg" alt="Node.js" />
  </a>
  <a href="https://vercel.com/">
    <img src="https://img.shields.io/badge/Vercel-Deployment-black.svg" alt="Vercel" />
  </a>
  <a href="https://www.mongodb.com/">
    <img src="https://img.shields.io/badge/MongoDB-Database-green.svg" alt="MongoDB" />
  </a>
</p>


Court Jester is a modern, full-stack legal management platform that streamlines offender case management, notifications, motions, and more. Built with cutting-edge technologies, Court Jester delivers a seamless experience for legal teams and offenders alike.

---
![Home](https://raw.githubusercontent.com/DigitalHerencia/court-jester-main/refs/heads/feat/dashboard/offender-cases/public/icons/homepage.png)

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Architecture](#architecture)
* [Getting Started](#getting-started)
* [API Documentation](#api-documentation)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

---

## Overview

Court Jester automates legal workflows—from managing offender profiles and cases to handling notifications and motion submissions. With a modular, scalable architecture, this project is built for performance and maintainability using Next.js, React, TypeScript, and Vercel.

---

## Features

* <i class="fa fa-tachometer" aria-hidden="true"></i> **Admin Dashboard**: Manage notifications, offenders, cases, motions, and reminders with a sleek, user-friendly interface.
* <i class="fa fa-user-circle" aria-hidden="true"></i> **Offender Portal**: Secure access for offenders to view their profiles, cases, and receive timely notifications.
* <i class="fa fa-plug" aria-hidden="true"></i> **Dynamic API Endpoints**: RESTful endpoints covering all CRUD operations for legal entities such as cases, motions, and notifications.
* <i class="fa fa-clock-o" aria-hidden="true"></i> **Real-time Data**: Utilize Next.js server actions and API routes for seamless, real-time updates.
* <i class="fa fa-shield" aria-hidden="true"></i> **Comprehensive Type System**: Leverage TypeScript to ensure robust type safety across all modules—from data models to component props.
* <i class="fa fa-magic" aria-hidden="true"></i> **Modern UX**: Responsive design, intuitive interactions, and smooth animations (powered by Framer Motion) make for an outstanding user experience.

---

<p align="center" style="font-size: 100px;">🃏</p>


---

## Tech Stack

* 🚀 **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion
* 🔧 **Backend**: Node.js, Next.js API routes, Vercel Blob Storage
* 🗄️ **Database**: MongoDB with a well-defined TypeScript model layer (Offender, Case, Motion, Notification, Reminder)
* 🔐 **Authentication**: Clerk for secure, reliable session management
* ☁️ **Deployment**: Vercel for effortless scaling and deployments

---

## Architecture

Court Jester embraces a modular, hybrid architecture with a clear separation between client and server logic:

* <i class="fa fa-user-circle" aria-hidden="true"></i> **Admin & Offender Dashboards**: Two distinct portals designed for administrators and offenders, respectively, each with its own set of tailored features.
* <i class="fa fa-plug" aria-hidden="true"></i> **API Endpoints**: A rich set of RESTful endpoints to handle operations for offenders, cases, motions, notifications, and reminders. (See the API Documentation for details.)
* <i class="fa fa-file-code-o" aria-hidden="true"></i> **Type-Driven Development**: An extensive TypeScript type system ensures consistency and type safety across the application, as detailed in the comprehensive type system documentation.
* <i class="fa fa-cogs" aria-hidden="true"></i> **Modern Development Practices**: Optimized for CI/CD workflows, efficient API performance, and secure authentication.

--- 

#### <p align="center">Code<i class="fa fa-balance-scale" aria-hidden="true"></i>Visualization</p>    

```mermaid
graph TB
    User((User))
    Admin((Admin))

    subgraph "Frontend Container"
        NextApp["Next.js Application<br>(Next.js)"]
        
        subgraph "Frontend Components"
            AuthComponent["Authentication<br>(JWT)"]
            UIComponents["UI Components<br>(React/Shadcn)"]
            MotionEditor["Motion Editor<br>(Monaco Editor)"]
            ReminderComponent["Reminder Management<br>(React)"]
            HelpSystem["Help System<br>(React)"]
            DocumentProcessor["Document Processing<br>(React)"]
        end
    end

    subgraph "Backend Container"
        APILayer["API Routes<br>(Next.js API)"]
        
        subgraph "API Components"
            AuthService["Auth Service<br>(JWT)"]
            CaseService["Case Service<br>(Node.js)"]
            MotionService["Motion Service<br>(Node.js)"]
            NotificationService["Notification Service<br>(Node.js)"]
            ReminderService["Reminder Service<br>(Node.js)"]
            DocumentService["Document Service<br>(Node.js)"]
        end
    end

    subgraph "Database Container"
        MongoDB[("Database<br>(MongoDB)")]
        
        subgraph "Data Models"
            CaseModel["Case Model<br>(Mongoose)"]
            MotionModel["Motion Model<br>(Mongoose)"]
            OffenderModel["Offender Model<br>(Mongoose)"]
            NotificationModel["Notification Model<br>(Mongoose)"]
            TemplateModel["Template Model<br>(Mongoose)"]
        end
    end

    subgraph "External Services"
        BlobStorage["Blob Storage<br>(Vercel Blob)"]
        CronService["Cron Service<br>(Vercel Cron)"]
    end

    %% User Interactions
    User -->|"Accesses"| NextApp
    Admin -->|"Manages"| NextApp

    %% Frontend to Backend
    NextApp -->|"API Calls"| APILayer
    
    %% Frontend Component Relationships
    NextApp -->|"Uses"| AuthComponent
    NextApp -->|"Uses"| UIComponents
    NextApp -->|"Uses"| MotionEditor
    NextApp -->|"Uses"| ReminderComponent
    NextApp -->|"Uses"| HelpSystem
    NextApp -->|"Uses"| DocumentProcessor

    %% API Layer to Services
    APILayer -->|"Routes to"| AuthService
    APILayer -->|"Routes to"| CaseService
    APILayer -->|"Routes to"| MotionService
    APILayer -->|"Routes to"| NotificationService
    APILayer -->|"Routes to"| ReminderService
    APILayer -->|"Routes to"| DocumentService

    %% Services to Database
    CaseService -->|"Uses"| CaseModel
    MotionService -->|"Uses"| MotionModel
    NotificationService -->|"Uses"| NotificationModel
    AuthService -->|"Uses"| OffenderModel
    DocumentService -->|"Uses"| TemplateModel

    %% Database Models to MongoDB
    CaseModel -->|"Stored in"| MongoDB
    MotionModel -->|"Stored in"| MongoDB
    OffenderModel -->|"Stored in"| MongoDB
    NotificationModel -->|"Stored in"| MongoDB
    TemplateModel -->|"Stored in"| MongoDB

    %% External Service Connections
    DocumentService -->|"Stores files"| BlobStorage
    ReminderService -->|"Scheduled tasks"| CronService
```

---

## Getting Started

### Prerequisites

- **Node.js**: (>= 14.x)
- **Package Manager**: npm or yarn
- **Database**: MongoDB instance
- **Deployment**: Vercel account

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/court-jester.git
   cd court-jester
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Copy and configure environment variables:**

   ```bash
   cp .env.example .env
   ```

### Running Locally

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the app.

---

## API Documentation

Court Jester includes a robust API for managing legal workflows. The API provides endpoints for:

- **Offenders**: Listing, retrieving, updating, and deleting offender profiles.
- **Cases**: Managing legal cases including filing, updating, and deletion.
- **Notifications**: Creating, listing, updating, and deleting notifications.
- **Motions & Reminders**: Handling motions and reminders with support for document uploads and automated processing.

For full API details, please see the [API Documentation](#api-documentation).

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear, descriptive messages.
4. Open a pull request with details on your changes.

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions, feedback, or support, please open an issue on GitHub.

---

<p align="center">Made with ❤️ by the Court Jester Team</p>
