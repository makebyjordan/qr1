# Database Setup Instructions

## Option 1: Local PostgreSQL

1. Install PostgreSQL locally:
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   
   # Create database
   createdb inventory_db
   ```

2. Update `.env.local` with your connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/inventory_db"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

## Option 2: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the connection string to `.env.local`
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

## Option 3: Docker PostgreSQL

1. Run PostgreSQL in Docker:
   ```bash
   docker run --name inventory-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=inventory_db -p 5432:5432 -d postgres:15
   ```

2. Update `.env.local`:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/inventory_db"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

## After Database Setup

Once the database is connected, the app will automatically:
- Show real inventory statistics
- Allow product creation and scanning
- Process sales transactions
- Track stock movements

## Current Status

The app is running with mock data until the database is properly configured.
All functionality will work once you complete the database setup above.
