-- ============================================================================
-- INVITATIONS TABLE
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL,
  invited_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ NULL
);

-- Index for fast inbox queries (player checking their invitations)
CREATE INDEX idx_invitations_invited_user ON invitations(invited_user_id, status);

-- Index for group-scoped queries
CREATE INDEX idx_invitations_group ON invitations(group_id);
