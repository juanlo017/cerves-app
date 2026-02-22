-- ============================================================================
-- CONSUMPTION_GROUPS JOIN TABLE
-- Links consumptions to multiple groups (many-to-many)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

CREATE TABLE consumption_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consumption_id UUID NOT NULL REFERENCES consumptions(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(consumption_id, group_id)
);

-- Index for fetching all groups a consumption belongs to
CREATE INDEX idx_consumption_groups_consumption ON consumption_groups(consumption_id);

-- Index for fetching all consumptions in a group (leaderboards, stats)
CREATE INDEX idx_consumption_groups_group ON consumption_groups(group_id);
