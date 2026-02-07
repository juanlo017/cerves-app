-- ============================================================================
-- HELPFUL QUERIES (commented out - use as reference)
-- ============================================================================

-- Get player's personal consumption history
SELECT 
  c.consumed_at,
  d.name as drink_name,
  c.qty,
  (c.qty * d.eur_per_unit) as cost,
  (c.qty * d.kcal_per_unit) as calories
FROM consumptions c
JOIN drinks d ON d.id = c.drink_id
WHERE c.player_id = 'PLAYER_ID_HERE' 
  AND c.group_id IS NULL
ORDER BY c.consumed_at DESC;

-- Get group event consumptions
SELECT 
  p.display_name,
  d.name as drink_name,
  c.qty,
  c.consumed_at
FROM consumptions c
JOIN players p ON p.id = c.player_id
JOIN drinks d ON d.id = c.drink_id
WHERE c.group_id = 'GROUP_ID_HERE'
ORDER BY c.consumed_at DESC;

-- Daily consumption summary
SELECT 
  c.day,
  COUNT(*) as drinks_count,
  SUM(c.qty * d.liters_per_unit) as total_liters,
  SUM(c.qty * d.eur_per_unit) as total_spent
FROM consumptions c
JOIN drinks d ON d.id = c.drink_id
WHERE c.player_id = 'PLAYER_ID_HERE'
  AND c.group_id IS NULL
GROUP BY c.day
ORDER BY c.day DESC;

-- Transfer specific player by their ID
UPDATE players 
SET user_id = 'new-device-id-here'
WHERE id = 'player-uuid-here';
