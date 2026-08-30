import React, { lazy, Suspense, useEffect, useState } from 'react'
import Navbar from './components/NavBar'
import Sidebar from './components/SideBar'
import { Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
export const currency = '$'

const Add = lazy(() => import('./pages/Add'))
const List = lazy(() => import('./pages/List'))
const Orders = lazy(() => import('./pages/Orders'))
const CancelledOrders = lazy(() => import('./pages/CancelledOrders'))
const Users = lazy(() => import('./pages/Users'))
const Coupons = lazy(() => import('./pages/Coupons'))
const Shuffle = lazy(() => import('./pages/Shuffle'))

const App = () => {
  const storedToken = localStorage.getItem('token');
  const isTokenValidFormat = (t) => typeof t === 'string' && t.split('.').length === 3;
  const initialToken = isTokenValidFormat(storedToken) ? storedToken : '';

  const [token, setToken] = useState(initialToken);

  useEffect(() => {
    if (isTokenValidFormat(token)) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token])

  return (
    <div className='min-h-screen bg-slate-100 text-slate-800'>
      <ToastContainer position='top-right' autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover theme='colored' />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
            <Navbar setToken={setToken} />
            <div className='mx-auto max-w-[1600px] px-4 py-6 lg:px-6'>
              <div className='flex flex-col gap-6 lg:flex-row'>
                <Sidebar />
                <main className='flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-6'>
                  <Suspense fallback={<div className='flex min-h-[40vh] items-center justify-center text-sm text-slate-500'>Loading...</div>}>
                    <Routes>
                      <Route path='/add' element={<Add token={token} />} />
                      <Route path='/list' element={<List token={token} />} />
                      <Route path='/orders' element={<Orders token={token} />} />
                      <Route path='/cancelled' element={<CancelledOrders token={token} />} />
                      <Route path='/users' element={<Users token={token} />} />
                      <Route path='/coupons' element={<Coupons token={token} />} />
                      <Route path='/shuffle' element={<Shuffle token={token} />} />
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </div>
          </>
      }
    </div>
  )
}

export default App
