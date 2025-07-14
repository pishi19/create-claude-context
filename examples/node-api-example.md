# Claude Context with Node.js API - Example Setup

This example shows how to set up Claude Context for a Node.js REST API project.

## Installation

```bash
npx create-claude-context --type node
```

## Example CLAUDE.md for Node.js API

```markdown
# CLAUDE.md

# TaskMaster API - Task Management Service Guidelines

Essential guidelines for Claude Code when working on TaskMaster API.

## Project Overview

TaskMaster is a RESTful API service for task management that provides:
- Multi-tenant task management
- Real-time notifications via WebSocket
- Role-based access control (RBAC)
- Integration with external calendars
- Automated task scheduling

**Stack**: Node.js 20, Express.js, PostgreSQL, Redis, Socket.io, Jest, TypeScript

## Current Sprint Focus

- **Active**: WebSocket notifications
- **Progress**: 70% complete
- **Next**: Calendar integration (Google/Outlook)
- **Ready**: CRUD operations, Authentication, Authorization
- **Blocked**: Need: OAuth2 credentials for calendar APIs

## Architecture Overview

```
src/
├── api/               # API layer
│   ├── routes/       # Express routes
│   ├── middleware/   # Custom middleware
│   └── validators/   # Request validation
├── services/         # Business logic
│   ├── task/        # Task management
│   ├── auth/        # Authentication
│   └── notification/ # Notification service
├── models/          # Data models
│   ├── schemas/     # Joi/Zod schemas
│   └── types/       # TypeScript types
├── data/            # Data access layer
│   ├── repositories/# Repository pattern
│   ├── migrations/  # Database migrations
│   └── seeds/       # Seed data
├── utils/           # Utilities
├── config/          # Configuration
└── tests/           # Test files
```

### Design Patterns
- Repository pattern for data access
- Service layer for business logic
- Middleware for cross-cutting concerns
- Event-driven architecture for notifications
- Clean error handling with custom errors

## Development Workflow

### 1. API Route Pattern
```typescript
// src/api/routes/tasks.routes.ts
import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate, authorize } from '../middleware/auth';
import { TaskController } from '../controllers/task.controller';
import { createTaskSchema, updateTaskSchema } from '../validators/task.validators';

const router = Router();
const controller = new TaskController();

router.use(authenticate); // All routes require authentication

router.get('/', 
  authorize('tasks:read'),
  controller.getTasks
);

router.post('/',
  authorize('tasks:create'),
  celebrate({ body: createTaskSchema }),
  controller.createTask
);

router.put('/:id',
  authorize('tasks:update'),
  celebrate({ body: updateTaskSchema }),
  controller.updateTask
);

export default router;
```

### 2. Service Layer Pattern
```typescript
// src/services/task/task.service.ts
import { Task, CreateTaskDTO, UpdateTaskDTO } from '../../models/types';
import { TaskRepository } from '../../data/repositories';
import { NotificationService } from '../notification';
import { CacheService } from '../cache';
import { AppError } from '../../utils/errors';

export class TaskService {
  constructor(
    private taskRepo: TaskRepository,
    private notificationService: NotificationService,
    private cache: CacheService
  ) {}

  async createTask(userId: string, data: CreateTaskDTO): Promise<Task> {
    // Validate business rules
    if (data.dueDate < new Date()) {
      throw new AppError('Due date cannot be in the past', 400);
    }

    // Create task
    const task = await this.taskRepo.create({
      ...data,
      userId,
      status: 'pending'
    });

    // Clear cache
    await this.cache.del(`user:${userId}:tasks`);

    // Send notification
    await this.notificationService.notifyNewTask(userId, task);

    return task;
  }

  async getTasksForUser(userId: string): Promise<Task[]> {
    // Try cache first
    const cached = await this.cache.get<Task[]>(`user:${userId}:tasks`);
    if (cached) return cached;

    // Get from database
    const tasks = await this.taskRepo.findByUserId(userId);

    // Cache for 5 minutes
    await this.cache.set(`user:${userId}:tasks`, tasks, 300);

    return tasks;
  }
}
```

### 3. Repository Pattern
```typescript
// src/data/repositories/task.repository.ts
import { Knex } from 'knex';
import { Task, CreateTaskDTO } from '../../models/types';
import { BaseRepository } from './base.repository';

export class TaskRepository extends BaseRepository<Task> {
  constructor(db: Knex) {
    super(db, 'tasks');
  }

  async findByUserId(userId: string): Promise<Task[]> {
    return this.db(this.tableName)
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  async findDueTasks(date: Date): Promise<Task[]> {
    return this.db(this.tableName)
      .where('due_date', '<=', date)
      .where('status', '!=', 'completed')
      .where('reminder_sent', false);
  }

  async create(data: CreateTaskDTO): Promise<Task> {
    const [task] = await this.db(this.tableName)
      .insert(data)
      .returning('*');
    return task;
  }
}
```

### 4. Error Handling
```typescript
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error({
    error: err,
    request: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack
      })
    }
  });
};
```

## Common Patterns

### Authentication Middleware
```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as User;
    
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};
```

### Request Validation
```typescript
// src/api/validators/task.validators.ts
import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().required().max(200),
  description: Joi.string().optional().max(1000),
  dueDate: Joi.date().iso().min('now').required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  tags: Joi.array().items(Joi.string()).max(10)
});

export const updateTaskSchema = Joi.object({
  title: Joi.string().max(200),
  description: Joi.string().max(1000),
  dueDate: Joi.date().iso().min('now'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  status: Joi.string().valid('pending', 'in_progress', 'completed'),
  tags: Joi.array().items(Joi.string()).max(10)
}).min(1); // At least one field required
```

### WebSocket Integration
```typescript
// src/services/notification/websocket.service.ts
import { Server } from 'socket.io';
import { logger } from '../../utils/logger';

export class WebSocketService {
  private io: Server;
  private userSockets: Map<string, string[]> = new Map();

  initialize(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
      }
    });

    this.io.on('connection', (socket) => {
      socket.on('authenticate', (userId: string) => {
        this.addUserSocket(userId, socket.id);
        socket.join(`user:${userId}`);
        
        socket.on('disconnect', () => {
          this.removeUserSocket(userId, socket.id);
        });
      });
    });
  }

  notifyUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }
}
```

## Testing Strategy

### Unit Test Example
```typescript
// src/services/task/__tests__/task.service.test.ts
import { TaskService } from '../task.service';
import { TaskRepository } from '../../../data/repositories';
import { AppError } from '../../../utils/errors';

describe('TaskService', () => {
  let service: TaskService;
  let mockRepo: jest.Mocked<TaskRepository>;
  let mockNotificationService: any;
  let mockCache: any;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByUserId: jest.fn(),
    } as any;
    
    mockNotificationService = {
      notifyNewTask: jest.fn(),
    };
    
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    service = new TaskService(mockRepo, mockNotificationService, mockCache);
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const userId = 'user123';
      const taskData = {
        title: 'Test Task',
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
      };

      const createdTask = { id: 'task123', ...taskData, userId };
      mockRepo.create.mockResolvedValue(createdTask);

      const result = await service.createTask(userId, taskData);

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...taskData,
        userId,
        status: 'pending',
      });
      expect(mockCache.del).toHaveBeenCalledWith(`user:${userId}:tasks`);
      expect(mockNotificationService.notifyNewTask).toHaveBeenCalledWith(userId, createdTask);
      expect(result).toEqual(createdTask);
    });

    it('should throw error for past due date', async () => {
      const taskData = {
        title: 'Test Task',
        dueDate: new Date('2020-01-01'),
      };

      await expect(service.createTask('user123', taskData))
        .rejects
        .toThrow(AppError);
    });
  });
});
```

### Integration Test Example
```typescript
// src/api/routes/__tests__/tasks.integration.test.ts
import request from 'supertest';
import { app } from '../../../app';
import { db } from '../../../data/db';
import { generateToken } from '../../../utils/auth';

describe('Tasks API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await db.migrate.latest();
    userId = 'test-user-123';
    authToken = generateToken({ id: userId, role: 'user' });
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    await db('tasks').truncate();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: 'high',
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: 'pending',
      });
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Missing title' })
        .expect(400);

      expect(response.body.error.message).toContain('title');
    });
  });
});
```

## Environment Configuration

```bash
# .env.example
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taskmaster
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# External APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

## Performance Optimization

1. **Connection Pooling**
   - Database: Configure pool in Knex
   - Redis: Use ioredis with connection pool

2. **Caching Strategy**
   - Cache user tasks for 5 minutes
   - Cache user permissions for 15 minutes
   - Invalidate on updates

3. **Query Optimization**
   - Use database indexes on foreign keys
   - Implement pagination for list endpoints
   - Use SELECT only required columns

4. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   export const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests
     message: 'Too many requests',
   });
   ```

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Check DATABASE_URL and PostgreSQL service |
| Redis connection failed | Ensure Redis is running: `redis-cli ping` |
| JWT errors | Verify JWT_SECRET is set and consistent |
| WebSocket not connecting | Check CORS settings and client URL |
| Tests failing | Run migrations: `npm run db:migrate:test` |

## Security Checklist

- [ ] Helmet.js for security headers
- [ ] Rate limiting on all endpoints
- [ ] Input validation with Joi/Zod
- [ ] SQL injection prevention (using Knex)
- [ ] JWT token expiration
- [ ] CORS properly configured
- [ ] Environment variables for secrets

## Remember

1. **Service layer for business logic** - Keep controllers thin
2. **Repository pattern** - Abstract database queries
3. **Proper error handling** - Use custom AppError class
4. **Comprehensive tests** - Unit and integration
5. **Document API changes** - Update Swagger/OpenAPI
```

## Example Configuration

```json
// .claude/config.json
{
  "project": {
    "name": "taskmaster-api",
    "type": "node",
    "description": "Task management REST API"
  },
  "context": {
    "excludePatterns": [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.env*",
      "**/logs/**"
    ]
  },
  "features": {
    "healthChecks": true
  },
  "scripts": {
    "claude:test": "npm test && npm run claude:update",
    "claude:lint": "npm run lint && npm run claude:update",
    "claude:check": "npm run type-check && npm run claude:update"
  }
}
```