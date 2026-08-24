import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const CancelledOrders = ({ token }) => {
  const [cancelled, setCancelled] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const fetchCancelled = async () => {
    if (!token) return;
    try {
      const response = await axios.post(backendUrl + '/api/order/cancelled-list', {}, { headers: { token } })
      if (response.data.success) {
        setCancelled(response.data.cancelled.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteHandler = async (id) => {
    if (!window.confirm('Permanently delete this cancelled order?')) return;
    try {
      const response = await axios.post(backendUrl + '/api/order/cancelled-delete', { cancelledId: id }, { headers: { token } })
      if (response.data.success) {
        toast.success(response.data.message)
        fetchCancelled()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchCancelled()
  }, [token])

  const totalPages = Math.ceil(cancelled.length / itemsPerPage)
  const paginatedCancelled = cancelled.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages || 1))
  }, [totalPages])

  return (
    <div>
      <h3 className='text-lg font-semibold mb-3'>Cancelled Orders</h3>
      {paginatedCancelled.map((c, idx) => (
        <div key={idx} className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 my-3 rounded bg-white'>
          <img className='w-12' src={assets.parcel_icon} alt="" />
          <div>
            <div>
              {c.items.map((item, i) => (
                <p key={i} className='py-0.5'>{item.name} x {item.quantity} <span>{item.size}</span></p>
              ))}
            </div>
            <p className='mt-3 mb-2 font-medium'>{c.address.firstName + ' ' + c.address.lastName}</p>
            <div>
              <p>{c.address.street + ','}</p>
              <p>{c.address.city + ', ' + c.address.state + ', ' + c.address.country + ', ' + c.address.zipcode}</p>
            </div>
            <p>{c.address.phone}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='text-sm'>Cancelled By: <strong className='capitalize'>{c.cancelledBy}</strong></p>
            {c.cancellationReason && <p>Reason: {c.cancellationReason}</p>}
            <p className='text-sm'>Date: {new Date(c.cancelledAt).toLocaleString()}</p>
            <p className='font-bold'>Amount: ${c.amount}</p>
            <button onClick={() => deleteHandler(c._id)} className='mt-2 bg-red-600 text-white px-3 py-1 rounded'>Delete Permanently</button>
          </div>
        </div>
      ))}
      {totalPages > 1 && (
        <div className='flex flex-wrap items-center justify-center gap-2 py-4'>
          <button type='button' onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className='rounded border px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'>Previous</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button type='button' key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`min-w-8 rounded border px-2 py-1.5 text-sm ${currentPage === pageNumber ? 'border-black bg-black text-white' : 'hover:bg-gray-100'}`}>
              {pageNumber}
            </button>
          ))}
          <button type='button' onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className='rounded border px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'>Next</button>
        </div>
      )}
      {cancelled.length === 0 && <div className='py-12 text-center text-gray-500'>No cancelled orders yet.</div>}
    </div>
  )
}

export default CancelledOrders
