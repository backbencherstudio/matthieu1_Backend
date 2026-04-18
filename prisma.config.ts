// import { defineConfig } from '@prisma/config';

// // ...existing code...
// export default defineConfig({
//   db: {
//     url: process.env.DATABASE_URL!,
//   },
// } as any);
// // ...existing code...

import 'dotenv/config'; // ensures .env variables are loaded
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma', // path to your- schema
  datasource: {
    url: env('DATABASE_URL'), // safer than process.env
  },
});
