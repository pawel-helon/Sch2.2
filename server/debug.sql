-- psql -U postgres -d scheduling -f debug.sql
WITH available_time AS (
  WITH all_times AS (
    SELECT generate_series(
      ('2025-03-30'::date || ' ' || '08:00:00.000'::time)::timestamp,
      ('2025-03-30'::date || ' ' || '20:00:00.000'::time)::timestamp,
      INTERVAL '15 minutes'
    ) AS possible_time
  )
  SELECT possible_time::time AS time
  FROM all_times
  WHERE possible_time > CURRENT_TIMESTAMP
    AND NOT EXISTS (
      SELECT 1
      FROM "Slot"
      WHERE "startTime" = possible_time
        AND "startTime" >= ('2025-03-30'::date || ' ' || '00:00:00.000'::time)::timestamp
        AND "startTime" <= ('2025-03-30'::date || ' ' || '23:59:59.999'::time)::timestamp
    )
  ORDER BY possible_time
  LIMIT 1
  )
  INSERT INTO "Slot" (
  "employeeId", "type", "startTime", "duration", "recurring", "createdAt", "updatedAt"
  )
  SELECT
  '034fe77f-4341-4782-bc38-a7f5a03df05b'::uuid AS "employeeId",
  'AVAILABLE' AS "type",
  ('2025-03-30'::date || ' ' || time::time)::timestamp AS "startTime",
  '30 minutes' AS "duration",
  false AS "recurring",
  NOW() AS "createdAt",
  NOW() AS "updatedAt"
  FROM available_time
RETURNING *