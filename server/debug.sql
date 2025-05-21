-- psql -U postgres -d scheduling -f debug.sql
-- psql -U postgres -d scheduling -f init.sql
DELETE FROM "Sessions";
DELETE FROM "Slots";