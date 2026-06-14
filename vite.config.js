import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/',

  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        exercises: resolve(__dirname, 'src/exercises/index.html'),
        nutrition: resolve(__dirname, 'src/nutrition/index.html'),
        workoutBuilder: resolve(__dirname, 'src/workout-builder/index.html'),
      },
    },
  },
});
