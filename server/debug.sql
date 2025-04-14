-- psql -U postgres -d scheduling -f debug.sql
DELETE FROM "Slots"
WHERE "id" = '45c5483a-1c02-4f2c-a2fd-498a07e4e791'::uuid