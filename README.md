# xTerm

Obsidian 桌面端终端插件。

在右侧边栏打开一个可交互终端，默认工作目录为当前 vault 根目录；输入 `@` 可检索 vault 内文件和文件夹，并将选中项插入为绝对路径。

## 适用场景

- 在 Obsidian 内直接执行 shell 命令，不切出编辑器
- 快速把 vault 文件或目录绝对路径传给命令行工具
- 在同一个 vault 中保留多个终端标签页

## 核心特性

- 右侧边栏终端：基于 `xterm.js`
- 桌面专用：`manifest.json` 中 `isDesktopOnly: true`
- `@` 路径补全：扫描 vault，支持文件和文件夹
- 插入绝对路径：选中补全项后直接写入终端输入
- 模糊过滤：按文件名或相对路径匹配，最多显示 20 项
- 多终端标签：可重复打开多个终端视图
- 主题支持：内置多套 Ghostty 兼容主题，可热重载
- 外观可调：字体、字号、补全触发符可配置
- 粘贴增强：文本正常粘贴；图片会先落盘到临时文件，再把路径粘贴到终端
- 自适应尺寸：终端尺寸变化会同步到 PTY

## 使用

### 打开终端

- 点击左侧边栏终端图标：`New Terminal`
- 或在命令面板执行：
  - `Open Terminal`
  - `New Terminal Tab`

说明：

- 第一个终端会打开在右侧边栏
- 新终端会继续在右侧区域创建
- 终端默认从当前 vault 根目录启动

### 使用 `@` 自动补全

1. 在终端输入 `@`
2. 继续输入文件名或路径关键字过滤结果
3. 用 `↑` / `↓` 选择
4. 用 `Tab` 或 `Enter` 确认
5. 用 `Esc` 取消

示例：

```bash
cat @README
```

确认后会替换为类似：

```bash
cat "/absolute/path/to/your-vault/README.md"
```

补全规则：

- 返回文件和文件夹两类结果
- 匹配文件名和相对路径
- 路径包含空格时会自动加引号
- 默认触发符是 `@`，可在设置中修改

### 设置

插件设置中可调整：

- 终端主题
- 主题目录并重新加载主题
- 字号
- 字体
- 自动补全触发符

主题文件位于插件目录下的 `themes/`。

## 依赖与构建

本插件不是纯前端插件，终端能力依赖 Rust 编译的 PTY helper。

开发依赖：

- Node.js
- npm
- Rust toolchain

常用命令：

```bash
npm install
npm run build
./deploy.sh
```

说明：

- `npm run build`：编译 `native/pty-helper` 并打包插件
- `./deploy.sh`：构建后复制插件文件到本地 Obsidian 插件目录，同时生成 macOS release bundle

## 项目结构

- `src/main.ts`：插件注册、命令、设置、视图生命周期
- `src/TerminalView.ts`：终端 UI、PTY 进程、输入/粘贴/缩放
- `src/AutocompleteManager.ts`：`@` 补全弹窗与键盘交互
- `src/VaultScanner.ts`：vault 扫描、缓存、过滤
- `native/pty-helper/src/main.rs`：Rust PTY helper

## 当前行为说明

- 终端工作目录固定为 vault 根目录
- 自动补全插入的是绝对路径，不是 wikilink 或相对路径
- 仅支持 Obsidian 桌面端
