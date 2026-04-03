<div align="center">
  <h1>ObsiTerm</h1>
  <p><em>一个运行在 Obsidian 右侧栏里的终端插件，可直接使用 Claude Code、Codex、Gemini CLI 和其他命令行工具。</em></p>
  <p>
    <img alt="version" src="https://img.shields.io/badge/version-v1.0.1-1677ff?style=flat-square">
    <img alt="license" src="https://img.shields.io/badge/license-MIT-1677ff?style=flat-square">
    <img alt="platform" src="https://img.shields.io/badge/desktop-macOS%20%7C%20Windows-6f42c1?style=flat-square">
    <a href="https://github.com/Youket/ObsiTerm"><img alt="repo" src="https://img.shields.io/badge/fork-Youket%2FObsiTerm-f97316?style=flat-square"></a>
  </p>
  <p>
    <img alt="ObsiTerm Preview" src="./assets/light-theme.png">
  </p>
</div>

## 简介

`ObsiTerm` 会在 Obsidian Desktop 的右侧栏打开一个真实终端。目前同一套源码支持 macOS 和 Windows。

## 功能

- 在 Obsidian 中直接使用终端
- 适合运行 Claude Code、Codex、Gemini CLI 等命令行工具
- 支持基于 `@` 的 vault 文件和文件夹绝对路径补全
- 兼容 Ghostty 主题，并附带内置主题
- 可配置字体、字号和补全触发符
- 支持粘贴大段文本，也支持把图片粘贴成临时文件路径

## 安装

### 从 Releases 安装

从 [Releases](https://github.com/Youket/ObsiTerm/releases) 页面下载对应平台的压缩包。

- `ObsiTerm-macos-...zip`：macOS
- `ObsiTerm-windows-...zip`：Windows

解压后，将 `obsidian-term` 目录复制到你的 vault 的 `.obsidian/plugins/` 目录下。

### 本地开发安装

1. 将仓库 clone 到任意目录。
2. 安装依赖：

```bash
npm install
```

3. 构建：

```bash
npm run build
```

4. 将以下文件复制到 `.obsidian/plugins/obsidian-term/`：

- `main.js`
- `manifest.json`
- `styles.css`
- `themes/`
- macOS：`resources/pty-helper`
- Windows：`resources/pty-helper.exe`

## 本地部署

推荐使用跨平台命令：

```bash
npm run deploy
```

可选环境变量：

- `OBSIDIAN_PLUGIN_DIR`
  macOS 示例：`/Users/name/Vault/.obsidian/plugins/obsidian-term`
  Windows 示例：`E:\Vault\.obsidian\plugins\obsidian-term`

它会执行：

- `npm run build`
- 刷新 `releases/<platform>/obsidian-term`
- 如果设置了 `OBSIDIAN_PLUGIN_DIR`，则同步复制到本地 Obsidian 插件目录

仓库中的 `deploy.sh` 现在只是 Unix shell 的兼容包装，推荐统一使用 `npm run deploy`。

## GitHub 发布

推荐使用跨平台命令：

```bash
npm run release:github
```

这个命令会把当前平台的 `releases/<platform>/obsidian-term` 打包成 zip，并上传到 GitHub Releases。

常用选项：

```bash
npm run release:github -- --dry-run
npm run release:github -- --skip-build
npm run release:github -- --prerelease
npm run release:github -- --platform windows
npm run release:github -- --platform macos
```

注意：

- Windows 资源包应在 Windows 上构建
- macOS 资源包应在 macOS 上构建
- 发布前需要先安装并登录 `gh`

## 使用

### 启用与配置

在 Obsidian 设置中打开 Community plugins，找到 `ObsiTerm` 并启用。

可配置项包括：

- 主题
- 字号
- 字体
- 自动补全触发符

### 打开终端

点击左侧边栏中的 `New Terminal` 图标。

### `@` 自动补全

1. 输入 `@`
2. 继续输入关键字
3. 使用方向键选择
4. 按 `Tab` 或 `Enter` 确认
5. 按 `Esc` 取消

选中的项目会直接插入为绝对路径。

## 开发说明

- `npm run build` 会同时构建 TypeScript 插件和原生 PTY helper
- 修改代码后，推荐执行 `npm run deploy`
- 如果 Windows 提示 `resources/pty-helper.exe` 被占用，先关闭 Obsidian，再重新构建以刷新 helper

## 许可证

MIT
