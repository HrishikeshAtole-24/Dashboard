# Neon PostgreSQL Database Setup Guide

## 📋 Quick Setup Steps

### 1. Connect to Neon in DBeaver

**Connection Details:**
- **Host**: `ep-holy-wave-a4ebo9ma-pooler.us-east-1.aws.neon.tech`
- **Port**: `5432`
- **Database**: `neondb`
- **Username**: `neondb_owner`
- **Password**: `npg_FT7OkKXeJLz9`
- **SSL**: Require

**Connection URL:**
```
postgresql://neondb_owner:npg_FT7OkKXeJLz9@ep-holy-wave-a4ebo9ma-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Execute SQL Script

1. **Open DBeaver**
2. **Connect to your Neon database**
3. **Create New SQL Script** (Ctrl+Shift+Enter)
4. **Copy and paste** the contents of `neon_setup.sql`
5. **Execute the script** (F5 or Execute button)

### 3. Verify Setup

After running the script, you should see:

**Tables Created:**
- ✅ `users` (21 rows affected)
- ✅ `websites` (21 rows affected)  
- ✅ `daily_stats` (21 rows affected)

**Verification Query:**
```sql
-- Check all tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'websites', 'daily_stats')
ORDER BY table_name;
```

**Expected Result:**
| table_name   | table_type |
|------------- |----------- |
| daily_stats  | BASE TABLE |
| users        | BASE TABLE |
| websites     | BASE TABLE |

## 🗄️ Database Schema Overview

### **users** table
- Stores user accounts
- JWT authentication
- Profile information

### **websites** table  
- Website configurations
- Links to user accounts
- Unique website_id for tracking

### **daily_stats** table
- Aggregated analytics data
- Daily summaries from MongoDB events
- Fast querying for dashboard

## 🔧 Features Included

✅ **Auto-updating timestamps** (updated_at triggers)
✅ **Proper indexes** for fast queries
✅ **Foreign key relationships**
✅ **Unique constraints** 
✅ **JSONB columns** for flexible data storage
✅ **Data validation** and constraints

## 🚀 After Setup

Once you've executed the SQL script:

1. **✅ Tables created** in Neon PostgreSQL
2. **✅ Start backend server**: `npm run dev`
3. **✅ Check health**: http://localhost:5000/health
4. **✅ Start frontend**: `npm run dev` in frontend_dash
5. **✅ Create account**: http://localhost:3000

## 📊 Sample Queries

### Check database status:
```sql
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    typname as data_type
FROM pg_stats 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'websites', 'daily_stats');
```

### Monitor table sizes:
```sql
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(table_name::regclass)) AS size
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
```

Your Neon PostgreSQL database will be production-ready! 🎯