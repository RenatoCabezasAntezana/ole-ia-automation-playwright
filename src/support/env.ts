import * as dotenv from 'dotenv';
import * as path from 'path';

const envName = process.env.ENV_NAME || 'dev';
const envFile = path.resolve(process.cwd(), `.env.${envName}`);

dotenv.config({ path: envFile });

console.log(`[env] Ambiente cargado: ${envName} (${envFile})`);

export const ENV = {
  NAME: envName,
  BASE_URL: process.env.BASE_URL || 'https://example.com',
  TIMEOUT: Number(process.env.TIMEOUT) || 30000,
  HEADLESS: process.env.HEADLESS === 'true',

  CREDENTIALS: {
    standard: {
      user: process.env.STANDARD_USER || '',
      password: process.env.STANDARD_PASSWORD || '',
    },
    locked: {
      user: process.env.LOCKED_USER || '',
      password: process.env.LOCKED_PASSWORD || '',
    },
    wrongPassword: {
      user: process.env.STANDARD_USER || '',
      password: process.env.WRONG_PASSWORD || 'wrong_password',
    },
  },
};
