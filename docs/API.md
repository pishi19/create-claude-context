# Claude Context API Reference

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Core API](#core-api)
4. [CLI API](#cli-api)
5. [Configuration API](#configuration-api)
6. [Event Hooks](#event-hooks)
7. [Plugin System](#plugin-system)
8. [TypeScript Support](#typescript-support)

## Overview

The Claude Context API allows programmatic access to all features of the Claude Context System. You can integrate it into your build tools, CI/CD pipelines, or create custom workflows.

## Installation

```bash
npm install create-claude-context
```

## Core API

### Importing

```javascript
const {
  initializeProject,
  updateProject,
  startSession,
  endSession,
  updateContext,
  extractTodos,
  getSessionInfo,
  getProjectConfig
} = require('create-claude-context');
```

### initializeProject(config)

Initialize Claude Context in a project.

```javascript
await initializeProject({
  projectName: 'my-project',
  projectType: 'nextjs',
  projectDescription: 'My awesome Next.js app',
  installDependencies: true
});
```

**Parameters:**
- `config` (object):
  - `projectName` (string): Project name
  - `projectType` (string): One of 'nextjs', 'node', 'python', 'generic'
  - `projectDescription` (string): Brief description
  - `installDependencies` (boolean): Whether to install dependencies

**Returns:** Promise<void>

### updateProject()

Update an existing Claude Context installation to the latest version.

```javascript
await updateProject();
```

**Returns:** Promise<void>

### startSession()

Start a new development session.

```javascript
const session = await startSession();
console.log(`Session started at ${session.startTime}`);
```

**Returns:** Promise<Session>
```typescript
interface Session {
  id: string;
  startTime: number;
  pid: number;
}
```

### endSession()

End the current development session.

```javascript
const summary = await endSession();
console.log(`Session duration: ${summary.duration}`);
console.log(`Commits made: ${summary.commits}`);
```

**Returns:** Promise<SessionSummary>
```typescript
interface SessionSummary {
  duration: string;
  commits: number;
  filesModified: string[];
  todos: {
    completed: number;
    added: number;
  };
}
```

### updateContext(options)

Update the project context.

```javascript
const result = await updateContext({
  force: true,
  includeGitHistory: true,
  maxHistoryDays: 7
});
```

**Parameters:**
- `options` (object):
  - `force` (boolean): Skip cache
  - `includeGitHistory` (boolean): Include git history
  - `maxHistoryDays` (number): Days of history to include

**Returns:** Promise<ContextResult>
```typescript
interface ContextResult {
  updated: boolean;
  cachHit: boolean;
  files: string[];
  size: number;
}
```

### extractTodos(options)

Extract TODO items from the codebase.

```javascript
const todos = await extractTodos({
  includeCompleted: false,
  groupByFile: true,
  patterns: ['TODO', 'FIXME', 'HACK']
});
```

**Parameters:**
- `options` (object):
  - `includeCompleted` (boolean): Include completed TODOs
  - `groupByFile` (boolean): Group results by file
  - `patterns` (string[]): Patterns to search for

**Returns:** Promise<TodoResult>
```typescript
interface TodoResult {
  total: number;
  byType: {
    code: TodoItem[];
    markdown: TodoItem[];
    commits: TodoItem[];
  };
}

interface TodoItem {
  type: string;
  file: string;
  line: number;
  text: string;
  priority?: 'high' | 'medium' | 'low';
}
```

### getSessionInfo()

Get information about the current session.

```javascript
const info = await getSessionInfo();
if (info.active) {
  console.log(`Session duration: ${info.duration}`);
}
```

**Returns:** Promise<SessionInfo>
```typescript
interface SessionInfo {
  active: boolean;
  startTime?: number;
  duration?: string;
  commits?: number;
  filesModified?: string[];
}
```

### getProjectConfig()

Get the current project configuration.

```javascript
const config = await getProjectConfig();
console.log(`Project type: ${config.project.type}`);
```

**Returns:** Promise<ProjectConfig>
```typescript
interface ProjectConfig {
  project: {
    name: string;
    type: string;
    description: string;
  };
  context: {
    autoUpdateInterval: number;
    cacheTTL: number;
    excludePatterns: string[];
  };
  features: {
    [key: string]: boolean;
  };
}
```

## CLI API

### create-claude-context

Main initialization command.

```bash
create-claude-context [project-name] [options]
```

**Options:**
- `-t, --type <type>` - Project type (nextjs|node|python|generic)
- `-s, --skip-install` - Skip dependency installation
- `-y, --yes` - Use defaults without prompting
- `-V, --version` - Display version
- `-h, --help` - Display help

**Examples:**
```bash
# Interactive mode
create-claude-context

# With options
create-claude-context my-app --type nextjs --yes

# Update existing
create-claude-context update
```

### claude-context

Runtime command for Claude Context operations.

```bash
claude-context <command> [options]
```

**Commands:**
- `start` - Start development session
- `end` - End development session
- `status` - Show current status
- `update` - Update context
- `dashboard` - Open dashboard
- `todos` - Extract TODOs
- `init` - Initialize context

**Examples:**
```bash
# Check status
claude-context status

# Start session
claude-context start

# Open dashboard
claude-context dashboard
```

## Configuration API

### Loading Configuration

```javascript
const { loadConfig, saveConfig } = require('create-claude-context/config');

// Load current configuration
const config = await loadConfig();

// Modify configuration
config.context.autoUpdateInterval = 600000; // 10 minutes

// Save configuration
await saveConfig(config);
```

### Configuration Schema

```typescript
interface ClaudeConfig {
  project: {
    name: string;
    description: string;
    type: 'nextjs' | 'node' | 'python' | 'generic';
    mainBranch: string;
  };
  
  context: {
    autoUpdateInterval: number;      // milliseconds
    cacheTTL: number;               // milliseconds
    maxFileSize: number;            // bytes
    excludePatterns: string[];      // glob patterns
    includePatterns?: string[];     // glob patterns
  };
  
  features: {
    sessionTracking: boolean;
    dashboard: boolean;
    autoUpdate: boolean;
    githubIntegration: boolean;
    healthChecks: boolean;
    customChecks?: boolean;
  };
  
  paths: {
    roadmap: string;
    mainDoc: string;
    contextDir: string;
    customScripts?: string;
  };
  
  dashboard?: {
    refreshInterval: number;
    theme: 'default' | 'minimal' | 'compact';
    showTodos: boolean;
    showHealthChecks: boolean;
    customSections?: DashboardSection[];
  };
  
  healthChecks?: {
    typescript: boolean;
    tests: boolean;
    lint: boolean;
    build: boolean;
    custom?: HealthCheck[];
  };
}
```

### Environment Variables

```bash
# Override configuration via environment
export CLAUDE_CONTEXT_DIR=/custom/path/.claude
export CLAUDE_AUTO_UPDATE=false
export CLAUDE_UPDATE_INTERVAL=600000
export CLAUDE_DEBUG=true
```

## Event Hooks

### Registering Hooks

```javascript
const { registerHook } = require('create-claude-context/hooks');

// Register a pre-update hook
registerHook('pre-update', async (context) => {
  console.log('About to update context...');
  // Perform custom logic
  return true; // Return false to cancel
});

// Register a post-session hook
registerHook('post-session', async (summary) => {
  console.log(`Session ended: ${summary.duration}`);
  // Send to analytics, etc.
});
```

### Available Hooks

| Hook | Trigger | Parameters | Can Cancel |
|------|---------|------------|-------------|
| `pre-init` | Before initialization | config | Yes |
| `post-init` | After initialization | config | No |
| `pre-session` | Before session start | - | Yes |
| `post-session` | After session end | summary | No |
| `pre-update` | Before context update | options | Yes |
| `post-update` | After context update | result | No |
| `pre-todo` | Before TODO extraction | options | Yes |
| `post-todo` | After TODO extraction | todos | No |

### Hook Examples

```javascript
// Custom health check
registerHook('health-check', async () => {
  const dbConnected = await checkDatabase();
  return {
    name: 'Database',
    passed: dbConnected,
    message: dbConnected ? 'Connected' : 'Connection failed'
  };
});

// Custom TODO processor
registerHook('post-todo', async (todos) => {
  // Send high-priority TODOs to issue tracker
  const highPriority = todos.filter(t => t.priority === 'high');
  await createGitHubIssues(highPriority);
});

// Session analytics
registerHook('post-session', async (summary) => {
  await sendToAnalytics({
    duration: summary.duration,
    commits: summary.commits,
    productivity: calculateProductivity(summary)
  });
});
```

## Plugin System

### Creating a Plugin

```javascript
// claude-plugin-eslint.js
module.exports = {
  name: 'claude-eslint',
  version: '1.0.0',
  
  activate(context) {
    // Add ESLint health check
    context.addHealthCheck({
      name: 'ESLint',
      check: async () => {
        const { execSync } = require('child_process');
        try {
          execSync('npm run lint');
          return { passed: true, message: 'No lint errors' };
        } catch (error) {
          return { passed: false, message: error.message };
        }
      }
    });
    
    // Add lint command to dashboard
    context.addDashboardAction({
      key: 'e',
      label: 'Run ESLint',
      action: async () => {
        await context.runCommand('npm run lint');
      }
    });
  },
  
  deactivate(context) {
    // Cleanup if needed
  }
};
```

### Loading Plugins

```javascript
const { loadPlugin } = require('create-claude-context/plugins');

// Load a plugin
await loadPlugin('./claude-plugin-eslint.js');

// Or in config.json
{
  "plugins": [
    "claude-plugin-eslint",
    "./custom-plugins/my-plugin.js"
  ]
}
```

### Plugin API

```typescript
interface PluginContext {
  // Add custom health check
  addHealthCheck(check: HealthCheck): void;
  
  // Add dashboard action
  addDashboardAction(action: DashboardAction): void;
  
  // Register hook
  registerHook(event: string, handler: Function): void;
  
  // Run command
  runCommand(command: string): Promise<string>;
  
  // Get/set configuration
  getConfig(key: string): any;
  setConfig(key: string, value: any): void;
  
  // Access to core APIs
  api: {
    updateContext: Function;
    extractTodos: Function;
    getSessionInfo: Function;
  };
}
```

## TypeScript Support

### Type Definitions

```typescript
import {
  ClaudeConfig,
  Session,
  SessionSummary,
  TodoItem,
  HealthCheck,
  DashboardAction,
  PluginContext
} from 'create-claude-context';
```

### Using with TypeScript

```typescript
import { initializeProject, startSession } from 'create-claude-context';

interface MyProjectConfig {
  customField: string;
}

async function setupProject(): Promise<void> {
  await initializeProject({
    projectName: 'my-ts-project',
    projectType: 'node',
    projectDescription: 'TypeScript project with Claude Context'
  });
  
  const session = await startSession();
  console.log(`Started session: ${session.id}`);
}
```

### Custom Type Extensions

```typescript
// claude-context.d.ts
declare module 'create-claude-context' {
  interface ClaudeConfig {
    myCustomConfig?: {
      apiKey: string;
      endpoint: string;
    };
  }
  
  interface TodoItem {
    customPriority?: number;
    assignee?: string;
  }
}
```

### Async/Await Support

All API methods return Promises and support async/await:

```typescript
async function workflow(): Promise<void> {
  try {
    await startSession();
    
    const todos = await extractTodos({
      includeCompleted: false
    });
    
    console.log(`Found ${todos.total} TODOs`);
    
    const summary = await endSession();
    console.log(`Session complete: ${summary.duration}`);
  } catch (error) {
    console.error('Workflow error:', error);
  }
}
```

## Advanced Examples

### CI/CD Integration

```javascript
// .claude/ci-integration.js
const { updateContext, extractTodos } = require('create-claude-context');

async function ciChecks() {
  // Update context
  await updateContext({ force: true });
  
  // Check for high-priority TODOs
  const todos = await extractTodos();
  const highPriority = todos.byType.code.filter(t => 
    t.text.includes('CRITICAL') || t.text.includes('SECURITY')
  );
  
  if (highPriority.length > 0) {
    console.error('Critical TODOs found:');
    highPriority.forEach(todo => {
      console.error(`- ${todo.file}:${todo.line} - ${todo.text}`);
    });
    process.exit(1);
  }
  
  console.log('✅ No critical TODOs found');
}

ciChecks();
```

### Custom Dashboard Section

```javascript
// .claude/plugins/custom-metrics.js
module.exports = {
  name: 'custom-metrics',
  
  activate(context) {
    context.addDashboardSection({
      title: '📊 Code Metrics',
      position: 'after-health-checks',
      render: async () => {
        const loc = await countLinesOfCode();
        const coverage = await getTestCoverage();
        
        return [
          `Lines of Code: ${loc.total}`,
          `Test Coverage: ${coverage}%`,
          `Technical Debt: ${calculateDebt()}`
        ];
      }
    });
  }
};
```

### Automated Context Updates

```javascript
// .claude/auto-update.js
const { updateContext, getProjectConfig } = require('create-claude-context');
const chokidar = require('chokidar');

async function watchForChanges() {
  const config = await getProjectConfig();
  
  // Watch for file changes
  const watcher = chokidar.watch('.', {
    ignored: config.context.excludePatterns,
    persistent: true
  });
  
  let updateTimeout;
  
  watcher.on('change', () => {
    // Debounce updates
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(async () => {
      console.log('Files changed, updating context...');
      await updateContext();
    }, 5000); // Wait 5 seconds after last change
  });
}

watchForChanges();
```

## Error Handling

All API methods may throw errors. Always wrap in try-catch:

```javascript
try {
  await initializeProject(config);
} catch (error) {
  if (error.code === 'ALREADY_INITIALIZED') {
    console.log('Claude Context already initialized');
  } else {
    console.error('Initialization failed:', error.message);
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `ALREADY_INITIALIZED` | Claude Context already exists |
| `NOT_INITIALIZED` | Claude Context not found |
| `SESSION_ACTIVE` | Session already active |
| `NO_SESSION` | No active session |
| `CONFIG_INVALID` | Invalid configuration |
| `PERMISSION_DENIED` | File permission error |

---

For more information, see the [User Guide](USER_GUIDE.md) or [Quick Reference](QUICK_REFERENCE.md).