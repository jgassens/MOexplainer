import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ReactInspector from 'vite-plugin-react-inspector';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.VITE_BASE_PATH ?? (repoName ? `/${repoName}/` : './');

export default defineConfig(({ command }) => ({
  base,
  plugins: command === 'serve' ? [ReactInspector(), react()] : [react()],
}));
