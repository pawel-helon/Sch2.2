-- psql -U postgres -d bookings -f debug.sql
-- psql -U postgres -d bookings -f init.sql
SELECT * FROM "Sessions";
SELECT * FROM "Slots" WHERE "id" = 'ba78cc30-9da8-439c-9ac4-e0d4c7e43974'::uuid;
SELECT * FROM "Slots" ORDER BY "startTime";