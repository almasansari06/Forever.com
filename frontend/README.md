# 📱 Frontend - Forever E-commerce

## 🎯 Project Overview

The **Frontend** is a modern React-based e-commerce application built with **Vite** and **Tailwind CSS**. It provides a seamless shopping experience with product browsing, cart management, user authentication, and order placement.

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | ^19.0.0 |
| **Vite** | Build Tool & Dev Server | ^6.2.0 |
| **React Router DOM** | Client-side Routing | ^7.4.1 |
| **Axios** | HTTP Client | ^1.8.4 |
| **Tailwind CSS** | Utility-first CSS | ^3.4.17 |
| **React Toastify** | Toast Notifications | ^11.0.5 |
| **Tailwind CSS Vite** | Tailwind Integration | ^4.1.2 |
| **ESLint** | Code Linting | ^9.21.0 |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Collection.jsx  # ✨ WITH PAGINATION (50 items/page)
│   │   ├── Product.jsx
│   │   ├── Cart.jsx
│   │   ├── PlaceOrder.jsx  # ✨ WITH COUNTRY CODES & ZIPCODE VALIDATION
│   │   ├── Orders.jsx
│   │   ├── Login.jsx
│   │   ├── MyProfile.jsx
│   │   ├── Verify.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx     # ✨ WITH COUNTRY CODES IN JOB FORM
│   │   └── ...
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductItem.jsx
│   │   ├── CartTotal.jsx
│   │   ├── Title.jsx
│   │   └── ...
│   ├── context/            # React Context API
│   │   └── ShopContext.jsx  # Global state management
│   ├── data/               # Data files
│   │   ├── assets.js
│   │   └── countryCodes.js # ✨ 250+ country codes with flags
│   ├── assets/             # Images & static files
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   ├── index.css           # Global styles
│   └── ...
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── index.html
└── public/                 # Static files
```

---

## ✨ Key Features Implemented

### 1. **Collection Page Pagination** 🎯
- Displays **50 products per page**
- Page number controls (1, 2, 3, etc.)
- Previous/Next navigation buttons
- Auto-reset to page 1 on filter change

### 2. **Zipcode Validation** ✅
- Accepts **numbers only**
- Automatically removes letters and special characters
- Applied to PlaceOrder form

### 3. **Country Code Selector** 🌍
- **250+ countries** with flags and phone codes
- **Searchable dropdown** (by country name or code)
- Full phone number saved with country code
- Applied to:
  - PlaceOrder form (default: +1)
  - Contact/Job application form (default: +91)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Backend API** running on `http://localhost:4000`

### Installation

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env.local file
   VITE_BACKEND_URL=http://localhost:4000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will run on: **http://localhost:5173**

---

## 📝 Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm build

# Preview production build locally
npm run preview

# Run ESLint for code quality
npm run lint
```

---

## 🔄 How It Works

### State Management
- **React Context API** (`ShopContext.jsx`) manages global state:
  - User authentication & profile
  - Cart items & amounts
  - Product listings
  - Theme (light/dark mode)

### Routing
- **React Router DOM** handles navigation:
  - `/` - Home page
  - `/collection` - Products collection with filters & pagination
  - `/product/:id` - Single product details
  - `/cart` - Shopping cart
  - `/place-order` - Checkout with country code selector
  - `/orders` - User orders
  - `/login` - Authentication
  - `/about` - About page
  - `/contact` - Contact & job application
  - `/verify` - Payment verification

### API Communication
- **Axios** makes HTTP requests to backend API:
  - GET products
  - POST orders
  - POST login/register
  - GET user profile
  - POST/GET reviews

### Styling
- **Tailwind CSS** with utility-first approach
- **Dark mode support** with theme toggle
- **Responsive design** (mobile, tablet, desktop)

---

## 🎨 UI/UX Features

✅ **Dark Mode Support**  
✅ **Mobile Responsive Design**  
✅ **Real-time Toast Notifications**  
✅ **Product Filtering & Sorting**  
✅ **Search Functionality**  
✅ **User Authentication**  
✅ **Shopping Cart**  
✅ **Order Tracking**  
✅ **Country Code Dropdown with Search**  
✅ **Pagination (50 items/page)**  

---

## 🔧 Configuration Files

### `vite.config.js`
- Vite build configuration
- React plugin setup
- Tailwind CSS integration

### `tailwind.config.js`
- Tailwind CSS customization
- Dark mode configuration
- Custom colors and spacing

### `postcss.config.js`
- PostCSS configuration for CSS processing
- Tailwind & Autoprefixer plugins

### `eslint.config.js`
- Code linting rules
- React best practices enforcement

---

## 📦 Dependencies

### Production Dependencies
```json
{
  "axios": "^1.8.4",           // HTTP client
  "react": "^19.0.0",          // UI framework
  "react-dom": "^19.0.0",      // React DOM binding
  "react-router-dom": "^7.4.1",// Routing
  "react-toastify": "^11.0.5", // Notifications
  "@tailwindcss/vite": "^4.1.2" // Tailwind integration
}
```

### Development Dependencies
- ESLint for code quality
- Vite for fast development
- Tailwind CSS for styling
- React types for TypeScript support

---

## 🌐 Environment Variables

Create `.env.local` file:

```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## 📱 Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

---

## 🔐 Authentication

- **JWT Token** stored in localStorage
- **Protected routes** with authentication check
- **User profile** fetched from backend
- **Logout** clears tokens and redirects

---

## 🛒 Shopping Features

### Product Management
- Browse products with filters
- Sort by relevance, price (low-high, high-low)
- View product details & reviews
- Add/remove from cart

### Cart & Checkout
- Persistent cart (stored in localStorage)
- Cart total calculation
- Shipping fee included
- Multiple payment methods:
  - Cash on Delivery (COD)
  - Stripe payment
  - Razorpay payment

### Order Management
- View order history
- Track order status
- Download invoices
- Cancel orders

---

## 🎯 New Features (Recently Added)

### ✨ Collection Pagination
- 50 items per page
- Page numbers at bottom
- Previous/Next buttons
- Smooth navigation

### ✨ Country Code Selector
- 250+ countries database
- Search by name or code
- Country flags for identification
- Supports international phone numbers

### ✨ Input Validation
- Zipcode: Numbers only
- Phone: Numbers only
- Real-time filtering

---

## 🐛 Troubleshooting

### Issue: Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Issue: Backend API not responding
- Ensure backend is running on `http://localhost:4000`
- Check `VITE_BACKEND_URL` in `.env.local`
- Verify network connectivity

### Issue: Tailwind CSS not loading
```bash
npm install -D tailwindcss postcss autoprefixer
npm run dev
```

---

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

---

## 👨‍💻 Development

### Code Quality
- ESLint for code consistency
- Hot Module Replacement (HMR) for instant updates
- Component-based architecture

### Best Practices
- Reusable components
- Context API for state management
- Proper error handling
- Loading states for API calls

---

## 📄 License

This project is part of the Forever E-commerce platform.

---

## 🤝 Support

For issues or questions, contact: **foreverglobal.new@gmail.com**

**Happy Coding!** 🚀
