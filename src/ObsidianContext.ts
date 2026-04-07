import { MarkdownView, Notice, normalizePath, type Editor, type TFile } from 'obsidian';
import type XTermTerminalPlugin from './main';
import * as fs from 'fs';
import * as path from 'path';

export interface ObsidianContextSnapshot {
    updatedAt: string;
    vaultPath: string;
    activeFilePath: string | null;
    activeFileAbsolutePath: string | null;
    selection: string;
    hasSelection: boolean;
    cursor: {
        line: number;
        ch: number;
    } | null;
    selectionAnchor: {
        line: number;
        ch: number;
    } | null;
    currentLine: string | null;
}

export interface ObsidianContextRuntimePaths {
    runtimeDir: string;
    contextFile: string;
    selectionFile: string;
}

export class ObsidianContextService {
    private readonly plugin: XTermTerminalPlugin;
    private pollTimer: number | null = null;
    private lastSerializedContext = '';
    private lastSelection = '';
    private lastSnapshot: ObsidianContextSnapshot | null = null;
    private static readonly UTF8_BOM = '\uFEFF';

    constructor(plugin: XTermTerminalPlugin) {
        this.plugin = plugin;
    }

    async start(): Promise<void> {
        await this.captureSnapshotFromActiveMarkdownView();

        this.plugin.registerEvent(
            this.plugin.app.workspace.on('active-leaf-change', () => {
                void this.writeContextSnapshot();
            })
        );

        this.plugin.registerEvent(
            this.plugin.app.workspace.on('file-open', () => {
                void this.writeContextSnapshot();
            })
        );

        this.plugin.registerEvent(
            this.plugin.app.workspace.on('editor-change', () => {
                void this.writeContextSnapshot();
            })
        );

        this.pollTimer = window.setInterval(() => {
            void this.captureSnapshotFromActiveMarkdownView();
        }, 400);

        this.plugin.register(() => {
            if (this.pollTimer !== null) {
                window.clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        });
    }

    getRuntimePaths(): ObsidianContextRuntimePaths {
        const vaultPath = this.getVaultPath();
        const manifestDir = this.plugin.manifest.dir;
        const pluginDir = manifestDir
            ? (path.isAbsolute(manifestDir) ? manifestDir : path.join(vaultPath, manifestDir))
            : path.join(vaultPath, '.obsidian', 'plugins', this.plugin.manifest.id);
        const runtimeDir = path.join(pluginDir, 'runtime');

        return {
            runtimeDir,
            contextFile: path.join(runtimeDir, 'obsidian-context.json'),
            selectionFile: path.join(runtimeDir, 'obsidian-selection.txt')
        };
    }

    getLatestSnapshot(): ObsidianContextSnapshot {
        const liveSnapshot = this.createSnapshotFromActiveMarkdownView();
        if (liveSnapshot) {
            this.lastSnapshot = liveSnapshot;
            return liveSnapshot;
        }

        if (this.lastSnapshot) {
            return this.lastSnapshot;
        }

        return this.createEmptySnapshot();
    }

    async captureSnapshotFromActiveMarkdownView(): Promise<void> {
        const snapshot = this.createSnapshotFromActiveMarkdownView() ?? this.lastSnapshot ?? this.createEmptySnapshot();
        this.lastSnapshot = snapshot;
        await this.writeContextSnapshot(snapshot);
    }

    private createSnapshotFromActiveMarkdownView(): ObsidianContextSnapshot | null {
        const vaultPath = this.getVaultPath();
        const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            return null;
        }

        const file = view.file ?? null;
        const editor = view.editor ?? null;
        const selection = editor?.getSelection() ?? '';
        const cursor = editor ? editor.getCursor('from') : null;
        const anchor = editor ? editor.getCursor('to') : null;
        const currentLine = cursor && editor ? editor.getLine(cursor.line) : null;

        return {
            updatedAt: new Date().toISOString(),
            vaultPath,
            activeFilePath: file?.path ?? null,
            activeFileAbsolutePath: file ? this.getAbsoluteFilePath(file) : null,
            selection,
            hasSelection: selection.length > 0,
            cursor: cursor ? { line: cursor.line, ch: cursor.ch } : null,
            selectionAnchor: anchor ? { line: anchor.line, ch: anchor.ch } : null,
            currentLine,
        };
    }

    private createEmptySnapshot(): ObsidianContextSnapshot {
        return {
            updatedAt: new Date().toISOString(),
            vaultPath: this.getVaultPath(),
            activeFilePath: null,
            activeFileAbsolutePath: null,
            selection: '',
            hasSelection: false,
            cursor: null,
            selectionAnchor: null,
            currentLine: null,
        };
    }

    async writeContextSnapshot(snapshot = this.getLatestSnapshot()): Promise<void> {
        const runtimePaths = this.getRuntimePaths();
        const serializedContext = `${JSON.stringify(snapshot, null, 2)}\n`;
        const serializedContextForDisk = `${ObsidianContextService.UTF8_BOM}${serializedContext}`;
        const selectionForDisk = `${ObsidianContextService.UTF8_BOM}${snapshot.selection}`;

        if (serializedContext === this.lastSerializedContext && snapshot.selection === this.lastSelection) {
            return;
        }

        await fs.promises.mkdir(runtimePaths.runtimeDir, { recursive: true });
        await fs.promises.writeFile(runtimePaths.contextFile, serializedContextForDisk, 'utf8');
        await fs.promises.writeFile(runtimePaths.selectionFile, selectionForDisk, 'utf8');

        this.lastSerializedContext = serializedContext;
        this.lastSelection = snapshot.selection;
    }

    async copyContextFilePath(): Promise<void> {
        const { contextFile } = this.getRuntimePaths();
        await this.writeContextSnapshot();
        await navigator.clipboard.writeText(contextFile);
        new Notice(`Copied Obsidian context file path: ${contextFile}`, 3000);
    }

    async copyCurrentSelection(): Promise<void> {
        const snapshot = this.getLatestSnapshot();
        if (!snapshot.selection) {
            new Notice('No selected text in the active note.', 3000);
            return;
        }

        await navigator.clipboard.writeText(snapshot.selection);
        new Notice('Copied current note selection.', 2500);
    }

    private getVaultPath(): string {
        const adapter = this.plugin.app.vault.adapter as { basePath?: string };
        return adapter.basePath ?? process.cwd();
    }

    private getAbsoluteFilePath(file: TFile): string {
        return normalizePath(path.join(this.getVaultPath(), file.path));
    }
}
