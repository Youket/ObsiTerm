# Agent MCP Setup

This document is written for terminal agents and power users who want to connect
ObsiTerm's bundled MCP server to an external CLI.

Supported bundled files:

- `resources/obsiterm-mcp.mjs`
- `resources/obsiterm-context.mjs`

The MCP server exposes these tools:

- `get_obsidian_context`
- `get_current_selection`
- `get_active_note`
- `get_selection_prompt`
- `get_active_note_prompt`

## Critical Requirement

Start the agent CLI **from inside an ObsiTerm terminal**.

Reason:

- `obsiterm-mcp.mjs` depends on ObsiTerm runtime environment variables
- those variables are injected only into terminals created by ObsiTerm

If the CLI is started from a normal system terminal, the MCP server may launch
but it will not be able to reach the local ObsiTerm bridge.

## Preconditions

1. Install the latest ObsiTerm plugin in Obsidian.
2. Open at least one ObsiTerm terminal so the local bridge starts.
3. Confirm these environment variables exist inside that terminal:

```powershell
$env:OBSITERM_CONTEXT_MCP
$env:OBSITERM_CONTEXT_CLI
$env:OBSITERM_CONTEXT_BRIDGE_URL
$env:OBSITERM_CONTEXT_BRIDGE_TOKEN
```

Expected:

- `OBSITERM_CONTEXT_MCP` points to `resources/obsiterm-mcp.mjs`
- `OBSITERM_CONTEXT_CLI` points to `resources/obsiterm-context.mjs`

## Claude Code

Recommended command target:

```text
node E:/YourVault/.obsidian/plugins/ObsiTerm/resources/obsiterm-mcp.mjs
```

Typical config shape:

```json
{
  "mcpServers": {
    "obsiterm": {
      "type": "stdio",
      "command": "node",
      "args": [
        "E:/YourVault/.obsidian/plugins/ObsiTerm/resources/obsiterm-mcp.mjs"
      ]
    }
  }
}
```

Validation:

1. Start `claude` from inside ObsiTerm.
2. Run `/mcp`.
3. Confirm `obsiterm` is `connected`.

## Codex CLI

Codex supports MCP registration directly.

One-time registration:

```powershell
codex mcp add obsiterm -- node E:\YourVault\.obsidian\plugins\ObsiTerm\resources\obsiterm-mcp.mjs
```

Validation:

```powershell
codex mcp list
codex mcp get obsiterm
```

Then launch Codex from inside ObsiTerm:

```powershell
codex
```

Important:

- the registration is global to Codex on that machine
- the runtime session must still be started from ObsiTerm

## Gemini CLI

If the installed Gemini CLI build supports local stdio MCP servers, register the
same `node .../obsiterm-mcp.mjs` command using Gemini's MCP configuration
mechanism.

Use this exact server process:

```text
node E:/YourVault/.obsidian/plugins/ObsiTerm/resources/obsiterm-mcp.mjs
```

If the Gemini CLI build in use does **not** support MCP registration, use the
bundled CLI bridge instead:

```powershell
node $env:OBSITERM_CONTEXT_CLI selection
node $env:OBSITERM_CONTEXT_CLI context
node $env:OBSITERM_CONTEXT_CLI selection-prompt --text
```

## Fallback Without MCP

If MCP is unavailable, the CLI wrapper still provides direct context access:

```powershell
node $env:OBSITERM_CONTEXT_CLI selection
node $env:OBSITERM_CONTEXT_CLI context
node $env:OBSITERM_CONTEXT_CLI note
node $env:OBSITERM_CONTEXT_CLI selection-prompt --text
node $env:OBSITERM_CONTEXT_CLI note-prompt --text
node $env:OBSITERM_CONTEXT_CLI mcp-config
```

This fallback is the preferred path for clients that do not yet have stable MCP
support.

## What To Tell The Agent

When asking an agent to self-configure against ObsiTerm, provide these rules:

1. Read this file first.
2. Only attempt MCP setup from a shell started by ObsiTerm.
3. Prefer MCP when the client supports stdio MCP registration.
4. Fall back to `OBSITERM_CONTEXT_CLI` when MCP is unavailable or unsupported.
5. Validate by fetching either:
   - `get_current_selection`
   - `get_obsidian_context`
   - or `selection-prompt --text`

## Troubleshooting

If MCP does not connect:

1. Confirm the plugin runtime directory contains:
   - `resources/obsiterm-mcp.mjs`
   - `resources/obsiterm-context.mjs`
2. Confirm the agent was started from inside ObsiTerm.
3. Confirm ObsiTerm is running and at least one terminal tab is open.
4. Confirm the MCP config points to the local vault's actual plugin path.
5. If needed, test the fallback CLI:

```powershell
node $env:OBSITERM_CONTEXT_CLI context
node $env:OBSITERM_CONTEXT_CLI selection-prompt --text
```
