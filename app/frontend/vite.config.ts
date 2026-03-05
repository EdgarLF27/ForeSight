<<<<<<< HEAD
﻿import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
=======
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
