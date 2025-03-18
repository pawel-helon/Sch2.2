SELECT generate_series(
  '2025-10-10'::date,
  '2025-12-31'::date,
  interval '7 days'
)::date