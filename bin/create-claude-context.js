#!/usr/bin/env node

const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

// Import core functions
const { initializeProject } = require('../lib');

program
  .name('create-claude-context')
  .description('Initialize Claude Context System for your project')
  .version('1.0.0');

program
  .argument('[project-name]', 'Name of the project (defaults to current directory name)')
  .option('-t, --type <type>', 'Project type (nextjs, node, python, generic)', 'generic')
  .option('-s, --skip-install', 'Skip npm install')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (projectName, options) => {
    console.log(chalk.cyan('\n🤖 Claude Context System Initializer\n'));

    let config = {
      projectName: projectName || path.basename(process.cwd()),
      projectType: options.type,
      projectDescription: '',
      installDependencies: !options.skipInstall
    };

    // Interactive prompts if not using defaults
    if (!options.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Project name:',
          default: config.projectName
        },
        {
          type: 'list',
          name: 'projectType',
          message: 'Project type:',
          choices: [
            { name: 'Next.js', value: 'nextjs' },
            { name: 'Node.js', value: 'node' },
            { name: 'Python', value: 'python' },
            { name: 'Generic', value: 'generic' }
          ],
          default: config.projectType
        },
        {
          type: 'input',
          name: 'projectDescription',
          message: 'Project description:',
          default: `${config.projectName} with Claude Context`
        },
        {
          type: 'confirm',
          name: 'installDependencies',
          message: 'Install dependencies?',
          default: true
        }
      ]);

      config = { ...config, ...answers };
    }

    try {
      console.log(chalk.yellow('\n⚙️  Initializing Claude Context...\n'));
      
      await initializeProject(config);
      
      console.log(chalk.green('\n✅ Claude Context initialized successfully!\n'));
      console.log(chalk.cyan('📚 Quick Start:\n'));
      console.log(chalk.white('  npm run claude:start    - Start a development session'));
      console.log(chalk.white('  npm run claude:dashboard - Open interactive dashboard'));
      console.log(chalk.white('  npm run claude:todos    - Extract TODOs from codebase'));
      console.log(chalk.white('  npm run claude:end      - End session with summary\n'));
      console.log(chalk.yellow('📖 See .claude/README.md for more information\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Error initializing Claude Context:'), error.message);
      process.exit(1);
    }
  });

// Add subcommand for updating existing projects
program
  .command('update')
  .description('Update Claude Context in an existing project')
  .action(async () => {
    console.log(chalk.cyan('\n🔄 Updating Claude Context...\n'));
    
    try {
      const { updateProject } = require('../lib');
      await updateProject();
      console.log(chalk.green('\n✅ Claude Context updated successfully!\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ Error updating Claude Context:'), error.message);
      process.exit(1);
    }
  });

program.parse();