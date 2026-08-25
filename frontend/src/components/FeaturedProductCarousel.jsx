import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductItem from './ProductItem'

const PRODUCTS_PER_PAGE = 15

const FeaturedProductCarousel = ({ products, viewMorePath }) => {
  const carouselRef = useRef(null)
  const pages = []
  for (let index = 0; index < products.length; index += PRODUCTS_PER_PAGE) {
    pages.push(products.slice(index, index + PRODUCTS_PER_PAGE))
  }

  const productPage = (pageProducts, pageIndex) => (
    <div key={pageIndex} className='min-w-full snap-start grid grid-cols-2 gap-4 gap-y-6 px-1 sm:gap-6'>
      {pageProducts.map((item, index) => (
        <ProductItem
          key={item._id || `${pageIndex}-${index}`}
          id={item._id}
          image={item.image}
          name={item.name}
          price={item.price}
          outOfStock={Boolean(item.outOfStock)}
          watermarked={Boolean(item.logoWatermarked)}
        />
      ))}
    </div>
  )

  const moveCarousel = (direction) => {
    carouselRef.current?.scrollBy({
      left: direction * carouselRef.current.clientWidth,
      behavior: 'smooth',
    })
  }

  return (
    <div className='relative'>
      <div className='flex justify-end gap-2 mb-4'>
        <button
          type='button'
          onClick={() => moveCarousel(-1)}
          aria-label='Previous products'
          className='w-9 h-9 border border-gray-300 text-lg leading-none hover:bg-gray-100 transition-colors dark:border-slate-700 dark:hover:bg-slate-800'
        >
          &#8592;
        </button>
        <button
          type='button'
          onClick={() => moveCarousel(1)}
          aria-label='Next products'
          className='w-9 h-9 border border-gray-300 text-lg leading-none hover:bg-gray-100 transition-colors dark:border-slate-700 dark:hover:bg-slate-800'
        >
          &#8594;
        </button>
      </div>

      <div ref={carouselRef} className='flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain scroll-smooth'>
        {pages.map(productPage)}
        {products.length > PRODUCTS_PER_PAGE && (
          <div className='min-w-full snap-start flex items-center justify-center px-1'>
            <Link
              to={viewMorePath}
              className='w-full min-h-32 flex items-center justify-center border border-gray-300 text-sm font-medium hover:bg-gray-100 transition-colors dark:border-slate-700 dark:hover:bg-slate-800'
            >
              View More
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default FeaturedProductCarousel