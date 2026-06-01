# EXCEL Tutoring Platform

A full-stack tutoring platform for the Ethiopian market. Students find and book verified tutors, pay via bank transfer (admin-approved), and attend sessions via video call.

---

## Tech Stack

**Backend** — Node.js, Express, MongoDB/Mongoose, Socket.io, JWT auth  
**Frontend** — React 18, Vite, Tailwind CSS, TanStack Query, Zustand, Socket.io-client

---

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 1. Backend

```bash
cd backend
# Copy and fill in your environment variables
cp .env.example .env
# Install dependencies
npm install
# Start dev server (hot reload)
npm run dev
```

Backend runs on **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
# Copy env file (defaults work for local dev)
cp .env.example .env
# Install dependencies
npm install
# Start dev server
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (see setup below) |
| `JWT_ACCESS_SECRET` | Long random string for access tokens |
| `JWT_REFRESH_SECRET` | Long random string for refresh tokens |
| `FRONTEND_URL` | Frontend URL for CORS (default: http://localhost:5173) |
| `EMAIL_HOST` / `EMAIL_USER` / `EMAIL_PASSWORD` | SMTP credentials for email (optional in dev) |
| `CLOUDINARY_*` | Cloudinary credentials for file uploads (optional — falls back to local storage) |

Generate secure JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create a free account
2. Create a new **free cluster** (M0 — 512MB, always free)
3. Under **Database Access** → Add a database user with a strong password
4. Under **Network Access** → Add IP Address:
   - For development: add your current IP
   - For production: add `0.0.0.0/0` (allow all) or your server's IP
5. Click **Connect** → **Drivers** → copy the connection string
6. Replace `<username>`, `<password>`, `<cluster>`, `<AppName>` in your `.env`:

```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/excel-tutoring?retryWrites=true&w=majority&appName=Cluster0
```

> The database `excel-tutoring` is created automatically on first run.

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (default: http://localhost:5000/api/v1) |
| `VITE_SOCKET_URL` | Backend socket URL (default: http://localhost:5000) |

---

## Payment Flow

This platform uses **admin-controlled manual payment approval** (no payment gateway required):

1. Student books a session → status: `pending`
2. Student submits payment proof (bank transfer screenshot + reference number)
3. Admin reviews proof in **Admin → Payments** dashboard
4. Admin approves → booking auto-confirms, tutor notified
5. Admin can reject (student resubmits) or refund completed payments

---

## User Roles

| Role | Access |
|---|---|
| **Student** | Browse tutors, book sessions, submit payments, message tutors, leave reviews |
| **Tutor** | Manage bookings (confirm/reject/complete), message students, update profile |
| **Admin** | Full control — verify tutors, approve payments, manage users, moderate reviews, send announcements |

### Creating an Admin Account

Register normally, then update the role in MongoDB:
```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## Production Deployment

### Build frontend
```bash
cd frontend && npm run build
# Output in frontend/dist/ — serve with Nginx or any static host
```

### Run backend with PM2
```bash
cd backend
npm install -g pm2
# Create logs directory
mkdir logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Free Hosting Options
- **Backend**: [Render](https://render.com) (free tier), [Railway](https://railway.app), [Fly.io](https://fly.io)
- **Frontend**: [Vercel](https://vercel.com) (free), [Netlify](https://netlify.com) (free)
- **Database**: [MongoDB Atlas](https://cloud.mongodb.com) (free 512MB tier)
- **File uploads**: [Cloudinary](https://cloudinary.com) (free 25GB tier)

### Important for Production
1. Set `NODE_ENV=production` in backend `.env`
2. Change `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to long random strings
3. Set `FRONTEND_URL` to your actual frontend domain
4. Configure email (Gmail app password or SendGrid)
5. Socket.io runs on a single instance — do NOT enable PM2 cluster mode until Redis adapter is configured

---

## Project Structure

```
excel-tutoring-platform/
├── backend/
│   ├── config/          # DB + Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, rate limiting, validation, uploads
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── socket/          # Socket.io handlers
│   ├── utils/           # Email, JWT, notifications
│   ├── .env             # Environment variables (gitignored)
│   ├── .env.example     # Template
│   └── server.js        # Entry point
└── frontend/
    ├── src/
    │   ├── components/  # Shared UI components
    │   ├── hooks/       # Custom React hooks
    │   ├── layouts/     # Page layouts
    │   ├── lib/         # Axios + Socket.io clients
    │   ├── pages/       # Route pages (admin/student/tutor/auth)
    │   ├── services/    # API service functions
    │   ├── stores/      # Zustand state stores
    │   └── utils/       # Helpers
    ├── .env             # Environment variables (gitignored)
    └── .env.example     # Template
```
