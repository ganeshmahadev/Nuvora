-- Create the langgraph schema for the checkpointer
CREATE SCHEMA IF NOT EXISTS langgraph;

-- Grant access to the postgres user
GRANT ALL ON SCHEMA langgraph TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA langgraph TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA langgraph TO postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA langgraph
  GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA langgraph
  GRANT ALL ON SEQUENCES TO postgres;