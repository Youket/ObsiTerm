# xTerm Terminal

## 使用说明

- 在 Obsidian 右侧边栏打开终端
- 支持 `@` 自动补全当前 vault 中的文件和文件夹绝对路径
- 支持切换插件内置的 Ghostty 主题

打开方式：

- 点击左侧边栏终端图标
- 或在命令面板中执行 `Open Terminal`

`@` 自动补全：

- 输入 `@`
- 继续输入关键词过滤文件或文件夹
- 用 `↑` / `↓` 选择
- 用 `Tab` 或 `Enter` 确认
- 用 `Esc` 取消

示例：

```bash
cat @readme
```

选择后会自动补全为 vault 内文件的绝对路径。

## 开发说明

依赖：

- Node.js
- Rust 工具链

常用命令：

```bash
npm install
npm run build
./deploy.sh
```

说明：

- `npm run build` 会编译 Rust PTY helper 并构建插件
- `./deploy.sh` 会将插件部署到本地 Obsidian 插件目录
- 主题文件位于 `themes/`
