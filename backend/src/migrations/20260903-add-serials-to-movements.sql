ALTER TABLE movements
ADD COLUMN IF NOT EXISTS serials jsonb NOT NULL DEFAULT '[]'::jsonb;