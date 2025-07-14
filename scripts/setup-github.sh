#!/bin/bash

# GitHub Setup Script for Claude Context

echo "🚀 Claude Context - GitHub Setup Helper"
echo "======================================"
echo ""
echo "This script will help you set up your GitHub repository."
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Get repository name (default to create-claude-context)
read -p "Enter repository name (default: create-claude-context): " REPO_NAME
REPO_NAME=${REPO_NAME:-create-claude-context}

# Update package.json with correct URLs
echo "📝 Updating package.json with your GitHub details..."
sed -i.bak "s/yourusername/$GITHUB_USERNAME/g" package.json
sed -i.bak "s/yourusername/$GITHUB_USERNAME/g" README.md
sed -i.bak "s/yourusername/$GITHUB_USERNAME/g" .github/dependabot.yml
sed -i.bak "s/Your Name/$GITHUB_USERNAME/g" LICENSE
rm *.bak
rm .github/*.bak

echo "✅ Files updated!"
echo ""

# Instructions for GitHub
echo "📋 Next Steps:"
echo "============="
echo ""
echo "1. Create a new repository on GitHub:"
echo "   https://github.com/new"
echo "   - Name: $REPO_NAME"
echo "   - Description: Initialize Claude Context System for any project"
echo "   - Public repository"
echo "   - Do NOT initialize with README, license, or gitignore"
echo ""
echo "2. Add the remote origin:"
echo "   git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo ""
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "4. Set up NPM publishing token:"
echo "   - Get token from: https://www.npmjs.com/settings/[your-npm-username]/tokens"
echo "   - Add as GitHub secret: https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/secrets/actions"
echo "   - Name: NPM_TOKEN"
echo ""
echo "5. Create initial release:"
echo "   - Go to: https://github.com/$GITHUB_USERNAME/$REPO_NAME/releases/new"
echo "   - Tag: v1.0.0"
echo "   - Title: Initial Release"
echo "   - Description: Copy from CHANGELOG.md"
echo ""
echo "6. After release, the package will be automatically published to npm!"
echo ""
echo "Optional: Update repository settings"
echo "   - Add topics: cli, npm, developer-tools, claude, context, ai-assistant"
echo "   - Add description: Initialize Claude Context System for any project"
echo "   - Add website: https://www.npmjs.com/package/$REPO_NAME"
echo ""

# Git commands summary
echo "📦 Git Commands Summary:"
echo "======================="
echo "git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo "git push -u origin main"
echo ""

# Commit the changes
echo "💾 Committing personalization changes..."
git add -A
git commit -m "chore: personalize package for $GITHUB_USERNAME" || echo "No changes to commit"

echo ""
echo "✨ Setup script complete! Follow the steps above to finish GitHub setup."