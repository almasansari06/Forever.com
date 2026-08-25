import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductItem from './ProductItem'

const MAX_FEATURED_PRODUCTS = 8

const FeaturedProductCarousel = ({ products, viewMorePath }) => {
  const [hasInteracted, setHasInteracted] = useState(false)
  const featuredProducts = products.slice(0, MAX_FEATURED_PRODUCTS)
  const desktopPages = []
  const tabletPages = []
  const mobilePages = []

  for (let index = 0; index < featuredProducts.length; index += 4) {
    desktopPages.push(featuredProducts.slice(index, index + 4))
  }

  for (let index = 0; index < featuredProducts.length; index += 3) {
    tabletPages.push(featuredProducts.slice(index, index + 3))
  }

  for (let index = 0; index < featuredProducts.length; index += 2) {
    mobilePages.push(featuredProducts.slice(index, index + 2))
  }

  const productPage = (pageProducts, pageIndex, columns) => (
    <div key={pageIndex} className={`min-w-full snap-start grid ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4 px-1 sm:gap-6`}>
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

  useEffect(() => {
    const timer = window.setTimeout(() => setHasInteracted(true), 4500)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className='relative'>
      <div
        onScroll={() => setHasInteracted(true)}
        className='sm:hidden relative flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain scroll-smooth'
      >
        {!hasInteracted && products.length > MAX_FEATURED_PRODUCTS && <SwipeHint />}
        {mobilePages.map((page, index) => productPage(page, index, 2))}
        {products.length > MAX_FEATURED_PRODUCTS && (
          <div className='min-w-full snap-start flex items-center justify-center px-1'>
            <Link
              to={viewMorePath}
              className='w-36 h-12 self-center mx-auto flex items-center justify-center border border-gray-300 text-sm font-medium hover:bg-gray-100 transition-colors dark:border-slate-700 dark:hover:bg-slate-800'
            >
              View More
            </Link>
          </div>
        )}
      </div>

      <div
        onScroll={() => setHasInteracted(true)}
        className='hidden sm:flex md:hidden relative overflow-x-auto snap-x snap-mandatory overscroll-x-contain scroll-smooth'
      >
        {!hasInteracted && products.length > MAX_FEATURED_PRODUCTS && <SwipeHint />}
        {tabletPages.map((page, index) => productPage(page, index, 3))}
        {products.length > MAX_FEATURED_PRODUCTS && (
          <div className='min-w-full snap-start flex items-center justify-center px-1'>
            <Link to={viewMorePath} className='w-36 h-12 flex items-center justify-center border border-gray-300 text-sm font-medium hover:bg-gray-100 transition-colors dark:border-slate-700 dark:hover:bg-slate-800'>
              View More
            </Link>
          </div>
        )}
      </div>

      <div
        onScroll={() => setHasInteracted(true)}
        className='hidden md:flex relative overflow-x-auto snap-x snap-mandatory overscroll-x-contain scroll-smooth'
      >
        {!hasInteracted && products.length > MAX_FEATURED_PRODUCTS && <SwipeHint />}
        {desktopPages.map((page, index) => productPage(page, index, 4))}
        {products.length > MAX_FEATURED_PRODUCTS && (
          <div className='min-w-full snap-start flex items-center justify-center px-1'>
            <Link
              to={viewMorePath}
              className='w-36 h-12 self-center mx-auto flex items-center justify-center border border-gray-300 text-sm font-medium hover:bg-gray-100 transition-colors dark:border-slate-700 dark:hover:bg-slate-800'
            >
              View More
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

const SwipeHint = () => (
  <div className='swipe-hint' aria-hidden='true'>
    <span className='swipe-hint-hand'>👉</span>
    <span className='swipe-hint-text'>Swipe to see the products</span>
  </div>
)

export default FeaturedProductCarousel