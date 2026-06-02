# IPTV Premium - Bilingual IPTV Services Website

A modern, responsive bilingual (English/French) website for IPTV services with PayPal integration, email notifications, and a premium dark design.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **Payments:** PayPal REST API (Orders v2)
- **Email:** Nodemailer (SMTP)

## Features

- Bilingual EN/FR with language switcher
- Premium dark UI with animations
- 4 pricing packs (Free Trial, 1 Month, 6 Months, 1 Year)
- PayPal payment integration
- Admin email notifications for payments and trial requests
- Responsive mobile-first design
- SEO-friendly
- Contact form
- FAQ accordion
- Success page after payment

## Project Structure

```
iptv-website/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── i18n/          # Translations (EN/FR)
│   │   └── utils/         # API utilities & config
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/               # Express API server
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # API routes
│   │   ├── services/      # PayPal & email services
│   │   ├── middleware/     # Validation & error handling
│   │   ├── models/        # Database models
│   │   └── utils/         # Logger utilities
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   └── schema.sql         # PostgreSQL schema
│
├── .env.example           # Environment variables template
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- PayPal Developer Account (for sandbox testing)
- SMTP email account (Gmail recommended for testing)

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Database Setup

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE iptv_premium;"

# Run the schema
psql -U postgres -d iptv_premium -f database/schema.sql
```

### 3. Environment Configuration

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your credentials:
# - Database connection
# - PayPal API credentials (sandbox)
# - SMTP email credentials
```

### 4. PayPal Setup

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications)
2. Create a REST API app
3. Copy the **Client ID** and **Secret**
4. Add the Client ID to both `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (frontend) and `PAYPAL_CLIENT_ID` (backend) in `.env`
5. Add the Secret to `PAYPAL_CLIENT_SECRET` in `.env`

### 5. Email Setup (Gmail Example)

1. Enable 2-factor authentication on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Configure SMTP in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your.email@gmail.com
   SMTP_PASS=your_16_char_app_password
   ```

## Running the Application

### Development Mode

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

### Production Build

```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
npm start
```

## API Endpoints

| Method | Endpoint                   | Description             |
|--------|----------------------------|-------------------------|
| GET    | `/api/health`              | Health check            |
| POST   | `/api/payment/create-order`| Create PayPal order     |
| POST   | `/api/payment/capture-order`| Capture PayPal payment |
| POST   | `/api/payment/free-trial`  | Submit free trial request |
| POST   | `/api/email/contact`       | Submit contact form     |

## Deployment

### Frontend (Vercel - Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_PAYPAL_CLIENT_ID
```

### Backend (Railway / Heroku / DigitalOcean)

1. Set environment variables on your hosting platform
2. For production, set `NODE_ENV=production`
3. Change `PAYPAL_API_BASE` to `https://api-m.paypal.com` (live)
4. Ensure PostgreSQL is accessible from your server

### Database (Supabase - Recommended)

1. Create a free Supabase project
2. Go to SQL Editor and paste `database/schema.sql`
3. Copy the connection string to your backend `.env`

## Security Notes

- Never commit `.env` files to version control
- Use environment variables for all secrets
- PayPal credentials should use live keys only in production
- Enable HTTPS in production
- Use strong passwords for database and email
- Rate limit API endpoints in production

## Customization

### Adding New Languages

1. Create a new translation file in `frontend/src/i18n/` (e.g., `es.ts`)
2. Import and add it in `LanguageContext.tsx`
3. Add the language option in `Header.tsx`

### Modifying Plans

Edit the plan configurations in:
- `frontend/src/utils/api.ts` (PLANS object)
- `backend/src/services/paypal.ts` (PLANS object)
- `frontend/src/i18n/en.ts` and `fr.ts` (translations)

## License

Private - All rights reserved.
