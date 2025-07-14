#!/bin/bash
# Enhanced session start script that merges existing functionality with Claude context

echo "🤖 Starting Claude Context + Claude development session..."
echo "📅 $(date)"

# Update Claude context first
echo -e "\n📝 Updating Claude context..."
node scripts/update-claude-context.js

# Display Claude quick context
echo -e "\n🚀 Quick Context:"
head -15 .claude/index.md

# Display current state from existing workflow
echo -e "\n📍 Project Status:"
head -n 20 docs/ora-roadmap-milestones.md 2>/dev/null | grep -A 5 "Current Position" || echo "No roadmap status found"

# Log session start (compatible with existing workflow)
if [ -f "docs/DEVELOPMENT_LOG.md" ]; then
  echo -e "\n## Session: $(date '+%Y-%m-%d %H:%M')" >> docs/DEVELOPMENT_LOG.md
  echo "**Goal**: " >> docs/DEVELOPMENT_LOG.md
fi

# Also log to Claude session log
echo -e "\n## $(date +%Y-%m-%d) Session - $(date +%H:%M)" >> .claude/session-log.md
echo "**Starting context:**" >> .claude/session-log.md
echo "- Branch: $(git branch --show-current)" >> .claude/session-log.md
echo "- Modified files: $(git status --porcelain | wc -l)" >> .claude/session-log.md
echo "" >> .claude/session-log.md

echo -e "\n✅ Session started. Remember:"
echo "  - Run 'npm run claude:update' to refresh context"
echo "  - Use 'npm run claude:end' to wrap up session"
echo "  - Commit after each component"
echo "  - Check .claude/current-bug.md for active issues"

# Start dev server if requested
if [ "$1" == "--dev" ]; then
  echo -e "\n🔧 Starting development server..."
  pnpm dev
fi