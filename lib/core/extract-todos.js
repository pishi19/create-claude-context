#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Extract TODOs from various sources
function extractTodos() {
  const todos = {
    uncommitted: [],
    codebase: [],
    bugs: [],
    roadmap: []
  };
  
  // 1. Extract from uncommitted changes
  try {
    const diff = execSync('git diff', { encoding: 'utf8' });
    const lines = diff.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^\+.*TODO|^\+.*FIXME|^\+.*XXX/)) {
        const cleanLine = line.replace(/^\+\s*/, '').trim();
        todos.uncommitted.push(cleanLine);
      }
    });
  } catch (error) {
    // No uncommitted changes
  }
  
  // 2. Extract from recent files (modified in last 7 days)
  try {
    const recentFiles = execSync(
      'find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -mtime -7 | head -50',
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);
    
    recentFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.match(/TODO|FIXME|XXX|HACK/)) {
            todos.codebase.push({
              file: file,
              line: index + 1,
              text: line.trim()
            });
          }
        });
      } catch (error) {
        // Skip files that can't be read
      }
    });
  } catch (error) {
    // Find command failed
  }
  
  // 3. Extract bugs from error logs
  try {
    const errorLogs = execSync(
      'find logs apps/web/logs -name "error*.log" -mtime -1 2>/dev/null | head -5',
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);
    
    errorLogs.forEach(logFile => {
      try {
        const errors = execSync(
          `tail -100 "${logFile}" | grep -E "ERROR|CRITICAL|BUG" | tail -5`,
          { encoding: 'utf8' }
        ).trim();
        
        if (errors) {
          todos.bugs.push({
            file: logFile,
            errors: errors.split('\n').slice(0, 3)
          });
        }
      } catch (error) {
        // No errors found
      }
    });
  } catch (error) {
    // No error logs
  }
  
  // 4. Extract from roadmap/documentation
  // Load configuration for custom paths
  const configPath = path.join(process.cwd(), '.claude', 'config.json');
  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  
  const docFiles = [
    config.paths?.roadmap || 'docs/roadmap.md',
    'TODO.md',
    config.paths?.mainDoc || 'README.md'
  ];
  
  docFiles.forEach(docFile => {
    const fullPath = path.join(process.cwd(), docFile);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (line.match(/- \[ \]|TODO:|FIXME:/)) {
            todos.roadmap.push({
              file: docFile,
              line: index + 1,
              text: line.trim()
            });
          }
        });
      } catch (error) {
        // Skip
      }
    }
  });
  
  return todos;
}

// Format todos for display
function formatTodos(todos) {
  console.log(`${colors.bright}${colors.blue}📋 TODO Extraction Report${colors.reset}`);
  console.log(`${colors.dim}Generated: ${new Date().toLocaleString()}${colors.reset}\n`);
  
  // Uncommitted changes
  if (todos.uncommitted.length > 0) {
    console.log(`${colors.yellow}🔄 TODOs in Uncommitted Changes:${colors.reset}`);
    todos.uncommitted.forEach(todo => {
      console.log(`  - ${todo}`);
    });
    console.log('');
  }
  
  // Recent codebase TODOs
  if (todos.codebase.length > 0) {
    console.log(`${colors.green}📝 Recent TODOs in Codebase (last 7 days):${colors.reset}`);
    const grouped = {};
    
    todos.codebase.forEach(todo => {
      const dir = path.dirname(todo.file);
      if (!grouped[dir]) grouped[dir] = [];
      grouped[dir].push(todo);
    });
    
    Object.entries(grouped).slice(0, 5).forEach(([dir, items]) => {
      console.log(`  ${colors.dim}${dir}/${colors.reset}`);
      items.slice(0, 3).forEach(item => {
        console.log(`    ${path.basename(item.file)}:${item.line} - ${item.text.substring(0, 60)}...`);
      });
    });
    console.log('');
  }
  
  // Bugs from logs
  if (todos.bugs.length > 0) {
    console.log(`${colors.red}🐛 Recent Errors (last 24h):${colors.reset}`);
    todos.bugs.forEach(bug => {
      console.log(`  ${colors.dim}${bug.file}:${colors.reset}`);
      bug.errors.forEach(error => {
        console.log(`    ${error.substring(0, 80)}...`);
      });
    });
    console.log('');
  }
  
  // Roadmap items
  if (todos.roadmap.length > 0) {
    console.log(`${colors.magenta}🎯 Roadmap TODOs:${colors.reset}`);
    const grouped = {};
    
    todos.roadmap.forEach(todo => {
      if (!grouped[todo.file]) grouped[todo.file] = [];
      grouped[todo.file].push(todo);
    });
    
    Object.entries(grouped).forEach(([file, items]) => {
      console.log(`  ${colors.dim}${file}:${colors.reset}`);
      items.slice(0, 5).forEach(item => {
        console.log(`    Line ${item.line}: ${item.text.substring(0, 60)}...`);
      });
    });
  }
  
  // Summary
  const total = todos.uncommitted.length + todos.codebase.length + 
                todos.bugs.length + todos.roadmap.length;
  
  console.log(`\n${colors.bright}Summary:${colors.reset}`);
  console.log(`  Total items found: ${total}`);
  console.log(`  Uncommitted: ${todos.uncommitted.length}`);
  console.log(`  Codebase: ${todos.codebase.length}`);
  console.log(`  Bugs: ${todos.bugs.length}`);
  console.log(`  Roadmap: ${todos.roadmap.length}`);
}

// Save to file if requested
function saveTodos(todos, outputFile) {
  const output = {
    generated: new Date().toISOString(),
    summary: {
      uncommitted: todos.uncommitted.length,
      codebase: todos.codebase.length,
      bugs: todos.bugs.length,
      roadmap: todos.roadmap.length
    },
    todos: todos
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`\n${colors.green}✅ Saved to ${outputFile}${colors.reset}`);
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const saveToFile = args.includes('--save');
  const outputFile = args.includes('--output') ? 
    args[args.indexOf('--output') + 1] : 
    '.claude/todos-extract.json';
  
  const todos = extractTodos();
  formatTodos(todos);
  
  if (saveToFile) {
    saveTodos(todos, outputFile);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { extractTodos };