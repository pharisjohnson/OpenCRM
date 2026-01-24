# GEMINI Project Context: OpenCRM

This document provides instructional context about the OpenCRM project for the Gemini AI assistant.

## Project Overview

OpenCRM is a modern, open-source Customer Relationship Management (CRM) application built with Next.js and TypeScript. It is designed for small teams and provides features such as lead management, deal pipelines, document storage, and AI-powered insights. The application uses Supabase for its backend database and authentication, and Tailwind CSS for styling.

## Key Technologies

*   **Framework:** [Next.js](https://nextjs.org/) (using the App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Library:** [React](https://reactjs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Database:** [Supabase](https://supabase.io/)
*   **AI:** [@google/genai](https://www.npmjs.com/package/@google/genai) for AI-powered features.
*   **Email Services:** [Resend](https://resend.com/) for sending emails.
*   **Linting:** [ESLint](https://eslint.org/)

## Project Structure

*   `app/`: Contains the core application logic and UI, using the Next.js App Router.
    *   `app/(dashboard)/`: Main authenticated application routes.
    *   `app/login/`, `app/signup/`: Authentication pages.
*   `components/`: Shared React components used throughout the application.
*   `contexts/`: React context providers for managing global state.
*   `lib/`: Contains helper functions and client libraries, including the Supabase client (`lib/supabase.ts`).
*   `services/`: Modules for interacting with external services like AI and email.
*   `supabase/migrations/`: SQL files for database schema migrations managed by Supabase.
*   `public/`: Static assets like images and icons.

## Building and Running the Project

### Prerequisites

*   Node.js and npm (or yarn/pnpm/bun)
*   A Supabase project for the database and authentication.
*   Environment variables for Supabase URL, Supabase anon key, and any other required service keys (see `.env.example`).

### Key Commands

The following commands are defined in `package.json`:

*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

*   **Build for production:**
    ```bash
    npm run build
    ```

*   **Start the production server:**
    ```bash
    npm run start
    ```

*   **Lint the code:**
    ```bash
    npm run lint
    ```

## Development Conventions

*   **Coding Style:** The project follows standard TypeScript and React conventions, enforced by ESLint.
*   **Database:** Database schema changes should be managed via migration files in the `supabase/migrations` directory.
*   **State Management:** Global state is managed via React Context (see `contexts/` directory).
*   **Environment Variables:** All secret keys and environment-specific configurations should be managed through environment variables. A `.env.example` file is provided as a template.
