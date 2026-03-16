#!/bin/bash
# Build and deploy xTermObsidian plugin

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_DIR_NAME="obsidian-term"
TARGET_DIR="/Users/fengzheng/知识管理/风筝记/.obsidian/plugins/${PLUGIN_DIR_NAME}"
RELEASES_ROOT="${SCRIPT_DIR}/releases"
MACOS_RELEASE_DIR="${RELEASES_ROOT}/macos/${PLUGIN_DIR_NAME}"

copy_plugin_bundle() {
    local destination_dir="$1"

    mkdir -p "$destination_dir"
    rm -rf "$destination_dir/resources" "$destination_dir/themes"
    mkdir -p "$destination_dir/resources" "$destination_dir/themes"

    cp "$SCRIPT_DIR/main.js" "$destination_dir/"
    cp "$SCRIPT_DIR/manifest.json" "$destination_dir/"
    cp "$SCRIPT_DIR/styles.css" "$destination_dir/"
    cp "$SCRIPT_DIR/resources/pty-helper" "$destination_dir/resources/"
    cp -R "$SCRIPT_DIR/themes/." "$destination_dir/themes/"
}

echo "🔨 Building plugin..."
cd "$SCRIPT_DIR"
npm run build

echo "📁 Deploying to local Obsidian plugin directory..."
copy_plugin_bundle "$TARGET_DIR"

echo "📦 Creating macOS release bundle..."
mkdir -p "$RELEASES_ROOT/macos"
copy_plugin_bundle "$MACOS_RELEASE_DIR"
chmod +x "$RELEASES_ROOT/macos/install.sh"

echo "✅ Deployed to: $TARGET_DIR"
echo "✅ macOS release bundle: $MACOS_RELEASE_DIR"
echo ""
echo "📋 Local plugin files:"
ls -la "$TARGET_DIR"
echo ""
echo "📋 macOS release files:"
ls -la "$MACOS_RELEASE_DIR"
