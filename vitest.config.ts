import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/setup/global-setup.ts'],
    testTimeout: 15000,
    hookTimeout: 30000,
    reporters: ['verbose'],
    env: {
      PB_TEST_URL: 'http://127.0.0.1:8092',
    },
  },
});
