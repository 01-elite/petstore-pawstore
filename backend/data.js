// backend/data.js

// ----------------------------------------------------
// PRODUCT CATALOG DATA
// ----------------------------------------------------
const products = [
    { id: 'P001', name: 'Bird Cage Large', category: 'Bird', price: 129.99, stock: 15, reorderThreshold: 10, description: 'Spacious cage for parrots and large birds.', imageUrl: 'https://raw.githubusercontent.com/sundar3431/flutter_image/main/birdcage.jpg' },
    { id: 'P002', name: 'Cat Litter Premium', category: 'Cat', price: 19.99, stock: 300, reorderThreshold: 50, description: 'Odor control clumping litter.', imageUrl: 'https://raw.githubusercontent.com/sundar3431/flutter_image/main/catlitter.jpg' },
    { id: 'P003', name: 'Cat Scratching Post', category: 'Cat', price: 34.99, stock: 45, reorderThreshold: 10, description: 'Durable sisal rope scratching post.', imageUrl: 'https://raw.githubusercontent.com/sundar3431/flutter_image/main/catscratching.jpg' },
    { id: 'F001', name: 'Premium Dog Kibble (10kg)', category: 'Food', price: 49.99, stock: 12, reorderThreshold: 20, description: 'High-protein diet for active dogs.', imageUrl: 'https://raw.githubusercontent.com/sundar3431/flutter_image/main/premiumdog.jpg'  },
    { id: 'F002', name: 'Gourmet Cat Wet Food (Case)', category: 'Food', price: 39.50, stock: 150, reorderThreshold: 50, description: 'Variety pack with essential nutrients.', imageUrl: 'https://raw.githubusercontent.com/sundar3431/flutter_image/main/catwetfood.jpg' }
];

// ----------------------------------------------------
// SHOPPING CART STATE (Only stores ID and Quantity)
// ----------------------------------------------------
let cart = [
    // This array holds current cart items, e.g., { id: 'P001', quantity: 1 }
];

// ----------------------------------------------------
// USER PROFILE DATA
// ----------------------------------------------------
let userProfile = {
    name: "John Doe",
    phone: "9876543210",
    address: "123 Pet Lane, Animal City",
    email: "john.doe@example.com",
    pincode: "110001"
};

/**
 * Finds a product in the cart or returns null.
 */
function findCartItem(productId) {
    return cart.find(item => item.id === productId);
}

/**
 * Adds a product to the cart or increments its quantity.
 */
function addToCart(productId) {
    const item = findCartItem(productId);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
}

/**
 * Updates the quantity of a product in the cart (for + / - buttons).
 * @param {string} productId 
 * @param {number} change Can be 1 (plus), -1 (minus), or 0 (remove).
 */
function updateCartQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        if (change === 0) { // Explicitly remove
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                // Remove if quantity drops to 0 or below
                cart.splice(itemIndex, 1);
            }
        }
    }
}

// ----------------------------------------------------
// ADMIN CRUD FUNCTIONS (Restored)
// ----------------------------------------------------
function generateProductId(category) {
    let prefix = 'P'; // default
    if (category === 'Food') prefix = 'F';
    else if (category === 'Cat') prefix = 'C';
    else if (category === 'Bird') prefix = 'B';
    
    let maxNum = 0;
    products.forEach(p => {
        if (p.id.startsWith(prefix)) {
            const num = parseInt(p.id.substring(1));
            if (num > maxNum) maxNum = num;
        }
    });

    return prefix + (maxNum + 1).toString().padStart(3, '0');
}


function addProduct(productData) {
    const newProduct = {
        id: generateProductId(productData.category),
        name: productData.name,
        category: productData.category,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        reorderThreshold: parseInt(productData.reorderThreshold),
        description: productData.description || "",
        imageUrl: productData.imageUrl || ""
    };
    products.push(newProduct);
}


function updateProduct(productData) {
    const index = products.findIndex(p => p.id === productData.id);
    if (index !== -1) {
        // Update existing product with new data, keeping old data if not provided
        products[index] = {
            ...products[index],
            name: productData.name || products[index].name,
            category: productData.category || products[index].category,
            price: parseFloat(productData.price) || products[index].price,
            stock: parseInt(productData.stock) || products[index].stock,
            reorderThreshold: parseInt(productData.reorderThreshold) || products[index].reorderThreshold,
            description: productData.description || products[index].description,
            imageUrl: productData.imageUrl || products[index].imageUrl
        };
    }
}

function deleteProduct(productId) {
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
        products.splice(index, 1);
    }
}

function updateProductStock(productId, newQuantity) {
    const product = products.find(p => p.id === productId);
    if (product) {
        product.stock = parseInt(newQuantity);
    }
}


module.exports = {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    findCartItem,
    userProfile,
    // --- EXPORTING ADMIN FUNCTIONS ---
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateProductStock
};