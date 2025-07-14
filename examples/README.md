# Claude Context Examples

This directory contains example configurations and setups for different project types.

## Available Examples

### 🚀 [Next.js Example](./nextjs-example.md)
Full-stack Next.js 14 application with:
- App Router and Server Components
- TypeScript and Prisma ORM
- E-commerce project structure
- Custom health checks for builds

### 🐍 [Python Example](./python-example.md)
FastAPI data processing pipeline with:
- Async Python with type hints
- Repository pattern
- Celery task queue
- Comprehensive testing setup

### 🟢 [Node.js API Example](./node-api-example.md)
Express.js REST API with:
- TypeScript and clean architecture
- JWT authentication
- WebSocket integration
- Repository and service patterns

## Quick Start

1. Choose an example that matches your project type
2. Copy the CLAUDE.md content to your project
3. Adapt the configuration to your needs
4. Customize patterns and guidelines

## Creating Your Own

If your project doesn't match these examples:

1. Start with the generic template:
   ```bash
   npx create-claude-context --type generic
   ```

2. Customize CLAUDE.md with your:
   - Technology stack
   - Architecture decisions
   - Coding patterns
   - Common issues

3. Add project-specific configuration:
   ```json
   {
     "project": {
       "type": "generic",
       "name": "your-project"
     }
   }
   ```

## Contributing Examples

Have a great Claude Context setup for a different framework? Contribute an example:

1. Create a new markdown file: `framework-example.md`
2. Include:
   - Installation steps
   - Complete CLAUDE.md example
   - Custom configuration
   - Project-specific patterns
3. Submit a pull request

## Tips for Examples

- **Be specific** - Include real patterns from actual projects
- **Show common scenarios** - Error handling, testing, deployment
- **Include troubleshooting** - Common issues and solutions
- **Add custom scripts** - Project-specific npm scripts
- **Document decisions** - Explain why certain patterns are used