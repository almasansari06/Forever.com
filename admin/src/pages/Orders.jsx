import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const displayStatus = (status) => status || 'Order Placed';

  const fetchAllOrders = async () => {
    if (!token) return null;
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', { orderId, status: event.target.value }, { headers: { token } })
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  const approvePaymentHandler = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/approve-payment',
        { orderId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Payment approved. Order is now confirmed and placed.');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const cancelOrderHandler = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel and remove this order?')) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/order/admin-cancel',
        { orderId },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message || 'Order Cancelled Successfully')
        await fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const confirmCancellationHandler = async (orderId) => {
    if (!window.confirm('Confirm cancellation for this order?')) return;
    try {
      const response = await axios.post(
        backendUrl + '/api/order/admin-cancel',
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Your order has been cancelled successfully.');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const rejectCancellationHandler = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/reject-cancellation',
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Cancellation request rejected');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || 'Failed to reject cancellation');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages || 1))
  }, [totalPages])

  return (
    <div className='space-y-4'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <p className='text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400'>Management</p>
          <h3 className='mt-1 text-2xl font-bold text-slate-900'>Orders</h3>
        </div>
        <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600'>Total: {orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500'>No orders found.</div>
      ) : (
        paginatedOrders.map((order, index) => (
          <div key={order._id || `order-${index}`} className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5'>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-[0.5fr_2.2fr_1.2fr_1fr_1.2fr] lg:items-start'>
              <div className='flex items-center justify-center rounded-xl bg-slate-100 p-3 lg:min-h-[90px]'>
                <img className='w-12' src={assets.parcel_icon} alt='' />
              </div>

              <div className='space-y-2'>
                <div className='rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500'>
                  Order ID: <span className='text-slate-700'>{order._id}</span>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm font-semibold text-slate-800'>Customer: {order.userName || 'Unknown User'}</p>
                  {order.items.map((item, itemIndex) => (
                    <p key={itemIndex} className='text-sm text-slate-700'>
                      {item.name} <span className='font-medium text-slate-500'>x {item.quantity}</span>
                      {item.size && <span className='ml-1 text-slate-400'>({item.size})</span>}
                    </p>
                  ))}
                </div>

                <div className='mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600'>
                  <p className='mb-1 font-semibold text-slate-800'>{order.address.firstName + ' ' + order.address.lastName}</p>
                  <p>{order.address.street}</p>
                  <p>{order.address.city + ', ' + order.address.state + ', ' + order.address.country + ', ' + order.address.zipcode}</p>
                  <p className='mt-1 text-slate-500'>{order.address.phone}</p>
                </div>
              </div>

              <div className='space-y-2 text-sm text-slate-600'>
                <p><span className='font-semibold text-slate-800'>Items</span>: {order.items.reduce((total, item) => total + Number(item.quantity || 0), 0)}</p>
                <p><span className='font-semibold text-slate-800'>Method</span>: {order.paymentMethod}</p>
                <p><span className='font-semibold text-slate-800'>Payment</span>: {order.payment ? 'Done' : 'Pending'}</p>
                <p><span className='font-semibold text-slate-800'>Date</span>: {new Date(order.date).toLocaleDateString()}</p>
              </div>

              <div className='flex items-center lg:justify-center'>
                <p className='text-xl font-bold text-slate-900'>{currency} {order.amount}</p>
              </div>

              <div className='flex flex-col gap-2 lg:items-end'>
                {order.status === 'Payment Pending' && order.paymentMethod === 'Stripe' ? (
                  <div className='rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-amber-700'>
                    Payment Pending
                  </div>
                ) : order.status === 'Delivered' ? (
                  <div className='rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700'>
                    {displayStatus('Delivered')}
                  </div>
                ) : (
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className='w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none ring-0 transition focus:border-slate-400 lg:max-w-[180px]'
                  >
                    <option value='Order Placed'>{displayStatus('Order Placed')}</option>
                    <option value='Packing'>{displayStatus('Packing')}</option>
                    <option value='Shipped'>{displayStatus('Shipped')}</option>
                    <option value='Out for delivery'>{displayStatus('Out for delivery')}</option>
                    <option value='Delivered'>{displayStatus('Delivered')}</option>
                  </select>
                )}

                {order.status === 'Payment Pending' && order.paymentMethod === 'Stripe' && (
                  <button
                    onClick={() => approvePaymentHandler(order._id)}
                    className='w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 lg:max-w-[180px]'
                  >
                    Approve Payment
                  </button>
                )}

                {order.status !== 'Delivered' && order.status !== 'Payment Pending' && (
                  <button
                    onClick={() => cancelOrderHandler(order._id)}
                    className='w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 lg:max-w-[180px]'
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {order.cancellationRequested && !order.cancellationConfirmed && (
              <div className='mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900'>
                <p className='mb-1 text-lg font-bold'>⚠️ User Requested Order Cancellation</p>
                {order.cancellationReason && <p className='mb-3 text-sm'>Reason: {order.cancellationReason}</p>}
                <div className='flex flex-wrap gap-3'>
                  <button onClick={() => confirmCancellationHandler(order._id)} className='rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700'>
                    Confirm this order
                  </button>
                  <button onClick={() => rejectCancellationHandler(order._id)} className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700'>
                    Not cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className='flex flex-wrap items-center justify-center gap-2 py-4'>
          <button
            type='button'
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className='rounded border px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              type='button'
              key={pageNumber}
              onClick={() => setCurrentPage(pageNumber)}
              className={`min-w-8 rounded border px-2 py-1.5 text-sm ${currentPage === pageNumber ? 'border-black bg-black text-white' : 'hover:bg-gray-100'}`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type='button'
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className='rounded border px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Orders
