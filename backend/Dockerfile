FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH"

# Install uv.
RUN pip install --no-cache-dir uv

WORKDIR /app

# Install dependencies first (leveraging Docker cache).
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]