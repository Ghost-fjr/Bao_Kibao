# Bao Kibao Platform

A comprehensive event-driven fundraising platform for non-profits featuring tournament management, merchandise store, and multi-role dashboards.

## Project Structure

```
Bao_Kibao 101/
├── backend/           # Django REST API
│   ├── apps/         # Django applications
│   ├── config/       # Project settings
│   ├── venv/         # Virtual environment
│   └── manage.py
├── frontend/         # React SPA
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── package.json
└── README.md
```

## Tech Stack

### Backend
- Django 5.2 + Django REST Framework
- PostgreSQL database
- JWT authentication
- Stripe payment integration
- Multi-organization support

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Zustand for state management
- Axios for API calls

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and configure:
```bash
copy .env.example .env
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Start development server:
```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

4. Start development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Features

### Public Features
- Landing page with mission, vision, achievements
- Tournament listing and registration
- Merchandise store with cart and checkout
- Donation system
- Impact metrics display

### Team Captain Features
- Tournament registration and team management
- Player roster management
- Match schedule viewing
- Tournament standings

### Admin Features
- Dashboard with KPIs and analytics
- Tournament CRUD and management
- Store and product management
- CMS for content updates
- User and role management
- Payment tracking

## Development Status

✅ Project structure created
✅ Backend Django apps initialized
✅ Frontend React app with Tailwind configured
✅ Database models 
✅ API endpoints 
✅ Frontend components 
✅ Payment integration 

## Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Implementation Plan](./docs/implementation_plan.md)

## License

Proprietary - Bao Kibao Platform
