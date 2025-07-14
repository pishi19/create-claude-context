# Claude Context - Quick Reference Card

## 🚀 Installation
```bash
npx create-claude-context
```

## 📍 Essential Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `npm run claude:start` | Start development session | - |
| `npm run claude:end` | End session with summary | - |
| `npm run claude:dashboard` | Open interactive dashboard | - |
| `npm run claude:todos` | Extract all TODOs | - |
| `npm run claude:update` | Update context manually | - |
| `npm run claude:quick` | Quick status check | - |

## ⌨️ Dashboard Shortcuts

| Key | Action |
|-----|--------|
| `r` | Refresh display |
| `u` | Update context |
| `t` | Run tests |
| `c` | TypeScript check |
| `l` | Run linter |
| `g` | Git status |
| `q` | Quit |

## 📁 Directory Structure
```
.claude/
├── cache/          # Temporary cache
├── config.json     # Configuration
├── index.md        # Current context
├── scripts/        # Claude scripts
└── sessions/       # Session history
```

## 🔧 Key Configuration
```json
{
  "context": {
    "autoUpdateInterval": 300000,  // 5 min
    "excludePatterns": ["**/node_modules/**"]
  }
}
```

## 💡 Daily Workflow
```bash
# Morning
npm run claude:start

# During work
npm run claude:dashboard  # Monitor progress

# End of day
npm run claude:end
```

## 🎯 TODO Patterns
```javascript
// TODO: Description
// FIXME: Bug to fix
// NOTE: Important note
// HACK: Temporary solution
```

## 🚨 Common Fixes

**No active session**
```bash
npm run claude:start
```

**Context not updating**
```bash
npm run claude:update
rm -rf .claude/cache/*
```

**Dashboard issues**
```bash
npm install --save-dev chalk@4.1.2
```

## 📝 CLAUDE.md Template
```markdown
# CLAUDE.md

## Project Overview
[What it does]

## Current Focus
- **Active**: [Current task]
- **Progress**: X%

## Architecture
[Key decisions]

## Remember
1. [Key principle]
2. [Key principle]
```

---
🔗 Full docs: `docs/USER_GUIDE.md`