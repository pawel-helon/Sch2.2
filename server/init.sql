-- Enable pgcrypto extension for gen_random_uuid() if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        CREATE EXTENSION "pgcrypto";
    END IF;
END $$;

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS "Sessions", "Slots", "Customers", "Employees", "SlotsRecurringDates";

-- Recreate the schema (from your revised version with fixes)
CREATE TABLE "Employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Employees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SlotsRecurringDates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "date" DATE NOT NULL,
    CONSTRAINT "RecurringDays_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RecurringDays_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "startTime" TIMESTAMP(3) NOT NULL,
    "duration" INTERVAL NOT NULL DEFAULT '30 minutes',
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Slots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Slots_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Slots_unique_employee_start_time" UNIQUE ("employeeId", "startTime")
);

CREATE TABLE "Sessions" (    
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slotId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "message" VARCHAR(140),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Sessions_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sessions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sessions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Sessions_slotId_key" ON "Sessions"("slotId");
CREATE INDEX "Slots_startTime_idx" ON "Slots"("startTime");

-- Insert 10 Employees
INSERT INTO "Employees" ("id", "firstName", "lastName", "email", "phoneNumber", "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'Alice', 'Johnson', 'alice.j@example.com', '555-0101', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Bob', 'Smith', 'bob.s@example.com', '555-0102', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Clara', 'Lee', 'clara.l@example.com', '555-0103', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'David', 'Kim', 'david.k@example.com', '555-0104', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Eve', 'Martinez', 'eve.m@example.com', '555-0105', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Frank', 'Taylor', 'frank.t@example.com', '555-0106', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Grace', 'Nguyen', 'grace.n@example.com', '555-0107', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Hank', 'Brown', 'hank.b@example.com', '555-0108', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Ivy', 'Patel', 'ivy.p@example.com', '555-0109', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Jack', 'Wilson', 'jack.w@example.com', '555-0110', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert 100 Customers
INSERT INTO "Customers" ("id", "firstName", "lastName", "email", "phoneNumber", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    'CustFirst' || n,
    'CustLast' || n,
    'cust' || n || '@example.com',
    '555-02' || LPAD(n::TEXT, 2, '0'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM generate_series(1, 100) AS n;
