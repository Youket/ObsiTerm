# Release

This repository now uses cross-platform release scripts.

## Requirements

1. Install GitHub CLI: `gh`
2. Authenticate once:

```bash
gh auth login
```

3. Build the asset on the target platform:

- build Windows release assets on Windows
- build macOS release assets on macOS

## Local Bundle Refresh

```bash
npm run deploy
```

This refreshes `releases/<platform>/obsidian-term` for the current platform.

## Publish To GitHub Releases

```bash
npm run release:github
```

The release script will:

1. Run `npm run deploy` unless `--skip-build` is used
2. Read the version from `releases/<platform>/obsidian-term/manifest.json`
3. Create `dist-release/ObsiTerm-<platform>-v<version>.zip`
4. Create or update GitHub Release `v<version>`
5. Upload the platform zip asset

## Dry Run

```bash
npm run release:github -- --dry-run
```

## Common Options

```bash
npm run release:github -- --skip-build
npm run release:github -- --prerelease
npm run release:github -- --platform windows
npm run release:github -- --platform macos
npm run release:github -- --tag v1.0.0 --title "ObsiTerm 1.0.0"
npm run release:github -- --notes-file ./notes.md
```

## Recommended Order

1. Make sure `main` is clean and up to date
2. Update `manifest.json` if needed
3. Commit and push
4. Run `npm run release:github`
5. Verify the uploaded asset on GitHub
