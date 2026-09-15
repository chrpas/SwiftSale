-- SwiftSale Initial Database Initialization Script
-- Executed automatically on first container startup by PostgreSQL docker-entrypoint

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'SwiftSale database initialized successfully.';
END $$;
