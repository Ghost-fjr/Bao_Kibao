# Bao Kibao Platform

A premium, event-driven fundraising platform for non-profits. Bao Kibao features tournament management, a merchandise store, and multi-role dashboards, all designed with a modern, glassmorphic aesthetic.

## 🚀 Quick Start

The easiest way to start both the backend and frontend is to use the provided batch script:

```bash
./start_all.bat
```

This will launch both servers in separate windows.

---

## 🏗️ Project Structure

```
Bao_Kibao 101/
├── backend/                # Django REST API
│   ├── apps/               # Core business logic (users, store, tournaments, etc.)
│   ├── config/             # Django settings and configurations
│   ├── media/              # User-uploaded content
│   └── manage.py           # Django management CLI
├── frontend/               # React SPA (Vite)
│   ├── src/                # Source code
│   │   ├── components/     # Atomic UI components
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API integration layer
│   │   └── store/          # Zustand state management
│   └── public/             # Static assets
└── start_all.bat           # Unified startup script
```

---

## 💻 Tech Stack

### Backend
- **Core**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **Auth**: JWT (SimpleJWT)
- **Payments**: Stripe & M-Pesa (Daraja API)
- **Image Processing**: Pillow

### Frontend
- **Core**: React 18 + Vite
- **Styling**: Tailwind CSS (Glassmorphism & Gradients)
- **State**: Zustand
- **Routing**: React Router v6
- **HTTP**: Axios

---

## 🛠️ Detailed Setup

### 1. Backend Setup
1. **Navigate & Environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
2. **Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Configuration**:
   Copy `.env.example` to `.env` and fill in:
   - Django Secret Key
   - Database credentials
   - Stripe API keys
   - Daraja (M-Pesa) keys
4. **Database**:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
5. **Run**:
   ```bash
   python manage.py runserver
   ```

### 2. Frontend Setup
1. **Navigate & Install**:
   ```bash
   cd frontend
   npm install
   ```
2. **Configuration**:
   Copy `.env.example` to `.env` and set `VITE_API_URL`.
3. **Run**:
   ```bash
   npm run dev
   ```

---

## ✨ Features

### 🌍 Public Portal
- **Landing Page**: Mission showcase with premium animations.
- **Tournament Hub**: Browse upcoming events and view live standings.
- **Merchandise Store**: Full e-commerce experience with cart and checkout.
- **Donation System**: Support the cause directly via Stripe or M-Pesa.

### 👥 User / Team Captain Dashboard
- **Team Management**: Register teams and manage player rosters.
- **Tournament Tracking**: View personal match schedules and performance.
- **Order History**: Track merchandise purchases.

### 🔐 Admin Control Center
- **Analytics**: Real-time KPIs and revenue tracking.
- **Tournament CRUD**: Manage events, pools, and automated match scheduling.
- **Store Management**: Product inventory and order fulfillment.
- **CMS & Gallery**: Dynamic content updates and image management.
- **Financials**: Payment tracking for both M-Pesa and Stripe transactions.

---

## 🔒 Security & Environment

The platform expects several environment variables for full functionality:
- `STRIPE_SECRET_KEY`: For global card payments.
- `DARAJA_CONSUMER_KEY`: For Kenyan M-Pesa payments.
- `SECRET_KEY`: Django's security salt.

---

## 📜 License

Proprietary - Bao Kibao Platform. All Rights Reserved.
