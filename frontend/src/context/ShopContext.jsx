import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { products as localProducts } from "../assets/assets";

// Create and export ShopContext
export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const [currencyDetails, setCurrencyDetails] = useState({ code: 'USD', rate: 1 });
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');
    const [userData, setUserData] = useState(false);
    const [cartItems, setCartItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cartItems')) || {};
        } catch (error) {
            return {};
        }
    });
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const language = 'en';

    const currencyByCountry = {
        IN: ['INR', 83.5], AE: ['AED', 3.67], SA: ['SAR', 3.75], QA: ['QAR', 3.64],
        KW: ['KWD', 0.307], BH: ['BHD', 0.376], GB: ['GBP', 0.79], DE: ['EUR', 0.92],
        FR: ['EUR', 0.92], IT: ['EUR', 0.92], ES: ['EUR', 0.92], NL: ['EUR', 0.92],
        CA: ['CAD', 1.37], AU: ['AUD', 1.53], SG: ['SGD', 1.34], JP: ['JPY', 157], CN: ['CNY', 7.2]
    };

    const formatPrice = (amount) => new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyDetails.code,
        maximumFractionDigits: currencyDetails.code === 'JPY' ? 0 : 2,
    }).format(Number(amount || 0) * currencyDetails.rate);

    useEffect(() => {
        const controller = new AbortController();
        const detectCurrency = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
                const data = await response.json();
                const details = currencyByCountry[data.country_code];
                if (details) {
                    setCurrencyDetails({ code: details[0], rate: details[1] });
                }
            } catch (error) {
                if (error.name !== 'AbortError') console.log('Currency detection failed:', error.message);
            }
        };

        detectCurrency();
        return () => controller.abort();
    }, []);

    const requestUserLocation = async () => {
        if (!token || !navigator.geolocation) {
            return false;
        }

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                });
            });

            const { latitude, longitude, accuracy } = position.coords;

            await axios.post(
                backendUrl + '/api/user/update-location',
                { latitude, longitude, accuracy },
                { headers: { token } }
            );

            return true;
        } catch (error) {
            console.log('Location update failed:', error.message);
            return false;
        }
    };

    useEffect(() => {
        if (!token || !navigator.geolocation) {
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                try {
                    const { latitude, longitude, accuracy } = position.coords;
                    await axios.post(
                        backendUrl + '/api/user/update-location',
                        { latitude, longitude, accuracy },
                        { headers: { token } }
                    );
                } catch (error) {
                    console.log('Background location update failed:', error.message);
                }
            },
            (error) => {
                console.log('Location watcher failed:', error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 30000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [token, backendUrl]);

    const [theme, setTheme] = useState('light');

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.style.colorScheme = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.lang = 'en';
    }, []);

    // Profile Data Fetcher
    const loadUserProfileData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } });
            if (response.data.success) {
                const ud = response.data.userData;
                setUserData(ud);

                // If account disabled show informational popup and restrict actions
                if (ud.status === 'disabled') {
                    toast.info('Your account has been disabled by the administrator. You will not be able to perform actions like add to cart or edit profile. Please contact support.');
                }

                // If account deleted, force logout and show message
                if (ud.status === 'deleted') {
                    toast.error('Your account has been deleted by the administrator and cannot be used. You will be logged out.');
                    // clear token and user data
                    localStorage.removeItem('token');
                    setToken('');
                    setUserData(false);
                    window.location.href = '/';
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (token) {
            loadUserProfileData();
            requestUserLocation();
        } else {
            setUserData(false);
        }
    }, [token]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(backendUrl + '/api/product/list');
                if (response.data.success) {
                    const apiProducts = response.data.products || [];
                    setProducts(apiProducts.length > 0 ? apiProducts : localProducts);
                }
            } catch (error) {
                console.log(error);
                setProducts(localProducts);
            }
        };

        fetchProducts();

        const refreshProducts = () => fetchProducts();
        const handleProductsUpdated = (event) => {
            if (event.key === 'products_updated_at') {
                refreshProducts();
            }
        };

        window.addEventListener('focus', refreshProducts);
        window.addEventListener('storage', handleProductsUpdated);
        const refreshTimer = window.setInterval(fetchProducts, 15 * 1000);

        return () => {
            window.clearInterval(refreshTimer);
            window.removeEventListener('focus', refreshProducts);
            window.removeEventListener('storage', handleProductsUpdated);
        };
    }, [backendUrl]);

    const addToCart = async (itemId, size) => {
        // Prevent disabled or deleted users from adding to cart
        if (userData && (userData.status === 'disabled' || userData.status === 'deleted')) {
            toast.error(userData.status === 'deleted' ? 'Your account has been deleted and cannot perform this action.' : 'Your account is disabled. You cannot add items to cart.');
            return;
        }

        const cartSize = size || 'default';
        const updatedCart = { ...cartItems };
        if (!updatedCart[itemId]) {
            updatedCart[itemId] = {};
        }
        if (!updatedCart[itemId][cartSize]) {
            updatedCart[itemId][cartSize] = 0;
        }
        updatedCart[itemId][cartSize] += 1;
        setCartItems(updatedCart);
        toast.success('Product added to cart');
    };

    const updateQuantity = async (itemId, size, quantity) => {
        if (userData && (userData.status === 'disabled' || userData.status === 'deleted')) {
            toast.error(userData.status === 'deleted' ? 'Your account has been deleted and cannot perform this action.' : 'Your account is disabled. You cannot change cart items.');
            return;
        }

        const cartSize = size || 'default';
        const updatedCart = { ...cartItems };
        if (!updatedCart[itemId]) {
            updatedCart[itemId] = {};
        }
        updatedCart[itemId][cartSize] = quantity;
        if (quantity <= 0) {
            delete updatedCart[itemId][cartSize];
            if (Object.keys(updatedCart[itemId]).length === 0) {
                delete updatedCart[itemId];
            }
        }
        setCartItems(updatedCart);
    };

    const getCartCount = () => {
        let totalCount = 0;
        Object.values(cartItems).forEach((sizes) => {
            Object.values(sizes).forEach((quantity) => {
                totalCount += quantity;
            });
        });
        return totalCount;
    };

    const getCartAmount = () => {
        let totalAmount = 0;
        Object.entries(cartItems).forEach(([itemId, sizes]) => {
            const product = products.find((item) => item._id === itemId);
            if (!product) return;
            Object.entries(sizes).forEach(([size, quantity]) => {
                totalAmount += product.price * quantity;
            });
        });
        return totalAmount;
    };

    const navigate = (path) => {
        window.location.href = path;
    };

    const value = {
        currency: currencyDetails.code,
        currencyRate: currencyDetails.rate,
        formatPrice,
        delivery_fee,
        backendUrl,
        token,
        setToken,
        userData,
        setUserData,
        loadUserProfileData,
        requestUserLocation,
        cartItems,
        setCartItems,
        products,
        setProducts,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        language,
        theme,
        setTheme,
        addToCart,
        updateQuantity,
        getCartCount,
        getCartAmount,
        navigate,
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
