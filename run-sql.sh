#!/bin/bash

# Read the SQL file
SQL_CONTENT=$(cat supabase_schema.sql)

# Use psql to connect and run the SQL
PGPASSWORD="PaI2Lj74A3B0lMP8" psql \
  -h db.yongjwgyuirvrlsnvjch.supabase.co \
  -p 5432 \
  -U postgres \
  -d postgres \
  -c "$SQL_CONTENT"