import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const rootDir = path.resolve(import.meta.dirname, '..');
const pluginDirName = 'obsidian-term';
const platformName = mapPlatform(process.platform);

const args = process.argv.slice(2);
const options = {
    skipBuild: false,
    releaseOnly: false,
    target: process.env.OBSIDIAN_PLUGIN_DIR ?? ''
};

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--skip-build') {
        options.skipBuild = true;
    } else if (arg === '--release-only') {
        options.releaseOnly = true;
    } else if (arg === '--target') {
        options.target = args[++i] ?? '';
    } else if (arg === '-h' || arg === '--help') {
        printHelp();
        process.exit(0);
    } else {
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
}

if (!options.skipBuild) {
    runCommand(getNpmCommand(), ['run', 'build'], rootDir);
}

const helperFileName = process.platform === 'win32' ? 'pty-helper.exe' : 'pty-helper';
const bundleFiles = [
    'main.js',
    'manifest.json',
    'styles.css'
];
const helperSourcePath = path.join(rootDir, 'resources', helperFileName);
const themesSourcePath = path.join(rootDir, 'themes');
const releaseBundleDir = path.join(rootDir, 'releases', platformName, pluginDirName);

for (const file of bundleFiles) {
    const filePath = path.join(rootDir, file);
    if (!existsSync(filePath)) {
        throw new Error(`Missing build artifact: ${filePath}`);
    }
}

if (!existsSync(helperSourcePath)) {
    throw new Error(`Missing PTY helper: ${helperSourcePath}`);
}

copyPluginBundle(releaseBundleDir);
console.log(`Release bundle refreshed: ${releaseBundleDir}`);

if (!options.releaseOnly && options.target) {
    copyPluginBundle(options.target);
    console.log(`Local plugin deployed: ${options.target}`);
} else if (!options.releaseOnly) {
    console.log('Local plugin deploy skipped. Set OBSIDIAN_PLUGIN_DIR or pass --target to enable it.');
}

function copyPluginBundle(destinationDir) {
    mkdirSync(destinationDir, { recursive: true });

    for (const entry of ['resources', 'themes']) {
        rmSync(path.join(destinationDir, entry), { recursive: true, force: true });
    }

    mkdirSync(path.join(destinationDir, 'resources'), { recursive: true });
    mkdirSync(path.join(destinationDir, 'themes'), { recursive: true });

    for (const file of bundleFiles) {
        cpSync(path.join(rootDir, file), path.join(destinationDir, file));
    }

    cpSync(helperSourcePath, path.join(destinationDir, 'resources', helperFileName));

    for (const entry of readdirSync(themesSourcePath)) {
        cpSync(
            path.join(themesSourcePath, entry),
            path.join(destinationDir, 'themes', entry),
            { recursive: true }
        );
    }
}

function runCommand(command, commandArgs, cwd) {
    const result = spawnSync(command, commandArgs, {
        cwd,
        stdio: 'inherit',
        shell: false
    });

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

function getNpmCommand() {
    return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function mapPlatform(value) {
    if (value === 'darwin') return 'macos';
    if (value === 'win32') return 'windows';
    if (value === 'linux') return 'linux';
    return value;
}

function printHelp() {
    console.log(`Usage: node scripts/deploy.mjs [options]

Options:
  --skip-build   Skip npm run build
  --release-only Refresh releases/<platform>/obsidian-term only
  --target <dir> Deploy to a specific Obsidian plugin directory
  -h, --help     Show help`);
}
