# create-claude-context

> 🤖 Initialize Claude Context System for any project - Intelligent development workflow management

[![npm version](https://img.shields.io/npm/v/create-claude-context.svg)](https://www.npmjs.com/package/create-claude-context)
[![npm downloads](https://img.shields.io/npm/dm/create-claude-context.svg)](https://www.npmjs.com/package/create-claude-context)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/create-claude-context.svg)](https://nodejs.org)
[![GitHub issues](https://img.shields.io/github/issues/pishi19/create-claude-context.svg)](https://github.com/pishi19/create-claude-context/issues)
[![GitHub stars](https://img.shields.io/github/stars/pishi19/create-claude-context.svg)](https://github.com/pishi19/create-claude-context/stargazers)

## What is Claude Context?

Claude Context is a development workflow management system that helps you maintain context, track progress, and optimize your development sessions when working with Claude or other AI assistants. It provides:

- 📊 **Session Tracking** - Monitor development time and progress
- 🎯 **TODO Extraction** - Automatically find and track TODOs across your codebase
- 📈 **Interactive Dashboard** - Real-time monitoring of your development session
- 🔄 **Context Updates** - Keep your AI assistant informed of project changes
- 📝 **Milestone Tracking** - Track progress against your roadmap
- 🐛 **Bug Detection** - Automatically detect and track errors

## Installation

### From NPM (when published)
```bash
npx create-claude-context
```

### From GitHub
```bash
# Direct from GitHub
npx github:pishi19/create-claude-context

# Or install globally
npm install -g github:pishi19/create-claude-context
create-claude-context
```

## Quick Start

```bash
# Initialize Claude Context in your project
npx create-claude-context

# Or with options
npx create-claude-context my-project --type nextjs
```

## Usage

Once installed, you'll have access to these commands:

```bash
# Start a development session
npm run claude:start

# Open interactive dashboard
npm run claude:dashboard

# Extract TODOs from codebase
npm run claude:todos

# End session with summary
npm run claude:end
```

## Dashboard

The interactive dashboard (`npm run claude:dashboard`) provides real-time monitoring:

```
🤖 Claude Context Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Session: 2h 15m | 💾 3 commits | 📝 12 files modified

🎯 Current Focus
├─ Milestone: Feature Implementation
├─ Progress: 75% complete
└─ Next: Add unit tests

⚡ Quick Actions
├─ [r] Refresh
├─ [u] Update context
├─ [t] Run tests
└─ [q] Quit
```

## Project Types

Claude Context adapts to your project type:

- **Next.js** - React components, API routes, build checks
- **Node.js** - API endpoints, test coverage, linting
- **Python** - Module tracking, pytest integration, pylint
- **Generic** - Works with any project structure

## Configuration

The `.claude/config.json` file allows customization:

```json
{
  "project": {
    "name": "my-project",
    "type": "nextjs",
    "mainBranch": "main"
  },
  "context": {
    "autoUpdateInterval": 300000,
    "excludePatterns": ["**/node_modules/**", "**/dist/**"]
  }
}
```

## CLAUDE.md

Create a `CLAUDE.md` file in your project root to provide guidelines for AI assistants:

```markdown
# CLAUDE.md

Essential guidelines for AI assistants working on this project.

## Project Overview
[Your project description]

## Architecture
[Key architectural decisions]

## Development Workflow
[Your team's workflow]

## Remember
1. [Important principle 1]
2. [Important principle 2]
```

## Features

### Session Tracking
- Automatic time tracking with break detection
- Commit and file change monitoring
- Session summaries and archives

### Context Management
- Automatic context updates every 5 minutes
- Git-aware context generation
- Caching for performance

### TODO Extraction
- Scans code for TODO/FIXME comments
- Extracts unchecked items from markdown
- Finds FIX: commits in git history
- Aggregates from multiple sources

### Interactive Dashboard
- Real-time session monitoring
- Health checks (TypeScript, tests, linting)
- Quick actions and shortcuts
- Progress visualization

## Installation for Development

```bash
# Clone the repository
git clone https://github.com/pishi19/create-claude-context.git

# Install dependencies
cd create-claude-context
npm install

# Link for local testing
npm link

# Test in another project
cd /path/to/test-project
npx create-claude-context
```

## API

### Programmatic Usage

```javascript
const { initializeProject, updateContext } = require('create-claude-context');

// Initialize Claude Context
await initializeProject({
  projectName: 'my-project',
  projectType: 'nextjs',
  projectDescription: 'My awesome project'
});

// Update context programmatically
await updateContext();
```

### CLI Options

```bash
create-claude-context [project-name] [options]

Options:
  -t, --type <type>    Project type (nextjs, node, python, generic)
  -s, --skip-install   Skip npm install
  -y, --yes           Use defaults without prompting
  -h, --help          Display help
  -V, --version       Display version
```

## Directory Structure

After initialization, Claude Context creates:

```
.claude/
├── cache/          # Cached context data
├── history/        # Historical snapshots
├── logs/           # Session logs
├── scripts/        # Core scripts
├── sessions/       # Archived sessions
├── config.json     # Configuration
├── index.md        # Current context
└── README.md       # Documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Your Name]

## Acknowledgments

Inspired by the need for better context management when working with AI coding assistants.