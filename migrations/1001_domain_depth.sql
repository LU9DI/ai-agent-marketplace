CREATE TABLE IF NOT EXISTS agent_versions (
 id uuid PRIMARY KEY, agent_id uuid NOT NULL REFERENCES agent_listings(id) ON DELETE CASCADE,
 version text NOT NULL, manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
 status text NOT NULL DEFAULT 'draft', created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(agent_id,version)
);
CREATE TABLE IF NOT EXISTS agent_installs (
 id uuid PRIMARY KEY, agent_id uuid NOT NULL REFERENCES agent_listings(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 version_id uuid REFERENCES agent_versions(id) ON DELETE SET NULL,
 status text NOT NULL DEFAULT 'active', installed_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(agent_id,user_id)
);
CREATE INDEX IF NOT EXISTS idx_agent_installs_user ON agent_installs(user_id,status);