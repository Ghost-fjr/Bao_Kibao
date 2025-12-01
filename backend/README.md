# Bao Kibao Backend

Django REST API backend for the Bao Kibao fundraising platform.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_NAME=bao_kibao_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_HOST=localhost
DATABASE_PORT=5432
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

## API Documentation

API will be available at `http://localhost:8000/api/`

## Apps

- `users` - User authentication and management
- `organizations` - Multi-org support
- `tournaments` - Tournament management
- `store` - Merchandise store
- `cms` - Content management system
- `payments` - Payment processing
- `dashboard` - Analytics and KPIs
