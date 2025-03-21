-- Enable pgcrypto extension for gen_random_uuid() if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        CREATE EXTENSION "pgcrypto";
    END IF;
END $$;

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS "Session", "Slot", "Customer", "Employee";

-- Recreate the schema (from your revised version with fixes)
CREATE TABLE "Employee" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Customer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Slot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employeeId" UUID NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "startTime" TIMESTAMP(3) NOT NULL,
    "duration" INTERVAL NOT NULL DEFAULT '30 minutes',
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Slot_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Slot_unique_employee_start_time" UNIQUE ("employeeId", "startTime")
);

CREATE TABLE "Session" (    
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slotId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "message" VARCHAR(140),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Session_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Session_slotId_key" ON "Session"("slotId");
CREATE INDEX "Slot_startTime_idx" ON "Slot"("startTime");

-- Insert 10 Employees
INSERT INTO "Employee" ("id", "firstName", "lastName", "email", "phoneNumber", "createdAt", "updatedAt")
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
INSERT INTO "Customer" ("id", "firstName", "lastName", "email", "phoneNumber", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    'CustFirst' || n,
    'CustLast' || n,
    'cust' || n || '@example.com',
    '555-02' || LPAD(n::TEXT, 2, '0'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM generate_series(1, 100) AS n;

-- Insert Slots: Mon-Fri, 9 AM-5 PM for each employee (March 3-28, 2025)
DO $$
DECLARE
    emp_ids UUID ARRAY;
    emp_id UUID;
BEGIN
    -- Store employee UUIDs in an array
    SELECT array_agg("id") INTO emp_ids FROM "Employee";
    FOR emp_idx IN 1..10 LOOP
        emp_id := emp_ids[emp_idx];
        FOR day IN 3..28 LOOP -- March 3-28, skipping weekends
            IF EXTRACT(DOW FROM DATE '2025-03-01' + day) BETWEEN 1 AND 5 THEN -- Mon-Fri
                FOR hour IN 9..16 LOOP -- 9 AM to 4 PM (last slot starts at 4 PM)
                    INSERT INTO "Slot" ("id", "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt")
                    VALUES (
                        gen_random_uuid(),
                        emp_id,
                        'AVAILABLE',
                        TIMESTAMP '2025-03-01' + (day || ' days ' || hour || ' hours')::INTERVAL,
                        '30 minutes'::INTERVAL,
                        false,
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP
                    );
                END LOOP;
            END IF;
        END LOOP;
    END LOOP;
END $$;
