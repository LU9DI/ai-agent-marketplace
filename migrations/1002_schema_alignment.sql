ALTER TABLE agent_installs RENAME COLUMN agent_id TO listing_id;
ALTER TABLE agent_installs DROP CONSTRAINT IF EXISTS agent_installs_agent_id_fkey;
ALTER TABLE agent_installs ADD CONSTRAINT agent_installs_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES agent_listings(id) ON DELETE CASCADE;
ALTER TABLE agent_installs DROP CONSTRAINT IF EXISTS agent_installs_agent_id_user_id_key;
ALTER TABLE agent_installs ADD CONSTRAINT agent_installs_listing_id_user_id_key UNIQUE(listing_id,user_id);