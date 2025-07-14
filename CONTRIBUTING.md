# Contributing to Claude Context

First off, thank you for considering contributing to Claude Context! It's people like you that make Claude Context such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible using the issue template.

**Great Bug Reports** tend to have:
- A quick summary and/or background
- Steps to reproduce
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:
- A clear and descriptive title
- A detailed description of the proposed enhancement
- Examples of how the enhancement would be used
- Why this enhancement would be useful to most users

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code follows the existing style
6. Issue that pull request!

## Development Setup

1. Fork and clone the repository
```bash
git clone https://github.com/yourusername/create-claude-context.git
cd create-claude-context
```

2. Install dependencies
```bash
npm install
```

3. Create a test project
```bash
mkdir test-project
cd test-project
node ../bin/create-claude-context.js
```

## Project Structure

```
create-claude-context/
├── bin/                 # CLI executables
├── lib/                 # Core library code
│   ├── core/           # Claude scripts
│   ├── templates/      # Project templates
│   └── utils/          # Utility functions
├── docs/               # Documentation
├── examples/           # Example configurations
└── test/               # Test files
```

## Coding Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Follow existing patterns in the codebase

### Example
```javascript
const config = {
  name: 'example',
  type: 'node',
  features: [
    'dashboard',
    'todos',
  ],
};
```

## Testing

We use Jest for testing. Run tests with:

```bash
npm test
```

Write tests for any new functionality:

```javascript
describe('featureName', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expectedResult);
  });
});
```

## Documentation

- Update README.md if you change functionality
- Update API.md if you change the API
- Add JSDoc comments to new functions
- Include examples in documentation

## Commit Messages

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only changes
- `style:` - Code style changes (formatting, etc)
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `perf:` - Performance improvement
- `test:` - Adding missing tests
- `chore:` - Changes to the build process or auxiliary tools

Examples:
```
feat: add Python project type support
fix: correct path resolution on Windows
docs: update API examples for TypeScript
```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Commit changes: `git commit -m "chore: release v1.2.3"`
4. Tag release: `git tag v1.2.3`
5. Push: `git push origin main --tags`
6. GitHub Actions will automatically publish to npm

## Adding New Project Types

To add support for a new project type:

1. Add detection logic in `lib/utils/project.js`
2. Create configuration in `getProjectConfig()`
3. Add example in `examples/[type]-example.md`
4. Update documentation
5. Add tests

Example:
```javascript
// In detectProjectType()
if (fs.existsSync(path.join(projectPath, 'Gemfile'))) {
  return 'ruby';
}

// In getProjectConfig()
ruby: {
  buildCommand: 'bundle install',
  testCommand: 'rspec',
  excludePatterns: ['vendor/**', '.bundle/**'],
  todoPatterns: ['*.rb', '*.rake']
}
```

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🎉