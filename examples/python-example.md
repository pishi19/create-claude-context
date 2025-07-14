# Claude Context with Python - Example Setup

This example shows how to set up Claude Context for a Python project with FastAPI.

## Installation

```bash
npx create-claude-context --type python
```

## Example CLAUDE.md for Python

```markdown
# CLAUDE.md

# DataPipe - Data Processing Pipeline Guidelines

Essential guidelines for Claude Code when working on DataPipe.

## Project Overview

DataPipe is a high-performance data processing pipeline that:
- Ingests data from multiple sources (APIs, databases, files)
- Transforms data using pandas and custom processors
- Stores processed data in PostgreSQL and S3
- Provides REST API for data access
- Includes real-time monitoring dashboard

**Stack**: Python 3.11, FastAPI, PostgreSQL, Redis, pandas, SQLAlchemy, Celery

## Current Sprint Focus

- **Active**: Batch processing optimization
- **Progress**: 40% complete
- **Next**: Add data validation rules
- **Ready**: API endpoints, Basic transformations, S3 integration
- **Blocked**: Need: Production database credentials

## Architecture Overview

```
datapipe/
├── api/                 # FastAPI application
│   ├── endpoints/       # API endpoints
│   ├── models/         # Pydantic models
│   └── dependencies/   # Shared dependencies
├── core/               # Core business logic
│   ├── processors/     # Data processors
│   ├── validators/     # Data validators
│   └── transformers/   # Data transformers
├── db/                 # Database layer
│   ├── models/        # SQLAlchemy models
│   ├── repositories/  # Data access layer
│   └── migrations/    # Alembic migrations
├── services/          # External services
│   ├── s3/           # S3 integration
│   ├── redis/        # Cache layer
│   └── monitoring/   # Metrics and logging
├── tasks/            # Celery tasks
├── tests/            # Test suite
└── scripts/          # Utility scripts
```

### Design Principles
- Clean architecture with dependency injection
- Type hints everywhere (mypy strict mode)
- Async-first API design
- Repository pattern for data access
- Domain-driven design for core logic

## Development Workflow

### 1. Environment Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 2. Branch Strategy
```bash
git checkout -b feature/DP-123-batch-optimization
```

### 3. Code Standards

#### Type Hints Required
```python
from typing import List, Optional, Dict, Any
from datetime import datetime

async def process_batch(
    data: List[Dict[str, Any]],
    config: Optional[ProcessConfig] = None,
) -> BatchResult:
    """Process a batch of data records.
    
    Args:
        data: List of data records to process
        config: Optional processing configuration
        
    Returns:
        BatchResult with processing statistics
        
    Raises:
        ValidationError: If data validation fails
        ProcessingError: If processing fails
    """
    pass
```

#### API Endpoint Pattern
```python
# api/endpoints/data.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..dependencies import get_db
from ..models import DataResponse, DataFilter
from ...core.processors import DataProcessor

router = APIRouter(prefix="/data", tags=["data"])

@router.get("/", response_model=List[DataResponse])
async def get_data(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    filters: DataFilter = Depends(),
    db: Session = Depends(get_db),
    processor: DataProcessor = Depends(),
) -> List[DataResponse]:
    """Get processed data with pagination and filters."""
    data = await processor.get_filtered_data(
        db, filters, skip=skip, limit=limit
    )
    return data
```

#### Repository Pattern
```python
# db/repositories/data_repository.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..models import DataRecord

class DataRepository:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_by_id(self, record_id: int) -> Optional[DataRecord]:
        """Get a single record by ID."""
        result = await self.db.execute(
            select(DataRecord).where(DataRecord.id == record_id)
        )
        return result.scalar_one_or_none()
    
    async def get_many(
        self, 
        skip: int = 0, 
        limit: int = 100,
        **filters
    ) -> List[DataRecord]:
        """Get multiple records with pagination."""
        query = select(DataRecord)
        
        # Apply filters
        for key, value in filters.items():
            if hasattr(DataRecord, key) and value is not None:
                query = query.where(getattr(DataRecord, key) == value)
        
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
```

## Common Patterns

### Async Context Manager
```python
# services/s3/client.py
from contextlib import asynccontextmanager
import aioboto3

class S3Service:
    def __init__(self, bucket: str):
        self.bucket = bucket
        self.session = aioboto3.Session()
    
    @asynccontextmanager
    async def get_client(self):
        async with self.session.client('s3') as client:
            yield client
    
    async def upload_file(self, key: str, data: bytes) -> str:
        async with self.get_client() as client:
            await client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=data
            )
        return f"s3://{self.bucket}/{key}"
```

### Celery Task Pattern
```python
# tasks/processing.py
from celery import shared_task
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def process_data_batch(self, batch_id: str) -> Dict[str, Any]:
    """Process a data batch asynchronously."""
    try:
        logger.info(f"Processing batch {batch_id}")
        
        # Processing logic here
        result = process_batch(batch_id)
        
        return {
            "status": "completed",
            "batch_id": batch_id,
            "records_processed": result.count
        }
    except Exception as exc:
        logger.error(f"Batch {batch_id} failed: {exc}")
        raise self.retry(exc=exc, countdown=60)
```

### Custom Exceptions
```python
# core/exceptions.py
class DataPipeException(Exception):
    """Base exception for DataPipe."""
    pass

class ValidationError(DataPipeException):
    """Raised when data validation fails."""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")

class ProcessingError(DataPipeException):
    """Raised when data processing fails."""
    pass
```

## Testing Strategy

### Unit Test Example
```python
# tests/test_processors.py
import pytest
from unittest.mock import Mock, patch

from datapipe.core.processors import DataProcessor
from datapipe.core.exceptions import ValidationError

class TestDataProcessor:
    @pytest.fixture
    def processor(self):
        return DataProcessor()
    
    @pytest.mark.asyncio
    async def test_process_valid_data(self, processor):
        # Arrange
        data = {"id": 1, "value": 100}
        
        # Act
        result = await processor.process(data)
        
        # Assert
        assert result.status == "success"
        assert result.processed_value == 100
    
    @pytest.mark.asyncio
    async def test_process_invalid_data(self, processor):
        # Arrange
        data = {"id": 1, "value": "invalid"}
        
        # Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            await processor.process(data)
        
        assert exc_info.value.field == "value"
```

### Integration Test Example
```python
# tests/integration/test_api.py
import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from datapipe.main import app
from datapipe.db.models import DataRecord

@pytest.mark.asyncio
async def test_get_data_endpoint(
    client: AsyncClient,
    db_session: Session
):
    # Arrange: Create test data
    test_record = DataRecord(
        name="test",
        value=123
    )
    db_session.add(test_record)
    await db_session.commit()
    
    # Act: Call API
    response = await client.get("/api/data/")
    
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "test"
```

## Environment Configuration

```bash
# .env.example
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/datapipe
REDIS_URL=redis://localhost:6379/0
S3_BUCKET=datapipe-dev
AWS_REGION=us-east-1
CELERY_BROKER_URL=redis://localhost:6379/1
LOG_LEVEL=INFO
```

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Import errors | Check PYTHONPATH and virtual environment |
| Type errors | Run `mypy datapipe/` before committing |
| Async errors | Ensure using `async def` and `await` properly |
| Database errors | Run `alembic upgrade head` for migrations |
| Celery not working | Check Redis is running: `redis-cli ping` |

## Performance Guidelines

1. Use async/await for all I/O operations
2. Batch database operations when possible
3. Implement proper connection pooling
4. Use Redis for caching frequently accessed data
5. Profile code with `py-spy` for bottlenecks

## Security Checklist

- [ ] Validate all input data with Pydantic
- [ ] Use parameterized queries (SQLAlchemy does this)
- [ ] Implement rate limiting on API endpoints
- [ ] Store secrets in environment variables
- [ ] Enable CORS only for allowed origins

## Remember

1. **Type hints everywhere** - mypy runs in strict mode
2. **Async by default** - Use sync only when necessary
3. **Test everything** - Aim for >90% coverage
4. **Document API changes** - Update OpenAPI schema
5. **Monitor performance** - Check DataDog dashboards
```

## Example Configuration

```json
// .claude/config.json
{
  "project": {
    "name": "datapipe",
    "type": "python",
    "description": "Data processing pipeline with FastAPI"
  },
  "context": {
    "excludePatterns": [
      "**/__pycache__/**",
      "**/venv/**",
      "**/.pytest_cache/**",
      "**/*.pyc",
      "**/htmlcov/**",
      "**/.mypy_cache/**"
    ]
  },
  "features": {
    "healthChecks": true
  },
  "scripts": {
    "claude:test": "pytest && npm run claude:update",
    "claude:lint": "flake8 && mypy datapipe/ && npm run claude:update"
  }
}
```

## Custom Commands

```json
// package.json
{
  "scripts": {
    "claude:pytest": "pytest -v && npm run claude:update",
    "claude:mypy": "mypy datapipe/ --strict && npm run claude:update",
    "claude:coverage": "pytest --cov=datapipe --cov-report=html && npm run claude:update"
  }
}
```