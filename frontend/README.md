# Bao Kibao Frontend

React frontend for the Bao Kibao fundraising platform.

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Font**: Inter (Google Fonts)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── common/        # Buttons, Cards, Modals
│   ├── layout/        # Header, Footer, Sidebar
│   ├── public/        # Landing, Tournaments, Store
│   ├── dashboard/     # User dashboards
│   └── admin/         # Admin components
├── pages/             # Page components
│   ├── public/
│   ├── dashboard/
│   └── admin/
├── services/          # API calls
├── store/             # Zustand state management
├── hooks/             # Custom hooks
├── utils/             # Helper functions
├── App.jsx
└── main.jsx
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

- **Primary Colors**: Blue gradient (#667eea → #764ba2)
- **Secondary Colors**: Pink/Coral gradient (#f093fb → #f5576c)
- **Font**: Inter
- **Components**: Glassmorphism, smooth animations, gradient buttons
