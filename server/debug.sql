-- psql -U postgres -d scheduling -f debug.sql

-- SELECT *
-- FROM "Slot"
-- WHERE "employeeId" = '51c41795-2eb0-4165-b8d5-6b3990a0bc21'::uuid
--   AND EXTRACT(HOUR FROM "startTime") = 10
--   AND EXTRACT(MINUTE FROM "startTime") = 0
--   AND EXTRACT(SECOND FROM "startTime") = 0;

-- SELECT *
-- FROM "Slot"
-- WHERE "employeeId" = '84fc692c-b0aa-4d4a-a0ce-c1a58710fa42'::uuid
--   AND "recurring" = true
--   AND EXTRACT(HOUR FROM "startTime") > 15
-- ORDER BY "startTime"

-- SELECT * FROM "Employee"

-- SELECT * FROM "Slot"
-- WHERE "employeeId" = '84fc692c-b0aa-4d4a-a0ce-c1a58710fa42'::uuid
--   AND "recurring" = true

SELECT *
FROM "Slot"
-- WHERE "id" = 'f17d0fc4-48bc-48e4-aedf-23ece294fbe4'::uuid
--   OR "id" = '8af706e4-4eb2-4331-9253-9bddba9b18e8'::uuid

