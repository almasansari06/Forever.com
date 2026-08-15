# 🚀 Forever E-commerce Platform

A complete full-stack e-commerce solution with **Admin Dashboard**, **Frontend Store**, and **Backend API**.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Features](#features)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Support](#support)

---

## 🎯 Project Overview

**Forever** is a modern e-commerce platform offering:

- 🛍️ **User-friendly shopping experience** with advanced filtering & search
- 👨‍💼 **Powerful admin dashboard** for business management
- 💳 **Multiple payment gateways** (Stripe, Razorpay, COD)
- 📱 **Fully responsive design** (Mobile, Tablet, Desktop)
- 🌓 **Dark mode support** for comfortable browsing
- 🔒 **Secure authentication** with JWT tokens
- 📧 **Email notifications** for orders & updates
- 🖼️ **Cloud image hosting** with Cloudinary
- 📊 **Order analytics** and reporting

---

## 🛠️ Tech Stack

### Frontend (Customer Store)
- React 19 + Vite
- React Router DOM (Navigation)
- Tailwind CSS (Styling)
- Axios (HTTP Client)
- React Toastify (Notifications)

### Admin Dashboard
- React 19 + Vite
- Tailwind CSS
- React Hook Form (Forms)
- Zod (Validation)
- Axios (API)

### Backend
- Node.js + Express
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- Stripe & Razorpay (Payments)
- Cloudinary (Images)

### Deployment
- Vercel (Frontend & Admin)
- MongoDB Atlas (Cloud Database)
- Cloudinary (Image CDN)

---

## 📁 Project Structure

```
Forever/
├── frontend/           # Customer store (React + Vite)
│   ├── src/
│   │   ├── pages/     # Store pages (Home, Collection, Cart, etc.)
│   │   ├── components/# Reusable UI components
│   │   ├── context/   # Global state (ShopContext)
│   │   ├── data/      # Static data (countryCodes.js)
│   │   └── assets/    # Images & styles
│   ├── package.json
│   ├── vite.config.js
│   └── README.md      # Frontend documentation
│
├── admin/             # Admin dashboard (React + Vite)
│   ├── src/
│   │   ├── pages/     # Admin pages (Products, Orders, Users)
│   │   ├── components/# Dashboard components
│   │   └── assets/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md      # Admin documentation
│
├── backend/           # REST API (Node + Express)
│   ├── config/        # Database & service configs
│   ├── controllers/   # API logic
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth, uploads, etc.
│   ├── utils/         # Helper functions
│   ├── server.js      # Entry point
│   ├── .env           # Environment config
│   └── README.md      # Backend documentation
│
└── This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16+)
- **npm/yarn** package manager
- **MongoDB Atlas** account (free tier available)
- **Git** for version control

### 1️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file with credentials
# (See backend/README.md for details)

# Start server
npm start
# Server runs on http://localhost:4000
```

### 2️⃣ Frontend Setup (Customer Store)

```bash
# In new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Store runs on http://localhost:5173
```

### 3️⃣ Admin Dashboard Setup

```bash
# In another terminal, navigate to admin
cd admin

# Install dependencies
npm install

# Start development server
npm run dev
# Dashboard runs on http://localhost:5174
```

### ✅ All Running!
- **Frontend:** http://localhost:5173
- **Admin:** http://localhost:5174
- **Backend API:** http://localhost:4000

---

## ✨ Key Features

### 🛍️ Customer Store Features

#### Product Discovery
- Browse all products
- **50 products per page with pagination** ✨
- Filter by category & type
- Sort by price (low-high, high-low)
- Search products in real-time
- View product details & reviews

#### Shopping Cart
- Add/remove items
- Update quantities
- Persistent cart (localStorage)
- Cart total calculation

#### Checkout
- Secure order placement
- Multiple payment methods:
  - Cash on Delivery (COD)
  - Stripe card payment
  - Razorpay wallet
- **Country code selector for phone** ✨
- **Zipcode numbers-only validation** ✨
- Order confirmation emails

#### User Account
- Register/Login
- View profile
- Update address & details
- View order history
- Track order status
- Download invoices

#### Additional
- Dark/Light theme toggle
- Responsive design
- Toast notifications
- Search bar
- Newsletter subscription

---

### 👨‍💼 Admin Dashboard Features

#### Product Management
- Add new products with images
- Edit product details
- Delete products
- Set prices & discounts
- Manage sizes & categories
- Upload images to Cloudinary

#### Order Management
- View all orders
- Update order status
- Cancel orders
- View order details
- Track payment status
- Process refunds

#### User Management
- View registered users
- Manage user accounts
- Block/unblock users
- View purchase history
- Customer support

#### Analytics
- Dashboard overview
- Sales statistics
- Order analytics
- Product performance
- Revenue reports

---

### 🔧 Backend Features

#### User Management
- Registration & authentication
- Profile management
- Address handling
- Account status control

#### Product Management
- Create/Read/Update/Delete products
- Image handling (Cloudinary)
- Category management
- Product reviews & ratings

#### Order Processing
- Order creation
- Payment processing (Stripe/Razorpay)
- Order status tracking
- Email notifications
- Refund handling

#### Security
- JWT authentication
- Admin authorization
- Password encryption (Bcryptjs)
- Input validation
- CORS protection

---

## 🎨 New Features (Recently Added)

### ✨ Collection Pagination
- **50 products per page**
- **Page number controls** (1, 2, 3...)
- **Previous/Next buttons**
- Auto-reset to page 1 on filter change

### ✨ Country Code Selector
- **250+ countries database**
- **With country flags**
- **Searchable by name or code**
- Applied to:
  - PlaceOrder form (default: +1)
  - Contact job form (default: +91)
- **Full phone saved with country code**

### ✨ Input Validation
- **Zipcode:** Numbers only
- **Phone:** Numbers only
- Real-time filtering

---

## 🏗️ Architecture

### Frontend Architecture
```
Components (UI)
    ↓
React Router (Navigation)
    ↓
ShopContext (State Management)
    ↓
Axios (API Calls)
    ↓
Backend API
```

### Backend Architecture
```
API Routes
    ↓
Middleware (Auth, Validation)
    ↓
Controllers (Business Logic)
    ↓
Models (MongoDB Schemas)
    ↓
Database (MongoDB Atlas)
```

---

## 🔐 Authentication Flow

1. **User Registration**
   - Email & password sent to backend
   - Password hashed with Bcryptjs
   - User saved in MongoDB

2. **User Login**
   - Credentials verified
   - JWT token generated
   - Token sent to frontend

3. **API Requests**
   - Token stored in localStorage
   - Included in request headers
   - Backend verifies token
   - Access granted/denied

4. **Logout**
   - Token removed from localStorage
   - User redirected to home

---

## 💳 Payment Integration

### Stripe
- Secure card payments
- PCI DSS compliant
- Webhook handling
- Test mode available

### Razorpay
- Indian payment gateway
- Multiple payment methods
- Order verification
- Webhook notifications

### Cash on Delivery
- No payment processing
- Manual verification
- Order tracking

---

## 🌐 Database Schema

### User Model
```javascript
{
  _id, name, email, password, phone,
  address: { street, city, state, country, zipcode },
  status, createdAt, orders: []
}
```

### Product Model
```javascript
{
  _id, name, description, price, image,
  category, subCategory, sizes: [],
  bestseller, reviews: [], createdAt
}
```

### Order Model
```javascript
{
  _id, userId, items: [{productId, quantity, price}],
  totalAmount, status, paymentMethod,
  address, paymentVerified, createdAt
}
```

---

## 📊 Environment Variables

### Backend (.env)
```env
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
CLOUDINARY_NAME=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

### Frontend (.env.local)
```env
VITE_BACKEND_URL=http://localhost:4000
```

### Admin (.env.local)
```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## 🚀 Deployment

### Vercel Deployment (Frontend & Admin)
```bash
# Frontend
cd frontend
npm run build
# Deploy to Vercel

# Admin
cd admin
npm run build
# Deploy to Vercel
```

### Backend Deployment (Vercel/Railway/Render)
```bash
# Push to GitHub
git push origin main

# Auto-deploy via Vercel/Railway webhook
```

### Database (MongoDB Atlas)
- Create free cluster
- Set connection string in .env
- Enable IP whitelist
- Auto-backups enabled

---

## 📚 Documentation

Each folder has detailed documentation:
- **[frontend/README.md](frontend/README.md)** - Store setup & features
- **[admin/README.md](admin/README.md)** - Dashboard guide
- **[backend/README.md](backend/README.md)** - API documentation

---

## 🔧 Development Tips

### Hot Reload
- Frontend & Admin: Automatic with Vite (HMR)
- Backend: Use `nodemon` for auto-restart

### Debugging
- Browser DevTools for frontend
- Network tab for API calls
- MongoDB Atlas UI for database

### Testing
- Use Postman for API testing
- Browser console for frontend issues
- Check backend logs for server errors

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port
npm run dev -- --port 3000
```

### MongoDB Connection Failed
- Verify connection string
- Check IP whitelist in Atlas
- Ensure network connectivity

### API Not Responding
- Check if backend is running
- Verify BACKEND_URL in .env
- Check CORS configuration

---

## 📈 Performance

- **Frontend:** Optimized with Vite (fast builds)
- **Database:** Indexed fields for quick queries
- **Images:** Optimized via Cloudinary CDN
- **Caching:** Browser & server-side caching

---

## 📚 Tech Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI** | React 19 | Modern component library |
| **Build** | Vite | Fast bundler & dev server |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Routing** | React Router | Client-side navigation |
| **State** | Context API | Global state management |
| **Forms** | React Hook Form | Efficient form handling |
| **API** | Axios | HTTP client |
| **Backend** | Express | Web framework |
| **Database** | MongoDB | NoSQL database |
| **ODM** | Mongoose | MongoDB object modeling |
| **Auth** | JWT | Token-based auth |
| **Payments** | Stripe/Razorpay | Payment processing |
| **Images** | Cloudinary | Image CDN |

---

## 🎯 Future Enhancements

- 📊 Advanced analytics dashboard
- 🔍 Elasticsearch for better search
- 🤖 AI-powered recommendations
- 📱 Mobile app (React Native)
- 💬 Live chat support
- 📦 Inventory management
- 🎁 Loyalty program
- 📈 Sales forecasting

---

## 📄 License

All rights reserved © 2024 Forever Global

---

## 🤝 Contact & Support

**Company:** Forever Global  
**Email:** foreverglobal.new@gmail.com  
**Phone:** +91 999915299, +976 50-523-4444  
**Location:** Al Wahda St, Industrial Area 4, Sharjah, UAE

---

## 👨‍💻 Development Team

Built with ❤️ by the Forever Development Team

---

## 🎉 Thank You!

Thank you for using Forever E-commerce Platform!

**Happy Coding!** 🚀
