const express = require('express');
const path = require('path');
const { 
    products, cart, addToCart, updateCartQuantity, userProfile, 
    addProduct, updateProduct, deleteProduct, updateProductStock 
} = require('./data.js'); 

const app = express();
const port = 3001;

// Set up frontend
const frontendPath = path.join(__dirname, '../frontend');
app.set('views', frontendPath);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(frontendPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ⭐⭐⭐ IMAGE FIX — FINAL VERSION — DON’T CHANGE ⭐⭐⭐
function getProcessedCart() {

    const cartItems = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return null;

        return {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            imageUrl: product.imageUrl,   // ⭐ cart image appears now
            totalPrice: (product.price * item.quantity).toFixed(2)
        };
    }).filter(i => i !== null);

    const subtotal = cartItems
        .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
        .toFixed(2);

    return {
        cartItems,
        subtotal,
        total: subtotal,
        cartCount: cartItems.length
    };
}



// ------------------------------------------
// ROUTES
// ------------------------------------------

app.get('/jsonproducts', (req, res) => {
    res.json(products);
});

// Home Page
app.get('/', (req, res) => {
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
    let filteredProducts = products;

    if (searchQuery) {
        filteredProducts = products.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery) ||
            (p.description && p.description.toLowerCase().includes(searchQuery))
        );
    }

    const { cartCount } = getProcessedCart();

    res.render('customer.html', {
        products: filteredProducts,
        cartCount,
        searchQuery
    });
});

// CART PAGE
app.get('/cart', (req, res) => {
    const cartData = getProcessedCart();
    res.render('cart.html', cartData);
});

// ADD TO CART
app.post('/cart/add', (req, res) => {
    const productId = req.body.productId;
    if (productId) {
        addToCart(productId);
    }
    res.redirect('/');
});

// UPDATE CART
app.post('/cart/update', (req, res) => {
    const { productId, action } = req.body;
    let change = 0;

    if (action === 'increment') change = 1;
    else if (action === 'decrement') change = -1;
    else if (action === 'remove') change = 0;

    updateCartQuantity(productId, change);
    res.redirect('/cart');
});

// PROFILE
app.get('/profile', (req, res) => {
    const { cartCount } = getProcessedCart();
    res.render('profile.html', { user: userProfile, cartCount });
});

app.post('/profile/update', (req, res) => {
    const { name, phone, address, email, pincode } = req.body;

    userProfile.name = name;
    userProfile.phone = phone;
    userProfile.address = address;
    userProfile.email = email;
    userProfile.pincode = pincode;

    res.redirect('/profile');
});

// AUTH
app.get('/auth', (req, res) => {
    res.render('auth.html');
});

app.post('/auth/login', (req, res) => {
    res.redirect('/');
});

// ADMIN DASHBOARD
app.get('/admin/manage', (req, res) => {
    const foodStock = products.filter(p => p.category === 'Food');
    res.render('admin-management.html', { 
        allProducts: products,
        foodStock 
    });
});

app.post('/admin/add-product', (req, res) => {
    addProduct(req.body);
    res.redirect('/admin/manage');
});

app.post('/admin/update-product', (req, res) => {
    updateProduct(req.body);
    res.redirect('/admin/manage');
});

app.post('/admin/delete-product', (req, res) => {
    deleteProduct(req.body.id);
    res.redirect('/admin/manage');
});

app.post('/admin/update-stock', (req, res) => {
    updateProductStock(req.body.foodId, req.body.newQuantity);
    res.redirect('/admin/manage#stock');
});

// ADMIN DATA VIEWER
app.get('/admin/data', (req, res) => {
    const { cartItems } = getProcessedCart();
    res.render('admin-data-view.html', { 
        productsData: products,
        cartItems,
        profileData: userProfile
    });
});


// START SERVER
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
