import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProduct from '../components/RelatedProduct';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // Jab bhi new product page open ho, page auto top par scroll ho jaye
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!products || products.length === 0) return;

    const product = products.find(item => item._id === productId);
    if (product) {
      setProductData(product);
      setImage(product.image[0]);
      setCurrentImageIndex(0);
      setViewerOpen(false);
      setSize(''); // Reset selected size on product change
    } else {
      setProductData(null);
    }
  }, [productId, products]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') setViewerOpen(false);
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const openImageViewer = (index) => {
    if (!productData || !productData.image || productData.image.length === 0) return;
    setCurrentImageIndex(index);
    setImage(productData.image[index]);
    setViewerOpen(true);
  };

  const showNextImage = () => {
    if (!productData || !productData.image || productData.image.length === 0) return;
    const nextIndex = (currentImageIndex + 1) % productData.image.length;
    setCurrentImageIndex(nextIndex);
    setImage(productData.image[nextIndex]);
  };

  const showPreviousImage = () => {
    if (!productData || !productData.image || productData.image.length === 0) return;
    const prevIndex = (currentImageIndex - 1 + productData.image.length) % productData.image.length;
    setCurrentImageIndex(prevIndex);
    setImage(productData.image[prevIndex]);
  };

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches[0].clientX);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null) return;
    const touchEndX = event.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        showNextImage();
      } else {
        showPreviousImage();
      }
    }

    setTouchStartX(null);
  };

  if (!products || !productData) {
    return <div className="text-center py-10 text-gray-500">Loading Product...</div>;
  }

  return (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>

      {/* Product Data */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
        {/* Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
            <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {productData.image.map((item, index) => (
              <img onClick={() => { setImage(item); setCurrentImageIndex(index); openImageViewer(index); if (imageRef.current) imageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
            ))}
          </div>
          <div ref={imageRef} className='w-full sm:w-[80%]'>
            <img onClick={() => openImageViewer(currentImageIndex)} className='w-full h-auto cursor-zoom-in' src={image} alt="" />
          </div>
        </div>

        {/* Details */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            {[...Array(4)].map((_, i) => <img src={assets.star_icon} alt="" key={i} className="w-3.5" />)}
            <img src={assets.star_dull_icon} alt="" className="w-3.5" />
            <p className='pl-2'>(122)</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          {/* Render Size Section ONLY if sizes exist */}
          {productData.sizes && productData.sizes.length > 0 && (
            <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2 flex-wrap'>
                {productData.sizes.map((item, index) => (
                  <button 
                    onClick={() => setSize(item)} 
                    className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500 bg-orange-50 font-semibold' : ''}`} 
                    key={index}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => addToCart(productData._id, size)} 
            className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700 mt-6 cursor-pointer'
          >
            ADD TO CART
          </button>
          
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
            <p>100% Original products.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet...</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations...</p>
        </div>
      </div>

      {viewerOpen && (
        <div className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4' onClick={() => setViewerOpen(false)}>
          <div className='relative w-full max-w-4xl' onClick={(event) => event.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <button
              type='button'
              className='absolute -top-12 right-0 text-white text-3xl leading-none cursor-pointer'
              aria-label='Close image viewer'
              onClick={() => setViewerOpen(false)}
            >
              ×
            </button>
            <button
              type='button'
              className='absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 text-white text-3xl w-12 h-12 rounded-full backdrop-blur-sm cursor-pointer'
              onClick={showPreviousImage}
              aria-label='Previous image'
            >
              ‹
            </button>
            <img src={productData.image[currentImageIndex]} alt='Product view' className='max-h-[85vh] w-full object-contain rounded-lg shadow-2xl' />
            <button
              type='button'
              className='absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 text-white text-3xl w-12 h-12 rounded-full backdrop-blur-sm cursor-pointer'
              onClick={showNextImage}
              aria-label='Next image'
            >
              ›
            </button>
            <div className='mt-4 text-center text-white text-sm'>
              {currentImageIndex + 1} / {productData.image.length}
            </div>
          </div>
        </div>
      )}

      {/* Related Products */}
      <RelatedProduct category={productData.category} subCategory={productData.subCategory} />
    </div>
  );
}

export default Product;
