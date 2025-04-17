-- psql -U postgres -d scheduling -f debug.sql
SELECT * FROM "Slots"
WHERE "employeeId" = 'c722c52b-4222-4357-9eb6-3d90e2cb9367'::uuid