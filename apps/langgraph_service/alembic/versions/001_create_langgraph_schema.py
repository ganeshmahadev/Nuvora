"""create langgraph schema
"""
from alembic import op
import sqlalchemy as sa


revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS langgraph")
    op.execute("GRANT ALL ON SCHEMA langgraph TO postgres")
    op.execute("GRANT ALL ON ALL TABLES IN SCHEMA langgraph TO postgres")
    op.execute("GRANT ALL ON ALL SEQUENCES IN SCHEMA langgraph TO postgres")
    op.execute(
        "ALTER DEFAULT PRIVILEGES IN SCHEMA langgraph GRANT ALL ON TABLES TO postgres"
    )
    op.execute(
        "ALTER DEFAULT PRIVILEGES IN SCHEMA langgraph GRANT ALL ON SEQUENCES TO postgres"
    )


def downgrade() -> None:
    op.execute("DROP SCHEMA IF EXISTS langgraph CASCADE")