-- psql -U postgres -d scheduling -f debug.sql
SELECT "id" FROM "Slots"
WHERE "employeeId" = '054ffd34-6faa-4f45-80ff-2219dd3e06a8'::uuid