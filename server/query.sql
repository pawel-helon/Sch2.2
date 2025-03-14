-- Drop existing tables to start fresh
DROP TABLE IF EXISTS "Session", "Slot", "Customer", "Employee" CASCADE;

-- Recreate the schema (from your revised version with fixes)
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phoneNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "startTime" TIMESTAMP(3) NOT NULL,
    "duration" INTERVAL NOT NULL DEFAULT '30 minutes',
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Slot_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
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
INSERT INTO "Employee" ("id", "firstName", "lastName", "email", "phoneNumber", "createdAt", "updatedAt") VALUES
('emp1', 'Alice', 'Johnson', 'alice.j@example.com', '555-0101', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp2', 'Bob', 'Smith', 'bob.s@example.com', '555-0102', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp3', 'Clara', 'Lee', 'clara.l@example.com', '555-0103', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp4', 'David', 'Kim', 'david.k@example.com', '555-0104', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp5', 'Eve', 'Martinez', 'eve.m@example.com', '555-0105', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp6', 'Frank', 'Taylor', 'frank.t@example.com', '555-0106', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp7', 'Grace', 'Nguyen', 'grace.n@example.com', '555-0107', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp8', 'Hank', 'Brown', 'hank.b@example.com', '555-0108', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp9', 'Ivy', 'Patel', 'ivy.p@example.com', '555-0109', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('emp10', 'Jack', 'Wilson', 'jack.w@example.com', '555-0110', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert 100 Customers
INSERT INTO "Customer" ("id", "firstName", "lastName", "email", "phoneNumber", "createdAt", "updatedAt")
SELECT 
    'cust' || n AS "id",
    'CustFirst' || n AS "firstName",
    'CustLast' || n AS "lastName",
    'cust' || n || '@example.com' AS "email",
    '555-02' || LPAD(n::TEXT, 2, '0') AS "phoneNumber",
    CURRENT_TIMESTAMP AS "createdAt",
    CURRENT_TIMESTAMP AS "updatedAt"
FROM generate_series(1, 100) AS n;

-- Insert Slots: Mon-Fri, 9 AM-5 PM for each employee (March 3-28, 2025)
DO $$
BEGIN
    FOR emp IN 1..10 LOOP
        FOR day IN 3..28 LOOP -- March 3-28, skipping weekends
            IF EXTRACT(DOW FROM DATE '2025-03-01' + day) BETWEEN 1 AND 5 THEN -- Mon-Fri
                FOR hour IN 9..16 LOOP -- 9 AM to 4 PM (last slot starts at 4 PM)
                    INSERT INTO "Slot" ("id", "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt")
                    VALUES (
                        'slot_' || emp || '_' || day || '_' || hour,
                        'emp' || emp,
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

-- Insert Sessions: 5-20 random sessions per employee
DO $$
DECLARE
    slot_count INT;
    emp_id TEXT;
    cust_id TEXT;
    slot_id TEXT;
BEGIN
    FOR emp IN 1..10 LOOP
        emp_id := 'emp' || emp;
        -- Random number of sessions between 5 and 20
        FOR i IN 1..(5 + ROUND(RANDOM() * 15)) LOOP
            -- Pick a random available slot for this employee
            SELECT COUNT(*) INTO slot_count 
            FROM "Slot" 
            WHERE "employeeId" = emp_id AND "type" = 'AVAILABLE';
            
            IF slot_count > 0 THEN
                SELECT "id" INTO slot_id 
                FROM "Slot" 
                WHERE "employeeId" = emp_id AND "type" = 'AVAILABLE' 
                ORDER BY RANDOM() LIMIT 1;
                
                -- Pick a random customer
                cust_id := 'cust' || (1 + ROUND(RANDOM() * 99))::TEXT;
                
                -- Insert session
                INSERT INTO "Session" ("id", "slotId", "employeeId", "customerId", "message", "createdAt", "updatedAt")
                VALUES (
                    'sess_' || emp || '_' || i,
                    slot_id,
                    emp_id,
                    cust_id,
                    'Session with emp' || emp || ' and cust' || cust_id,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                );
                
                -- Mark slot as booked
                UPDATE "Slot" SET "type" = 'BOOKED' WHERE "id" = slot_id;
            END IF;
        END LOOP;
    END LOOP;
END $$;