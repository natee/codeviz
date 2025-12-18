import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'codeviz',
    environment: 'node',
    root: './src',
    include: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/',
        '**/__tests__/**',
        '**/*.d.ts',
        '**/index.ts',
        'dist/',
      ],
      reportsDirectory: '../coverage',
    },
    globals: true,
    clearMocks: true,
  },
})