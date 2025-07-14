# Claude Context System

This directory contains the Claude Context System for {{PROJECT_NAME}}.

## Quick Start

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

## Directory Structure

```
.claude/
├── cache/          # Cached context data
├── history/        # Historical context snapshots
├── logs/           # Session logs
├── scripts/        # Claude Context scripts
├── sessions/       # Session archives
├── config.json     # Configuration
├── index.md        # Current context
└── README.md       # This file
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run claude:start` | Start a new development session |
| `npm run claude:end` | End session and generate summary |
| `npm run claude:dashboard` | Open interactive monitoring dashboard |
| `npm run claude:update` | Update context manually |
| `npm run claude:todos` | Extract all TODOs from codebase |
| `npm run claude:priorities` | View current priorities |
| `npm run claude:quick` | Quick status check |

## Dashboard Shortcuts

When running `npm run claude:dashboard`:

- `r` - Refresh display
- `u` - Update context
- `t` - Run tests
- `c` - Check types
- `q` - Quit

## Configuration

Edit `config.json` to customize:
- Update intervals
- File patterns
- Feature toggles
- Project paths

## Tips

1. **Start each day with**: `npm run claude:start`
2. **End each session with**: `npm run claude:end`
3. **Check progress**: `npm run claude:dashboard`
4. **Stay organized**: Update CLAUDE.md regularly

## Troubleshooting

**Context not updating?**
- Check file permissions in `.claude/`
- Verify git is initialized
- Check exclude patterns in config.json

**Dashboard not working?**
- Ensure chalk is installed: `npm install --save-dev chalk`
- Check Node.js version (>=14 required)

**TODOs not found?**
- Verify file patterns in config.json
- Check that files aren't in excludePatterns

For more help, see the [Claude Context documentation](https://github.com/yourusername/create-claude-context).