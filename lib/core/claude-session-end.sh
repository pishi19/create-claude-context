#!/bin/bash
# Enhanced session end script that merges existing functionality with Claude context

echo "🤖 Ending Claude Context + Claude development session..."

# Get session stats
COMMITS=$(git log --since="8 hours ago" --oneline | wc -l)
MODIFIED=$(git status --porcelain | wc -l)
BRANCH=$(git branch --show-current)

# Update Claude context one more time
echo -e "\n📝 Final context update..."
node .claude/scripts/update-claude-context.js

# Extract TODOs from uncommitted changes
echo -e "\n📋 Extracting TODOs from changes..."
TODOS=$(git diff | grep -E "^\+.*TODO|^\+.*FIXME" | sed 's/^+//' | sed 's/^[ \t]*/- [ ] /')

# Update session log
echo -e "\n📝 Updating session log..."
{
  echo "**Completed:**"
  echo "- ✅ Commits made: $COMMITS"
  git log --since="8 hours ago" --oneline | sed 's/^/- ✅ /'
  echo ""
  echo "**TODO:**"
  if [ -n "$TODOS" ]; then
    echo "$TODOS"
  else
    echo "- [ ] No new TODOs found in changes"
  fi
  echo ""
  echo "**Session End:** $(date +%H:%M)"
  echo "**Modified files remaining:** $MODIFIED"
  echo ""
  echo "---"
} >> .claude/session-log.md

# Update current bug status
if [ -f ".claude/current-bug.md" ]; then
  echo -e "\n🐛 Current bug status:"
  head -5 .claude/current-bug.md | grep -A 2 "## Status"
fi

# Show session summary
echo -e "\n📊 Session Summary:"
echo "  Branch: $BRANCH"
echo "  Commits: $COMMITS"
echo "  Modified files: $MODIFIED"

# Remind about uncommitted changes
if [ $MODIFIED -gt 0 ]; then
  echo -e "\n⚠️  You have $MODIFIED uncommitted changes!"
  echo "  Consider committing or stashing before ending session."
fi

echo -e "\n✅ Session ended. Context saved to .claude/"
echo "  Next session: Run 'npm run claude:start' to resume"