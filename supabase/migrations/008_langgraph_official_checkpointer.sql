-- 008_langgraph_official_checkpointer.sql
-- Official @langchain/langgraph-checkpoint-postgres table layout
-- Idempotent and safe for repeated execution.

BEGIN;

CREATE TABLE IF NOT EXISTS public.checkpoint_migrations (
  v integer PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS public.checkpoints (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT '',
  checkpoint_id text NOT NULL,
  parent_checkpoint_id text,
  type text,
  checkpoint jsonb NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

CREATE TABLE IF NOT EXISTS public.checkpoint_blobs (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT '',
  channel text NOT NULL,
  version text NOT NULL,
  type text NOT NULL,
  blob bytea,
  PRIMARY KEY (thread_id, checkpoint_ns, channel, version)
);

CREATE TABLE IF NOT EXISTS public.checkpoint_writes (
  thread_id text NOT NULL,
  checkpoint_ns text NOT NULL DEFAULT '',
  checkpoint_id text NOT NULL,
  task_id text NOT NULL,
  idx integer NOT NULL,
  channel text NOT NULL,
  type text,
  blob bytea NOT NULL,
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
);

CREATE INDEX IF NOT EXISTS idx_checkpoints_thread_id
  ON public.checkpoints(thread_id, checkpoint_ns, checkpoint_id DESC);

CREATE INDEX IF NOT EXISTS idx_checkpoint_writes_thread_checkpoint
  ON public.checkpoint_writes(thread_id, checkpoint_ns, checkpoint_id);

CREATE INDEX IF NOT EXISTS idx_checkpoint_blobs_thread_ns
  ON public.checkpoint_blobs(thread_id, checkpoint_ns);

COMMIT;
