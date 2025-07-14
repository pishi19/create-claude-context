# GitHub Setup Guide for Claude Context

This guide will walk you through setting up your Claude Context repository on GitHub and publishing to npm.

## Prerequisites

- GitHub account
- npm account (create at https://www.npmjs.com/signup)
- Git installed locally
- Node.js 14+ installed

## Step 1: Personalize the Package

Run the setup script to personalize all files with your information:

```bash
./scripts/setup-github.sh
```

This will:
- Update package.json with your GitHub username
- Update all documentation links
- Update LICENSE with your name
- Prepare everything for publishing

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository with:
   - **Repository name**: `create-claude-context`
   - **Description**: `Initialize Claude Context System for any project - Intelligent development workflow management`
   - **Public** repository
   - **DO NOT** initialize with README, license, or .gitignore

## Step 3: Push to GitHub

```bash
# Add your repository as origin
git remote add origin https://github.com/YOUR_USERNAME/create-claude-context.git

# Push the code
git push -u origin main
```

## Step 4: Configure Repository Settings

### Add Topics
Go to repository settings and add these topics:
- `cli`
- `npm`
- `developer-tools`
- `claude`
- `context`
- `ai-assistant`
- `workflow`
- `productivity`

### Configure Branch Protection (Optional)
1. Go to Settings → Branches
2. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks (test workflow)
   - Require branches to be up to date

## Step 5: Set Up NPM Publishing

### Get NPM Token
1. Log in to https://www.npmjs.com
2. Go to Access Tokens: https://www.npmjs.com/settings/YOUR_NPM_USERNAME/tokens
3. Create new token:
   - Type: `Automation`
   - Name: `github-actions-create-claude-context`
4. Copy the token

### Add Token to GitHub
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Paste your npm token
5. Click "Add secret"

## Step 6: Test the Setup

### Run Tests Locally
```bash
npm test
npm run lint
```

### Test GitHub Actions
1. Create a test branch:
   ```bash
   git checkout -b test/github-actions
   git push origin test/github-actions
   ```

2. Create a pull request
3. Verify that tests run automatically

## Step 7: Publish First Release

### Option A: Manual Release (Recommended for First Release)

1. Ensure everything is committed:
   ```bash
   git add -A
   git commit -m "chore: prepare for v1.0.0 release"
   git push
   ```

2. Create a Git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. Create GitHub Release:
   - Go to https://github.com/YOUR_USERNAME/create-claude-context/releases/new
   - Choose tag: `v1.0.0`
   - Release title: `v1.0.0 - Initial Release`
   - Description:
     ```markdown
     ## 🎉 Initial Release

     First release of Claude Context System!

     ### Features
     - 🚀 Quick initialization with `npx create-claude-context`
     - 📊 Interactive dashboard for session monitoring
     - 🎯 Automatic TODO extraction
     - ⏱️ Session tracking with time management
     - 🔄 Auto-updating context
     - 📚 Comprehensive documentation

     ### Supported Project Types
     - Next.js
     - Node.js
     - Python
     - Generic (any project)

     ### Installation
     ```bash
     npx create-claude-context
     ```

     See [documentation](https://github.com/YOUR_USERNAME/create-claude-context#readme) for more details.
     ```

4. Click "Publish release"
5. GitHub Actions will automatically publish to npm!

### Option B: Manual NPM Publish (If Actions Fail)

```bash
# Login to npm
npm login

# Publish
npm publish

# Verify
npm info create-claude-context
```

## Step 8: Verify Everything Works

### Test Installation
```bash
# In a different directory
cd /tmp
mkdir test-install
cd test-install
npx create-claude-context my-test-project
```

### Check npm Page
Visit: https://www.npmjs.com/package/create-claude-context

### Update GitHub Repository
Add the npm badge URL to repository website field

## Step 9: Announce Your Package! 🎉

### Where to Share
- Twitter/X with hashtags: #npm #opensource #developertools
- Reddit: r/node, r/javascript, r/programming
- Dev.to article about the project
- LinkedIn post
- Discord/Slack developer communities

### Example Announcement
```
🚀 Just published create-claude-context to npm!

A tool that helps developers maintain context when working with AI assistants like Claude.

✨ Features:
- Session tracking
- TODO extraction  
- Interactive dashboard
- Auto-updating context

Try it: npx create-claude-context

GitHub: https://github.com/YOUR_USERNAME/create-claude-context
```

## Maintenance

### Regular Updates
- Review and merge Dependabot PRs
- Address issues promptly
- Update documentation based on feedback

### Releasing Updates
1. Update version in package.json
2. Update CHANGELOG.md
3. Commit: `git commit -m "chore: release v1.0.1"`
4. Tag: `git tag v1.0.1`
5. Push: `git push origin main --tags`
6. Create GitHub release → Auto publishes to npm

## Troubleshooting

### NPM Publish Fails
- Check NPM_TOKEN is set correctly in GitHub secrets
- Ensure you're not trying to publish existing version
- Check npm account has publish permissions

### GitHub Actions Fail
- Check Actions tab for error logs
- Ensure all secrets are set
- Verify package.json is valid

### Package Not Found After Publish
- Wait 1-2 minutes for npm to index
- Try clearing npm cache: `npm cache clean --force`
- Check: https://www.npmjs.com/package/create-claude-context

## Success! 🎊

Congratulations! Your Claude Context package is now:
- ✅ On GitHub with CI/CD
- ✅ Published to npm
- ✅ Ready for the community
- ✅ Automatically tested and deployed

Happy coding with Claude Context! 🤖✨