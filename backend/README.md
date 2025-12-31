# EXCEL Tutoring Service - Backend API

Production-ready RESTful API for EXCEL Tutoring Service built with Node.js, Express, and MongoDB.

## Features

- ✅ JWT Authentication with refresh tokens
- ✅ Role-based access control (Student, Tutor, Admin)
- ✅ Email verification with OTP
- ✅ Password reset functionality
- ✅ Telebirr payment integration
- ✅ Real-time chat with Socket.io
- ✅ File uploads with Cloudinary
- ✅ Rate limiting and security middleware
- ✅ Input validation and sanitization
- ✅ Activity logging
- ✅ Notification system
- ✅ Review and rating system
- ✅ Booking management
- ✅ Admin dashboard

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + Bcrypt
- **Real-time:** Socket.io
- **File Storage:** Cloudinary
- **Email:** Nodemailer
- **Validation:** Express-validator
- **Security:** Helmet, CORS, Rate limiting

## Prerequisites

- Node.js 18 or higher
- MongoDB 5.0 or higher
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure all required variables.

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (recommended for production)
   ```

5. **Run the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

See `.env.example` for all required environment variables.

### Critical Variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `EMAIL_*` - Email service configuration
- `CLOUDINARY_*` - Cloudinary credentials
- `TELEBIRR_*` - Telebirr payment gateway credentials

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "0912345678",
  "role": "student"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Verify Email
```http
POST /auth/verify-email
Authorization: Bearer {token}
Content-Type: application/json

{
  "otp": "123456"
}
```

### User Endpoints

#### Get Profile
```http
GET /users/profile
Authorization: Bearer {token}
```

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Student looking for math tutor"
}
```

#### Upload Avatar
```http
POST /users/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

avatar: [file]
```

### Tutor Endpoints

#### Get All Tutors
```http
GET /tutors?subject={subjectId}&minRating=4&page=1&limit=12
```

#### Apply as Tutor
```http
POST /tutors/apply
Authorization: Bearer {token}
Content-Type: application/json

{
  "subjects": [
    {
      "subject": "subjectId",
      "level": "expert",
      "pricePerHour": 500
    }
  ],
  "education": [...],
  "headline": "Experienced Math Tutor",
  "description": "..."
}
```

### Booking Endpoints

#### Create Booking
```http
POST /bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "tutorId": "tutorId",
  "subjectId": "subjectId",
  "sessionDate": "2024-12-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "duration": 2,
  "notes": "Need help with calculus"
}
```

#### Get My Bookings
```http
GET /bookings?status=pending&page=1
Authorization: Bearer {token}
```

### Payment Endpoints

#### Initiate Payment
```http
POST /payments/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": "bookingId",
  "amount": 1000,
  "paymentMethod": "telebirr"
}
```

#### Verify Payment
```http
GET /payments/{paymentId}/verify
Authorization: Bearer {token}
```

### Message Endpoints

#### Get Conversations
```http
GET /messages/conversations
Authorization: Bearer {token}
```

#### Get Messages
```http
GET /messages/{userId}?page=1&limit=50
Authorization: Bearer {token}
```

#### Send Message
```http
POST /messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiverId": "userId",
  "content": "Hello, when are you available?"
}
```

### Review Endpoints

#### Create Review
```http
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "bookingId": "bookingId",
  "rating": 5,
  "comment": "Excellent tutor!",
  "aspects": {
    "communication": 5,
    "knowledge": 5,
    "punctuality": 5,
    "teaching": 5
  }
}
```

#### Get Tutor Reviews
```http
GET /reviews/tutor/{tutorId}?page=1&limit=10
```

### Admin Endpoints

All admin endpoints require admin role.

#### Get Dashboard Stats
```http
GET /admin/stats
Authorization: Bearer {adminToken}
```

#### Get All Users
```http
GET /admin/users?role=student&page=1
Authorization: Bearer {adminToken}
```

#### Verify Tutor
```http
PUT /admin/tutors/{tutorId}/verify
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "notes": "All documents verified"
}
```

## Security Features

### Password Security
- Bcrypt hashing with 12 rounds
- Password strength validation
- Secure password reset flow

### JWT Security
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Token rotation on refresh

### Rate Limiting
- Login: 5 attempts per 15 minutes
- Password reset: 3 attempts per hour
- OTP: 3 requests per 15 minutes
- General API: 100 requests per 15 minutes

### Input Validation
- Express-validator for all inputs
- XSS protection
- NoSQL injection prevention
- Input sanitization

### CORS
- Configured for specific frontend origin
- Credentials support enabled

## Deployment

### Docker Deployment

1. **Build image**
   ```bash
   docker build -t smart-tutor-api .
   ```

2. **Run container**
   ```bash
   docker run -d \
     --name smart-tutor-api \
     -p 5000:5000 \
     --env-file .env \
     smart-tutor-api
   ```

### PM2 Deployment

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Start application**
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Setup startup script**
   ```bash
   pm2 startup
   pm2 save
   ```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Configure MongoDB Atlas
- [ ] Set up Cloudinary account
- [ ] Configure email service
- [ ] Set up Telebirr merchant account
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Configure backup strategy
- [ ] Set up logging service

## Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## Monitoring

### Health Check
```http
GET /health
```

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running
- Check connection string
- Ensure network access (for Atlas)

### Email Not Sending
- Verify SMTP credentials
- Check email service status
- Review firewall settings

### Payment Issues
- Verify Telebirr credentials
- Check callback URL accessibility
- Review payment logs

## Support

For issues and questions:
- Create an issue in the repository
- Contact: support@smarttutor.com

## License

MIT License - see LICENSE file for details
