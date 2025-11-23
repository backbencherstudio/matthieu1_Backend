import { defineConfig } from '@prisma/config';

// ...existing code...
export default defineConfig({
  db: {
    url: process.env.DATABASE_URL!,
  },
} as any);
// ...existing code...