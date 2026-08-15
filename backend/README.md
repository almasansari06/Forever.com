# 🛠️ Backend - Forever E-commerce API

## 🎯 Project Overview

The **Backend** is a robust Node.js + Express API server that powers the Forever E-commerce platform. It handles user authentication, product management, orders, payments, and integrations with Stripe, Razorpay, and Cloudinary.

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime Environment | Latest LTS |
| **Express.js** | Web Framework | Latest |
| **MongoDB** | NoSQL Database | Cloud Atlas |
| **Mongoose** | ODM Library | Latest |
| **JWT** | Authentication | JSON Web Tokens |
| **Bcryptjs** | Password Hashing | Latest |
| **Stripe** | Payment Gateway | Latest API |
| **Razorpay** | Payment Gateway | Latest API |
| **Cloudinary** | Image CDN | Latest |
| **Dotenv** | Environment Config | Latest |

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── mongodb.js         # MongoDB connection setup
│   └── cloudinary.js      # Cloudinary configuration
├── controllers/           # Business logic
│   ├── userController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── reviewController.js
│   └── ...
├── middleware/            # Express middleware
│   ├── auth.js            # JWT authentication
│   ├── adminAuth.js       # Admin verification
│   └── multer.js          # File upload handling
├── models/                # MongoDB schemas
│   ├── userModel.js
│   ├── productModel.js
│   ├── orderModel.js
│   ├── cancelledOrderModel.js
│   ├── reviewModel.js
│   ├── productTypeModel.js
│   └── ...
├── routes/                # API endpoints
│   ├── userRoute.js
│   ├── productRoute.js
│   ├── cartRoute.js
│   ├── orderRoute.js
│   ├── reviewRoute.js
│   ├── productTypeRoute.js
│   └── ...
├── utils/
│   └── emailService.js    # Email notifications
├── scripts/               # Utility scripts
│   ├── admin_login.json
│   ├── gen_token_and_image.js
│   └── test_cloudinary.js
├── uploads/               # File uploads
│   └── resumes/
├── .env                   # Environment variables
├── .vercel/               # Vercel deployment config
├── vercel.json            # Vercel settings
├── server.js              # Entry point
└── package.json
```

---

## ⚙️ Configuration

### `config/mongodb.js`
- MongoDB connection with Mongoose
- Fallback to in-memory MongoDB for testing
- Connection event handlers

### `config/cloudinary.js`
- Cloudinary SDK initialization
- Image upload configuration
- CDN URL generation

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (Cloud database)
- **Stripe** account (Payment processing)
- **Razorpay** account (Payment processing)
- **Cloudinary** account (Image hosting)

### Installation

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create `.env` file:
   ```env
   PORT=4000
   
   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/forever
   
   # JWT Secret
   JWT_SECRET=your_secret_key_here
   
   # Admin Credentials
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=secure_password
   
   # Payment Gateways
   STRIPE_SECRET_KEY=sk_test_xxxxx
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   
   # Cloudinary
   CLOUDINARY_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_SECRET_KEY=your_secret_key
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   The server will run on: **http://localhost:4000**

---

## 📝 Available Scripts

```bash
# Start server (requires nodemon)
npm start

# Run with node directly
node server.js

# Install dependencies
npm install
```

---

## 🔄 API Architecture

### Authentication Flow
1. User registers/logs in
2. JWT token generated & sent to frontend
3. Token stored in localStorage
4. Token sent in request headers for protected routes
5. Backend verifies token with `auth.js` middleware

### Request/Response Pattern
```javascript
// Protected Route Example
GET /api/user/get-profile
Headers: { token: "jwt_token_here" }

Response: {
  success: true,
  userData: {
    _id: "user_id",
    name: "User Name",
    email: "user@example.com",
    phone: "+919876543210",
    address: {...},
    ...
  }
}
```

---

## 🛣️ API Routes

### User Routes (`/api/user/`)
```
POST   /register              - User registration
POST   /login                 - User login
GET    /get-profile           - Get user profile (Protected)
PUT    /update-profile        - Update profile (Protected)
POST   /apply-job             - Job application
POST   /logout                - Logout (Protected)
```

### Product Routes (`/api/product/`)
```
GET    /list                  - Get all products
GET    /single/:id            - Get product details
POST   /add                   - Add product (Admin)
PUT    /update/:id            - Update product (Admin)
DELETE /delete/:id            - Delete product (Admin)
```

### Cart Routes (`/api/cart/`)
```
POST   /add                   - Add to cart (Protected)
GET    /get                   - Get cart items (Protected)
PUT    /update                - Update cart (Protected)
```

### Order Routes (`/api/order/`)
```
POST   /place                 - Place order (Protected)
POST   /stripe                - Stripe payment (Protected)
POST   /razorpay              - Razorpay payment (Protected)
GET    /list                  - Get user orders (Protected)
```

### Review Routes (`/api/review/`)
```
POST   /add                   - Add review (Protected)
GET    /list/:productId       - Get product reviews
DELETE /delete/:id            - Delete review (Protected)
```

---

## 🔐 Authentication & Authorization

### Middleware
- **`auth.js`** - Verifies JWT token for protected routes
- **`adminAuth.js`** - Verifies admin privileges
- **`multer.js`** - Handles file uploads (resumes, images)

### Token Structure
```javascript
JWT Token = Header.Payload.Signature

Payload: {
  userId: "user_id",
  iat: timestamp,
  exp: expiration_timestamp
}
```

---

## 💳 Payment Integration

### Stripe Integration
- Secure payment processing
- Card payment support
- Webhook handling
- Transaction verification

### Razorpay Integration
- Indian payment gateway
- Multiple payment methods
- Order creation & verification
- Webhook notifications

---

## 📤 File Upload (Cloudinary)

- **Resume uploads** via job application
- **Product images** management
- **Auto-optimize** images
- **CDN delivery** for fast loading
- **Security** with access tokens

---

## 📧 Email Service

**`utils/emailService.js`** handles:
- Order confirmation emails
- Payment receipts
- Job application acknowledgments
- User notifications

---

## 🗄️ MongoDB Models

### User Model
```javascript
{
  name, email, password, phone, address, createdAt, status
}
```

### Product Model
```javascript
{
  name, price, category, subCategory, image, description, sizes, reviews, createdAt
}
```

### Order Model
```javascript
{
  userId, items, amount, status, address, paymentMethod, createdAt, paymentVerified
}
```

### Review Model
```javascript
{
  productId, userId, rating, comment, createdAt
}
```

---

## 🔍 Database Queries

- **Indexed fields** for fast lookups
- **Population** for related data
- **Aggregation** for reports
- **Transactions** for data consistency

---

## 🛡️ Security Features

✅ **Password Hashing** with Bcryptjs  
✅ **JWT Authentication** for API security  
✅ **Admin Authorization** checks  
✅ **Input Validation** on all endpoints  
✅ **CORS** enabled for frontend  
✅ **Environment Variables** for sensitive data  
✅ **Rate Limiting** (optional)  

---

## 🔧 Error Handling

All API responses follow pattern:
```javascript
{
  success: true/false,
  message: "Error/Success message",
  data: {...}  // If applicable
}
```

---

## 📊 Deployment

### Vercel Deployment
- **`vercel.json`** - Deployment configuration
- **Serverless functions** compatible
- **Environment variables** configured
- **Auto-deploy** on push to main

### Local Testing
```bash
npm start
# Server runs on http://localhost:4000
```

---

## 🧪 Testing Scripts

### `scripts/test_cloudinary.js`
- Test Cloudinary connection
- Verify API keys
- Test image upload

### `scripts/gen_token_and_image.js`
- Generate JWT tokens
- Test authentication
- Create test data

### `scripts/admin_login.json`
- Default admin credentials
- Authentication test data

---

## 🐛 Troubleshooting

### MongoDB Connection Issue
```
Error: connect ECONNREFUSED
Solution: Check MONGODB_URI in .env
         Verify MongoDB Atlas cluster access
```

### Missing Environment Variables
```
Error: undefined token secret
Solution: Ensure all .env variables are set
         Restart server after changes
```

### Cloudinary Upload Fails
```
Error: Invalid API key
Solution: Verify CLOUDINARY_* keys in .env
         Check folder permissions
```

---

## 📚 Learn More

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Stripe API](https://stripe.com/docs/api)
- [Razorpay API](https://razorpay.com/docs/api)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

## 📋 Dependencies Overview

```json
{
  "express": "Web framework",
  "mongoose": "MongoDB ODM",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "axios": "HTTP client",
  "stripe": "Stripe API",
  "razorpay": "Razorpay API",
  "cloudinary": "Image CDN",
  "dotenv": "Environment config",
  "nodemon": "Development auto-reload"
}
```

---

## 🎯 Next Steps

1. ✅ Set up MongoDB Atlas cluster
2. ✅ Configure Stripe/Razorpay accounts
3. ✅ Set up Cloudinary account
4. ✅ Create `.env` file with credentials
5. ✅ Install dependencies: `npm install`
6. ✅ Start server: `npm start`
7. ✅ Test with Postman or API client

---

## 📄 License

This project is part of the Forever E-commerce platform.

---

## 🤝 Support

For API issues or questions:
- **Email:** foreverglobal.new@gmail.com
- **Documentation:** Check each route file for details

**Happy Coding!** 🚀
