DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='agent_installs' AND column_name='agent_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='agent_installs' AND column_name='listing_id'
  ) THEN
    ALTER TABLE agent_installs RENAME COLUMN agent_id TO listing_id;
  END IF;
END $$;

ALTER TABLE IF EXISTS agent_installs DROP CONSTRAINT IF EXISTS agent_installs_agent_id_fkey;
ALTER TABLE IF EXISTS agent_installs DROP CONSTRAINT IF EXISTS agent_installs_listing_id_fkey;
ALTER TABLE IF EXISTS agent_installs DROP CONSTRAINT IF EXISTS agent_installs_agent_id_user_id_key;
ALTER TABLE IF EXISTS agent_installs DROP CONSTRAINT IF EXISTS agent_installs_listing_id_user_id_key;

ALTER TABLE IF EXISTS agent_installs
  ADD CONSTRAINT agent_installs_listing_id_fkey
  FOREIGN KEY (listing_id) REFERENCES agent_listings(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS agent_installs_listing_id_user_id_key
  ON agent_installs(listing_id,user_id);