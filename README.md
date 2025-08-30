# Baskit - Shopping List Management Application

Baskit is a mobile-optimized web application that helps users quickly and easily create and manage grocery shopping lists.

## Features

- **Products**: Built-in database of grocery products with units (ml, g, pcs)
- **Templates**: Create and manage meal and list templates
- **Shopping Lists**: Create lists in draft mode with editing capabilities
- **Shopping Mode**: Mark products as you shop
- **Auto-saving**: All changes are saved automatically
- **Polish Interface**: Full support for the Polish language

## Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: TanStack Router
- **Backend**: Convex (local database and functions)
- **UI Components**: shadcn/ui

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd baskit
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up local Convex**

   ```bash
   # Install Convex CLI
   pnpm add -g convex

   # Start local Convex
   convex dev
   ```

4. **Configure environment variables**

   ```bash
   # Copy env.example to .env
   cp env.example .env

   # Set CONVEX_URL from the output of convex dev (usually http://localhost:8000)
   ```

5. **Run the application**

   ```bash
   pnpm dev
   ```

## Running in Development Mode
