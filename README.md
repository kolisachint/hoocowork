# HooCowork

![HooCowork Logo](public/logo.svg)

[![CI](https://github.com/kolisachint/hoocowork/actions/workflows/ci.yml/badge.svg)](https://github.com/kolisachint/hoocowork/actions)
[![npm](https://img.shields.io/npm/v/@kolisachint/hoocowork)](https://www.npmjs.com/package/@kolisachint/hoocowork)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)](LICENSE)

A desktop and mobile UI for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor CLI](https://docs.cursor.com/en/cli/overview), [Codex](https://developers.openai.com/codex), and [Gemini-CLI](https://geminicli.com/). Use it locally or remotely to view your active projects and sessions from anywhere.

**[Website](https://hoocowork.app)** • **[Documentation](https://hoocowork.app/docs)** • **[Discord](https://discord.gg/buxwujPNRE)** • **[Issues](https://github.com/kolisachint/hoocowork/issues)** • **[Contributing](CONTRIBUTING.md)**

---

**Translations:** [Русский](./README.ru.md) • [Deutsch](./README.de.md) • [한국어](./README.ko.md) • [中文](./README.zh-CN.md) • [日本語](./README.ja.md) • [Türkçe](./README.tr.md)

---

## Screenshots

### Desktop View
![Desktop Interface](public/screenshots/desktop-main.png)
*Main interface showing project overview and chat*

### Mobile Experience
![Mobile Interface](public/screenshots/mobile-chat.png)
*Responsive mobile design with touch navigation*

### CLI Selection
![CLI Selection](public/screenshots/cli-selection.png)
*Select between Claude Code, Gemini, Cursor CLI and Codex*

## Features

- **Responsive Design** - Works seamlessly across desktop, tablet, and mobile
- **Multi-Agent Support** - Claude Code, Cursor CLI, OpenAI Codex, and Gemini CLI
- **Interactive Chat Interface** - Built-in chat with markdown rendering and code blocks
- **Integrated Shell Terminal** - Direct access to the CLI through built-in terminal emulator
- **File Explorer** - Interactive file tree with syntax highlighting and live editing
- **Git Explorer** - View, stage and commit changes; switch branches
- **Session Management** - Resume conversations, manage multiple sessions, track history
- **Plugin System** - Extend with custom plugins; add tabs, backend services, integrations
- **MCP Configuration** - Visual management of Model Context Protocol servers
- **Standalone Binaries** - No Node.js required; native executables for all platforms
- **REST API** - Full API for external integrations

## Quick Start

### Option 1: HooCowork Cloud (Recommended)

The fastest way to get started — no local setup required. Get a fully managed, containerized development environment accessible from the web, mobile app, API, or your favorite IDE.

**[Get started with HooCowork](https://hoocowork.app)**

### Option 2: Self-Hosted (npm)

Try instantly with **npx** (requires **Node.js** v22+):

```bash
npx @kolisachint/hoocowork
```

Or install globally:

```bash
npm install -g @kolisachint/hoocowork
hoocowork
```

Open `http://localhost:3001` — all existing sessions are discovered automatically.

### Option 3: Standalone Binary

Download pre-built binaries from [GitHub Releases](https://github.com/kolisachint/hoocowork/releases) — no Node.js required:

| Platform | Binary |
|----------|--------|
| Windows x64 | `hoocowork-win-x64.exe` |
| macOS ARM64 | `hoocowork-darwin-arm64` |
| macOS x64 | `hoocowork-darwin-x64` |
| Linux x64 | `hoocowork-linux-x64` |
| Linux ARM64 | `hoocowork-linux-arm64` |

```bash
# Example: macOS
chmod +x hoocowork-darwin-arm64
./hoocowork-darwin-arm64
```

### Option 4: Docker Sandbox (Experimental)

Run agents in isolated sandboxes with hypervisor-level isolation. Requires the [`sbx` CLI](https://docs.docker.com/ai/sandboxes/get-started/).

```bash
npx @kolisachint/hoocowork@latest sandbox ~/my-project
```

Supports Claude Code, Codex, and Gemini CLI. See [sandbox docs](docker/) for details.

---

## Comparison

| Feature | Self-Hosted (npm) | Binary | Docker Sandbox |
|---------|-------------------|--------|----------------|
| **Best for** | Local development | Users without Node.js | Isolated environments |
| **Setup** | `npx @kolisachint/hoocowork` | Download & run | `npx ... sandbox` |
| **Isolation** | Host | Host | MicroVM |
| **Mobile access** | Yes | Yes | Yes |
| **Agents** | All 4 | All 4 | Claude, Codex, Gemini |
| **File/Git UI** | Yes | Yes | Yes |
| **MCP sync** | `~/.claude` | `~/.claude` | UI-managed |
| **REST API** | Yes | Yes | Yes |

All options require your own AI subscription (Claude, Cursor, OpenAI, or Google).

---

## Security & Tools Configuration

**Important**: All Claude Code tools are **disabled by default** to prevent potentially harmful automatic operations.

To enable tools:
1. Click the gear icon in the sidebar
2. Enable only the tools you need
3. Settings are saved locally

![Tools Settings Modal](public/screenshots/tools-modal.png)

---

## Plugins

HooCowork has a plugin system for adding custom tabs with frontend UI and optional Node.js backend.

### Available Plugins

| Plugin | Description |
|--------|-------------|
| [Project Stats](https://github.com/kolisachint/hoocowork-plugin-starter) | File counts, lines of code, file-type breakdown |
| [Web Terminal](https://github.com/kolisachint/hoocowork-plugin-terminal) | Full xterm.js terminal with multi-tab support |
| [Scheduler](https://github.com/grostim/hoocowork-cron) | Workspace-scoped scheduled prompts |

### Build Your Own

- **[Plugin Starter](https://github.com/kolisachint/hoocowork-plugin-starter)** — fork to create custom plugins
- **[Plugin Docs](https://hoocowork.app/docs/plugin-overview)** — full API reference

---

## Development

```bash
# Clone the repository
git clone https://github.com/kolisachint/hoocowork.git
cd hoocowork

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

Both `npm` and `bun` are supported. The CI uses `bun` for faster builds.

### Building Binaries

```bash
# Current platform
bun run build:binary

# Windows (from any platform)
bun run build:binary:windows

# All platforms
bun run build:binary:all
```

---

## Configuration

Configuration priority (highest to lowest):
1. CLI arguments (`--port`, `--database-path`)
2. Environment variables
3. `~/.hoocowork/.env` file
4. Embedded defaults (binaries only)

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `3001` | Backend server port |
| `HOST` | `0.0.0.0` | Bind address |
| `DATABASE_PATH` | `~/.hoocowork/auth.db` | SQLite database |
| `CLAUDE_CLI_PATH` | `claude` | Claude CLI command |
| `CONTEXT_WINDOW` | `160000` | Context window size |

---

## FAQ

**How is this different from Claude Code Remote Control?**

Remote Control exposes a single active session for the mobile app. HooCowork auto-discovers all sessions from `~/.claude`, provides a full UI with file explorer and Git integration, and works with multiple agents (Claude, Cursor, Codex, Gemini).

**Do I need to pay for an AI subscription separately?**

Yes. HooCowork provides the environment, not the AI. You bring your own subscriptions.

**Can I use HooCowork on my phone?**

Yes. Run the server on your machine and open `[yourip]:port` in any browser on your network.

**Will changes I make in the UI affect my local Claude Code setup?**

Yes. HooCowork reads from and writes to the same `~/.claude` config that Claude Code uses natively.

---

## Project Structure

```
hoocowork/
├── src/              # React frontend (Vite + Tailwind)
├── server/           # Express backend
├── shared/           # Shared code between client and server
├── scripts/          # Build and utility scripts
├── docker/           # Docker Sandbox templates
├── public/           # Static assets
└── docs/             # Documentation
```

---

## Community & Support

- [Documentation](https://hoocowork.app/docs)
- [GitHub Issues](https://github.com/kolisachint/hoocowork/issues)
- [Discord](https://discord.gg/buxwujPNRE)
- [Contributing Guide](CONTRIBUTING.md)
- [Release Notes](RELEASING.md)

---

## License

GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)

See [LICENSE](LICENSE) for full text, including additional terms under Section 7.

---

## Acknowledgments

### Core Technologies
- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Build tool
- [Tailwind CSS](https://tailwindcss.com/) — CSS framework
- [Express](https://expressjs.com/) — Backend framework
- [CodeMirror](https://codemirror.net/) — Code editor
- [xterm.js](https://xtermjs.org/) — Terminal emulator
- [Bun](https://bun.sh/) — JavaScript runtime and bundler

### AI Agent Support
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — Anthropic
- [Cursor CLI](https://docs.cursor.com/en/cli/overview) — Cursor
- [Codex](https://developers.openai.com/codex) — OpenAI
- [Gemini CLI](https://geminicli.com/) — Google

### Contributors
See [GitHub Contributors](https://github.com/kolisachint/hoocowork/graphs/contributors) for a full list.

---

Made with care for the AI coding agent community.
