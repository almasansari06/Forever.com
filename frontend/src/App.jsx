import React, { lazy, Suspense, useContext, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import ChatBot from './components/ChatBot'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ShopContext } from './context/ShopContext'

const Collection = lazy(() => import('./pages/Collection'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const DeliveryReturns = lazy(() => import('./pages/DeliveryReturns'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Product = lazy(() => import('./pages/Product'))
const Cart = lazy(() => import('./pages/Cart'))
const Login = lazy(() => import('./pages/Login'))
const PlaceOrder = lazy(() => import('./pages/PlaceOrder'))
const Orders = lazy(() => import('./pages/Orders'))
const MyProfile = lazy(() => import('./pages/MyProfile'))
const Verify = lazy(() => import('./pages/Verify'))

const App = () => {
  const { theme } = useContext(ShopContext)
  const { pathname } = useLocation()

  useEffect(() => {
    if (!pathname) return;

    window.history.scrollRestoration = 'manual';

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const frameId = window.requestAnimationFrame(resetScroll);
    const timeoutId = window.setTimeout(resetScroll, 100);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [pathname])

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100`}>
      <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
        <Navbar />
        <SearchBar />
        <Suspense fallback={<div className='min-h-[50vh] flex items-center justify-center text-sm text-gray-500'>Loading...</div>}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/collection' element={<Collection />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/delivery-returns' element={<DeliveryReturns />} />
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
            <Route path='/product/:productId' element={<Product />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/login' element={<Login />} />
            <Route path='/place-order' element={<PlaceOrder />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/verify' element={<Verify />} />
            <Route path='/profile' element={<MyProfile />} />
          </Routes>
        </Suspense>
        <Footer />
        <ChatBot />
      </div>
    </div>
  )
}

export default App
