# 👨‍💼 Admin Dashboard - Forever E-commerce

## 🎯 Project Overview

The **Admin Dashboard** is a powerful administrative interface built with React and Vite. It provides complete control over products, orders, users, and analytics. Admins can manage inventory, track orders, handle customer support, and view business metrics.

---

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | ^19.0.0 |
| **Vite** | Build Tool & Dev Server | ^6.2.0 |
| **React Router DOM** | Client-side Routing | ^7.16.0 |
| **Axios** | HTTP Client | ^1.17.0 |
| **Tailwind CSS** | Utility-first CSS | ^3.4.17 |
| **React Toastify** | Toast Notifications | ^2.6.0 |
| **React Hook Form** | Form Management | ^7.77.0 |
| **Zod** | Data Validation | ^4.4.3 |
| **ESLint** | Code Linting | ^9.21.0 |

---

## 📁 Project Structure

```
admin/
├── src/
│   ├── pages/              # Admin pages
│   │   ├── Add.jsx         # Add new products
│   │   ├── List.jsx        # Product listing & management
│   │   ├── Orders.jsx      # Order management
│   │   ├── Users.jsx       # User management
│   │   ├── CancelledOrders.jsx  # Cancelled orders
│   │   └── ...
│   ├── components/         # Reusable components
│   │   ├── NavBar.jsx      # Navigation bar
│   │   ├── SideBar.jsx     # Sidebar menu
│   │   ├── Login.jsx       # Admin login
│   │   └── ...
│   ├── assets/             # Images & icons
│   │   └── assets.js
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   ├── index.css           # Global styles
│   └── ...
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── vercel.json             # Vercel deployment
├── index.html
└── public/                 # Static files
```

---

## 🎯 Admin Features

### 📦 Product Management
- ✅ Add new products with images (Cloudinary)
- ✅ Edit existing products
- ✅ Delete products
- ✅ Manage product categories & sizes
- ✅ Set pricing & discounts
- ✅ Upload product images directly
- ✅ Bulk operations

### 📋 Order Management
- ✅ View all orders with details
- ✅ Update order status (Pending → Shipped → Delivered)
- ✅ Cancel orders
- ✅ Track order history
- ✅ View cancelled orders separately
- ✅ Process refunds
- ✅ Export order reports

### 👥 User Management
- ✅ View registered users
- ✅ Manage user accounts
- ✅ Block/unblock users
- ✅ View user purchase history
- ✅ Handle customer support

### 📊 Analytics & Reports
- ✅ Dashboard overview
- ✅ Sales statistics
- ✅ Order analytics
- ✅ Product performance
- ✅ Revenue reports

### 🔐 Admin Authentication
- ✅ Secure login
- ✅ JWT token management
- ✅ Session persistence
- ✅ Logout functionality

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Backend API** running on `http://localhost:4000`
- **Admin account** with credentials

### Installation

1. **Navigate to admin folder:**
   ```bash
   cd admin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create `.env.local` file:
   ```env
   VITE_BACKEND_URL=http://localhost:4000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The dashboard will run on: **http://localhost:5174**

---

## 📝 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint for code quality
npm run lint
```

---

## 🔐 Admin Login

### Default Admin Credentials
- **Email:** `foreverglobal.new@gmail.com`
- **Password:** `forever9211` (or as configured in backend .env)

### Login Flow
1. Navigate to Admin Dashboard
2. Enter email & password
3. Click "Login"
4. Dashboard access granted upon successful authentication
5. JWT token stored in localStorage

---

## 📱 Dashboard Pages

### 1. **Add Products** (`/add`)
- Form to create new products
- Image upload via Cloudinary
- Set prices, sizes, categories
- Save to database
- Real-time validation

### 2. **Product List** (`/list`)
- Table view of all products
- Inline editing
- Delete functionality
- Search & filter options
- Pagination support

### 3. **Orders** (`/orders`)
- Display all customer orders
- Update order status
- View order details
- Track order timeline
- Download receipts

### 4. **Cancelled Orders** (`/cancelled-orders`)
- Separate view for cancelled orders
- Reason for cancellation
- Refund status
- Customer contact info

### 5. **Users** (`/users`)
- User account management
- View user details
- Account status control
- Purchase history
- Support tickets

### 6. **Dashboard** (`/`)
- Overview statistics
- Quick metrics
- Recent orders
- Top products
- Revenue charts (future)

---

## 🔄 How It Works

### State Management
- **React Context API** or **Redux** for global state
- **Local state** with `useState`
- **Persistent storage** with localStorage

### Authentication
- **JWT tokens** for API authentication
- **Protected routes** checking token existence
- **Automatic logout** on token expiration
- **Redirect to login** on unauthorized access

### API Integration
- **Axios interceptors** for automatic token injection
- **Error handling** with toast notifications
- **Loading states** for user feedback
- **Retry logic** for failed requests

### Form Management
- **React Hook Form** for efficient form handling
- **Zod validation** for data integrity
- **Real-time field validation**
- **Error messages** on invalid input

---

## 🎨 UI/UX Features

✅ **Responsive Design** (Mobile, Tablet, Desktop)  
✅ **Dark Mode Support**  
✅ **Sidebar Navigation**  
✅ **Toast Notifications**  
✅ **Loading Spinners**  
✅ **Confirmation Dialogs**  
✅ **Data Tables with Sorting**  
✅ **Search & Filter**  
✅ **Form Validation**  
✅ **Image Upload Preview**  

---

## 📊 Product Management Details

### Add Product
```javascript
{
  name: string,
  description: string,
  price: number,
  image: File (Cloudinary upload),
  category: string (Men/Women/Kids),
  subCategory: string (ProductType),
  sizes: array (S, M, L, XL, XXL),
  bestseller: boolean
}
```

### Edit Product
- Update any product field
- Replace product image
- Modify pricing
- Change availability status

### Delete Product
- Soft delete or hard delete options
- Archive instead of removing
- Confirmation required

---

## 📦 Order Management Workflow

```
Order Placed (Backend)
    ↓
Pending (Admin Reviews)
    ↓
Processing (Preparing for shipment)
    ↓
Shipped (Package in transit)
    ↓
Delivered (Customer received)
    ↓
Completed / Cancelled
```

---

## 📤 Image Upload Process

1. Admin selects image from file system
2. Image preview shown in form
3. On form submit, image sent to Cloudinary
4. Cloudinary returns optimized URL
5. URL stored in MongoDB
6. CDN serves image to frontend

---

## 🔒 Security Features

✅ **JWT Authentication**  
✅ **Admin Authorization Checks**  
✅ **Secure Token Storage**  
✅ **HTTPS (Production)**  
✅ **Input Validation & Sanitization**  
✅ **CORS Configuration**  
✅ **Rate Limiting** (Optional)  

---

## 🧩 Component Structure

### Layouts
- **NavBar** - Top navigation with logo & user info
- **SideBar** - Left sidebar with menu options
- **MainContent** - Central content area

### Form Components
- **ProductForm** - Add/Edit products
- **OrderForm** - Update order status
- **UserForm** - Manage user details

### Display Components
- **ProductTable** - List all products
- **OrderTable** - Display orders
- **UserTable** - Show user list
- **StatsCard** - Dashboard metrics

---

## 🌐 Environment Variables

Create `.env.local` file:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:4000

# Admin credentials (for development only)
VITE_ADMIN_EMAIL=foreverglobal.new@gmail.com
```

---

## 🐛 Troubleshooting

### Issue: Cannot login
- Verify backend is running
- Check admin credentials
- Ensure `.env` has correct BACKEND_URL

### Issue: Images not uploading
- Verify Cloudinary account
- Check API credentials in backend
- Ensure file size < 5MB

### Issue: Orders not loading
- Check backend API connection
- Verify JWT token validity
- Check user permissions

---

## 📊 Performance Optimization

- **Code splitting** with dynamic imports
- **Image optimization** via Cloudinary
- **Lazy loading** components
- **Caching** API responses
- **Minified bundles** in production

---

## 🚀 Deployment

### Vercel Deployment
```bash
# Build project
npm run build

# Vercel auto-deploys from GitHub
# Configure environment variables in Vercel dashboard
```

### Environment Variables (Production)
Set in Vercel/hosting dashboard:
- `VITE_BACKEND_URL` - Production API URL

---

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [Axios](https://axios-http.com)

---

## 🔗 API Integration Examples

### Fetch Products
```javascript
const response = await axios.get(
  `${backendUrl}/api/product/list`,
  { headers: { token } }
);
```

### Add Product
```javascript
const formData = new FormData();
formData.append('name', productName);
formData.append('image', imageFile);

const response = await axios.post(
  `${backendUrl}/api/product/add`,
  formData,
  { headers: { token } }
);
```

### Update Order Status
```javascript
const response = await axios.put(
  `${backendUrl}/api/order/update-status`,
  { orderId, status: 'Shipped' },
  { headers: { token } }
);
```

---

## 📄 License

This project is part of the Forever E-commerce platform.

---

## 🤝 Support

For admin dashboard issues:
- **Email:** foreverglobal.new@gmail.com
- **Contact:** +91 999915299

**Happy Managing!** 🚀
