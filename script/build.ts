
import { build as viteBuild } from 'vite';
import { build as esbuild } from 'esbuild';
import { rm, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Adjust root to be one level up since this script is in script/ folder
const rootDir = path.resolve(__dirname, '..');

async function buildAll() {
  try {
    console.log('🔨 Removing old dist...');
    await rm(path.join(rootDir, 'dist'), { recursive: true, force: true });

    console.log('📦 Building client with Vite...');
    await viteBuild();

    console.log('🖥️  Building server...');
    const pkg = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf-8'));
    // Mark all dependencies as external for the server build
    // This avoids bundling native modules like bcrypt which can cause issues
    const allDeps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ];

    await esbuild({
      entryPoints: [path.join(rootDir, 'server/index.ts')],
      outfile: path.join(rootDir, 'dist/index.cjs'),
      bundle: true,
      platform: 'node',
      target: 'node20',
      external: allDeps, 
      format: 'cjs',
      logLevel: 'info',
    });

    console.log('✅ Build complete!');
  } catch (error: any) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildAll();
