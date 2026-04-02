import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
} as const;

// Validate required environment variables
const required = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY'] as const;

for (const key of required) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
