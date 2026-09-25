# Showroom Management + Bike Service Management SaaS

A production-grade, multi-tenant SaaS platform for automobile showrooms and bike service centers.

## Folder Structure

showroom-management/
├── PRD+DLD/
│   ├── PRD_Showroom_Bike_Service_SaaS.md     <- Full PRD (v1.0)
│   └── showroom_management_prd_v0.md         <- Initial PRD Draft
└── README.md

## Documents

| Document                          | Description                          | Status     |
|-----------------------------------|--------------------------------------|------------|
| PRD_Showroom_Bike_Service_SaaS.md | Full Product Requirements Document   | Draft      |
| HLD (High-Level Design)           | System architecture & component diagrams | Pending |
| DLD (Detailed-Level Design)       | Per-module detailed design           | Pending    |

## System Panels

| Panel               | Users                                    |
|---------------------|------------------------------------------|
| Customer Web App    | End customers (bike owners)              |
| Showroom Admin Panel| Owner, Admin, Manager, Accountant        |
| Worker Panel        | Mechanics, Technicians                   |
| Super Admin Panel   | Platform operators                       |
| Mobile App (Expo)   | All users                                |

## Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | Next.js 15, React 19, TypeScript          |
| Backend    | Next.js 15 (Route Handlers), TypeScript   |
| Database   | PostgreSQL + Prisma ORM                   |
| Mobile     | Expo + React Native + TypeScript          |
| Monorepo   | Turborepo + npm workspaces                |
| Validation | Zod                                       |
| Testing    | Vitest + Playwright                       |

Project Started: September 25, 2026
