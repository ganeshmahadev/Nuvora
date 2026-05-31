-- v4: Dedicated schema for LangGraph AsyncPostgresSaver checkpointing
create schema if not exists langgraph;

-- The LangGraph service uses the service_role connection in this schema.
-- AsyncPostgresSaver.setup() will create on first run:
--   langgraph.checkpoints
--   langgraph.checkpoint_blobs
--   langgraph.checkpoint_writes

grant all on schema langgraph to service_role;
grant all on all tables in schema langgraph to service_role;
grant all on all sequences in schema langgraph to service_role;

alter default privileges in schema langgraph
  grant all on tables to service_role;
alter default privileges in schema langgraph
  grant all on sequences to service_role;
