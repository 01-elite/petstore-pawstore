const express = require('express');
const path = require('path');
// IMPORTANT FIX: Importing the missing admin CRUD functions
const { 
    products, cart, addToCart, updateCartQuantity, userProfile, 
    addProduct, updateProduct, deleteProduct, updateProductStock 
} = require('./data.js'); 
const app = express();
const port = 3001;

// Set up frontend paths and middleware
const frontendPath = path.join(__dirname, '../frontend');
app.set('views', frontendPath); 
app.engine('html', require('ejs').renderFile); 
app.set('view engine', 'ejs'); 
app.use(express.static(frontendPath)); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

/**
 * Helper function to calculate cart totals and enrich cart items with product details.
 * @returns {object} Object containing cart items, subtotal, total, and item count.
 */
function getProcessedCart() {
    const cartItems = cart.map(item => {
        const productDetail = products.find(p => p.id === item.id);
        if (!productDetail) return null; 
        
        return { 
            ...productDetail, 
            quantity: item.quantity,
            totalPrice: (item.quantity * productDetail.price).toFixed(2)
        };
    }).filter(item => item !== null);

    const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.totalPrice), 0).toFixed(2);
    
    return {
        cartItems: cartItems,
        subtotal: subtotal,
        total: subtotal,
        cartCount: cartItems.length 
    };
}

// --- ROUTES ---

app.get('/jsonproducts', (req, res) => {
      res.json(products);
})

// 1. User Purchase Page (Home) - HANDLES SEARCH
app.get('/', (req, res) => {
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
    let filteredProducts = products;

    if (searchQuery) {
        // Filter products based on name, description, or category
        filteredProducts = products.filter(p => 
            p.name.toLowerCase().includes(searchQuery) || 
            (p.description && p.description.toLowerCase().includes(searchQuery)) || // Added check for description
            p.category.toLowerCase().includes(searchQuery)
        );
    }
    
    const { cartCount } = getProcessedCart();
    res.render('customer.html', { 
        products: filteredProducts, 
        cartCount: cartCount,
        searchQuery: searchQuery 
    });
});

// 2. Shopping Cart Page
app.get('/cart', (req, res) => {
    const cartData = getProcessedCart();
    
    res.render('cart.html', cartData);
});

// 3. POST Route for ADDING ITEM TO CART
app.post('/cart/add', (req, res) => {
    const productId = req.body.productId; 
    if (productId) {
        addToCart(productId);
    }
    res.redirect('/'); 
});

// 4. POST Route for UPDATING ITEM QUANTITY
app.post('/cart/update', (req, res) => {
    const { productId, action } = req.body; 
    let change = 0;
    
    if (action === 'increment') {
        change = 1;
    } else if (action === 'decrement') {
        change = -1;
    } else if (action === 'remove') {
        change = 0; 
    }

    if (productId) {
        updateCartQuantity(productId, change);
    }
    
    res.redirect('/cart'); 
});

// 5. User Profile Page (GET)
app.get('/profile', (req, res) => {
    const { cartCount } = getProcessedCart();
    res.render('profile.html', { user: userProfile, cartCount: cartCount });
});

// 6. User Profile Update (POST)
app.post('/profile/update', (req, res) => {
    const { name, phone, address, email, pincode } = req.body;

    // Update the in-memory mock data (userProfile)
    userProfile.name = name;
    userProfile.phone = phone;
    userProfile.address = address;
    userProfile.email = email;
    userProfile.pincode = pincode;

    res.redirect('/profile'); 
});

// 7. Authentication Page (GET)
app.get('/auth', (req, res) => {
    res.render('auth.html');
});

// 8. Handle Authentication Login (POST) - MOCK LOGIN
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`User attempted login: Email: ${email}`);
    // Redirect to home page after mock login success (this connects to the auth form)
    res.redirect('/'); 
});


// ----------------------------------------------------
// ADMIN MANAGEMENT ROUTES (RESTORED)
// ----------------------------------------------------

// 9. Admin Product Management Dashboard (Renders the management UI)
app.get('/admin/manage', (req, res) => {
    // Filter products specifically for the 'Pet Food Stock' section
    const foodStock = products.filter(p => p.category === 'Food');
    
    // Pass the full product list (as allProducts) and the filtered food stock
    res.render('admin-management.html', { // <-- Renders the dashboard
        allProducts: products,
        foodStock: foodStock 
    });
});

// 10. POST Route to CREATE/ADD a New Product
app.post('/admin/add-product', (req, res) => {
    const { name, category, price, stock, reorderThreshold, description, imageUrl } = req.body;
    addProduct({ name, category, price, stock, reorderThreshold, description, imageUrl });
    res.redirect('/admin/manage');
});

// 11. POST Route to UPDATE an Existing Product
app.post('/admin/update-product', (req, res) => {
    const { id, name, category, price, stock, reorderThreshold, description, imageUrl } = req.body;
    updateProduct({ id, name, category, price, stock, reorderThreshold, description, imageUrl });
    res.redirect('/admin/manage');
});

// 12. POST Route to DELETE a Product
app.post('/admin/delete-product', (req, res) => {
    const { id } = req.body;
    deleteProduct(id);
    res.redirect('/admin/manage');
});

// 13. POST Route to UPDATE Stock Quantity
app.post('/admin/update-stock', (req, res) => {
    const { foodId, newQuantity } = req.body;
    updateProductStock(foodId, newQuantity);
    // Redirect back to the stock section of the dashboard
    res.redirect('/admin/manage#stock');
});

// --- ADMIN DATA VIEWER (FIXED) ---
app.get('/admin/data', (req, res) => {
    // FIX: Call the helper function to get the enriched cart data
    const { cartItems } = getProcessedCart(); 
    // FIX: Render the data view template, NOT redirect
    res.render('admin-data-view.html', { 
        productsData: products,
        cartItems: cartItems,
        profileData: userProfile
    });
});


// --- SERVER START ---

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});