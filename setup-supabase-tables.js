import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yongjwgyuirvrlsnvjch.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvbmdqd2d5dWlydnJsc252amNoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ2ODQzNCwiZXhwIjoyMDY3MDQ0NDM0fQ.pXgdZYaO7Pepo7RclhU6HhsjV6WLhvyJoUkQ_Wkfs_c';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTables() {
  try {
    // Read the SQL schema
    const fs = require('fs').promises;
    const sqlSchema = await fs.readFile('./supabase_schema.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlSchema
    });
    
    if (error) {
      console.error('Error creating tables:', error);
      
      // Alternative: Execute statements one by one
      const statements = sqlSchema.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: stmtError } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          
          if (stmtError) {
            console.error('Error executing:', statement.substring(0, 50) + '...', stmtError);
          }
        }
      }
    } else {
      console.log('Tables created successfully!');
    }
    
  } catch (err) {
    console.error('Setup error:', err);
  }
}

setupTables();