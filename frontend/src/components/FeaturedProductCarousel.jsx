import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductItem from './ProductItem'

const MAX_FEATURED_PRODUCTS = 15

const FeaturedProductCarousel = ({ products, viewMorePath }) => {
  const desktopCarouselRef = useRef(null)
  const mobileCarouselRef = useRef(null)
  const featuredProducts = products.slice(0, MAX_FEATURED_PRODUCTS)
  const desktopPages = []
  const mobilePages = []

  for (let index = 0; index < featuredProducts.length; index += 6) {
    desktopPages.push(featuredProducts.slice(index, index + 6))
  }

  for (let index = 0; index < featuredProducts.length; index += 4) {
    mobilePages.push(featuredProducts.slice(index, index + 4))
  }

  const productPage = (pageProducts, pageIndex, columns) => (
    <div key={pageIndex} className={`min-w-full snap-start grid ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'} grid-rows-2 gap-4 gap-y-6 px-1 sm:gap-6`}>
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
    const carousel = window.innerWidth < 768 ? mobileCarouselRef.current : desktopCarouselRef.current
    carousel?.scrollBy({
      left: direction * carousel.clientWidth,
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

      <div ref={mobileCarouselRef} className='md:hidden flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain scroll-smooth'>
        {mobilePages.map((page, index) => productPage(page, index, 2))}
        {products.length > MAX_FEATURED_PRODUCTS && (
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

      <div ref={desktopCarouselRef} className='hidden md:flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain scroll-smooth'>
        {desktopPages.map((page, index) => productPage(page, index, 3))}
        {products.length > MAX_FEATURED_PRODUCTS && (
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