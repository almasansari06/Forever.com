import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Create and export ShopContext
export const ShopContext = createContext();

const ShopContextProvider = (props) => {
    const currency = '$';
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

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

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
                    setProducts(response.data.products || []);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchProducts();
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
        currency,
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
