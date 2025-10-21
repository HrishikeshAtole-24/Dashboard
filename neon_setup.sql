-- =====================================================
-- NEON POSTGRESQL SETUP SCRIPT FOR ANALYTICS DASHBOARD
-- =====================================================
-- Execute this script in DBeaver or any PostgreSQL client
-- Database: Neon PostgreSQL
-- Version: Compatible with PostgreSQL 15+

-- =====================================================
-- 1. CREATE UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- This function automatically updates the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 2. CREATE USERS TABLE
-- =====================================================
-- Stores user accounts for the analytics dashboard
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. CREATE WEBSITES TABLE
-- =====================================================
-- Stores website configurations that users want to track
CREATE TABLE IF NOT EXISTS websites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_id VARCHAR(50) UNIQUE NOT NULL, -- Used in tracking script
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for websites table
CREATE INDEX IF NOT EXISTS idx_websites_website_id ON websites(website_id);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);

-- Create trigger for websites table
DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;
CREATE TRIGGER update_websites_updated_at 
    BEFORE UPDATE ON websites 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. CREATE DAILY_STATS TABLE
-- =====================================================
-- Stores aggregated daily statistics for each website
CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    website_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    total_visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    avg_duration FLOAT DEFAULT 0,
    bounce_rate FLOAT DEFAULT 0,
    top_page VARCHAR(500),
    top_referrer VARCHAR(500),
    top_country VARCHAR(100),
    device_stats JSONB DEFAULT '{}',
    browser_stats JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(website_id, date)
);

-- Create indexes for daily_stats table
CREATE INDEX IF NOT EXISTS idx_daily_stats_website_date ON daily_stats(website_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- Create trigger for daily_stats table
DROP TRIGGER IF EXISTS update_daily_stats_updated_at ON daily_stats;
CREATE TRIGGER update_daily_stats_updated_at 
    BEFORE UPDATE ON daily_stats 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. INSERT SAMPLE DATA (OPTIONAL)
-- =====================================================
-- Uncomment the following lines if you want sample data for testing

-- Insert sample user
-- INSERT INTO users (email, password_hash, first_name, last_name) 
-- VALUES ('admin@example.com', '$2a$12$sample.hash.here', 'Admin', 'User')
-- ON CONFLICT (email) DO NOTHING;

-- Insert sample website (uncomment after creating a user)
-- INSERT INTO websites (user_id, domain, name, description, website_id) 
-- VALUES (1, 'example.com', 'Example Website', 'Sample website for testing', 'web_sample123')
-- ON CONFLICT (website_id) DO NOTHING;

-- Insert sample daily stats (uncomment after creating website)
-- INSERT INTO daily_stats (website_id, date, total_visits, unique_visitors, page_views, avg_duration, bounce_rate, top_page, device_stats, browser_stats)
-- VALUES (
--     'web_sample123', 
--     CURRENT_DATE - INTERVAL '1 day', 
--     150, 
--     120, 
--     180, 
--     45.5, 
--     35.2, 
--     '/home',
--     '{"desktop": 80, "mobile": 60, "tablet": 10}',
--     '{"chrome": 90, "firefox": 30, "safari": 30}'
-- ) ON CONFLICT (website_id, date) DO NOTHING;

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify everything was created correctly

-- Check if all tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'websites', 'daily_stats')
ORDER BY table_name;

-- Check table structures
\d users;
\d websites;  
\d daily_stats;

-- Check indexes
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('users', 'websites', 'daily_stats')
ORDER BY tablename, indexname;

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 7. USEFUL QUERIES FOR MONITORING
-- =====================================================

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'websites' as table_name, COUNT(*) as record_count FROM websites  
UNION ALL
SELECT 'daily_stats' as table_name, COUNT(*) as record_count FROM daily_stats;

-- Check recent activity
SELECT 
    w.domain,
    w.name,
    COUNT(ds.*) as days_with_data,
    MAX(ds.date) as latest_data,
    SUM(ds.total_visits) as total_visits
FROM websites w
LEFT JOIN daily_stats ds ON w.website_id = ds.website_id
WHERE w.is_active = true
GROUP BY w.id, w.domain, w.name
ORDER BY total_visits DESC NULLS LAST;

-- =====================================================
-- SCRIPT EXECUTION COMPLETE
-- =====================================================
-- All tables, indexes, and triggers have been created
-- Your Neon PostgreSQL database is ready for the Analytics Dashboard!
-- 
-- Next steps:
-- 1. Verify all tables were created successfully
-- 2. Start your backend server (npm run dev)
-- 3. Test the /health endpoint
-- 4. Start collecting analytics data!
-- =====================================================