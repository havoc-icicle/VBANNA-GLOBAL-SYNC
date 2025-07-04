import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  logger.error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  // Add connection pooling and timeout settings
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'apikey': supabaseServiceRoleKey,
    },
  },
});

// Test the connection with timeout
export const testConnection = async () => {
  try {
    logger.info('Testing Supabase connection...');
    
    // Set a timeout for the connection test
    const connectionPromise = supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
    
    if (error) {
      throw error;
    }
    
    logger.info('Supabase connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to Supabase:', error.message);
    
    // Don't exit in development mode, just warn
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Continuing in development mode despite database connection issues...');
      return false;
    }
    
    process.exit(1);
  }
};