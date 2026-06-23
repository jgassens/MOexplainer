import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ReactInspector from 'vite-plugin-react-inspector';
import type { Plugin } from 'vite';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.VITE_BASE_PATH ?? (repoName ? `/${repoName}/` : './');

const reactThreeFiberSceneFilePattern =
  /src\/components\/orbital3d\/(?:PyOrbitalScene|PyOrbitalSurface|SamplingBox3D)\.tsx$/;

function stripInspectorFromReactThreeFiberFiles(): Plugin {
  return {
    name: 'strip-react-inspector-from-react-three-fiber-files',
    enforce: 'pre',
    apply: 'serve',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!reactThreeFiberSceneFilePattern.test(normalizedId)) {
        return null;
      }

      const strippedCode = code.replace(/\sdata-react-inspector="[^"]*"/g, '');
      return strippedCode === code ? null : strippedCode;
    },
  };
}

export default defineConfig(({ command }) => ({
  base,
  plugins: command === 'serve' ? [ReactInspector(), stripInspectorFromReactThreeFiberFiles(), react()] : [react()],
}));
