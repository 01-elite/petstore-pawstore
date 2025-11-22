// backend/data.js

// ----------------------------------------------------
// PRODUCT CATALOG DATA
// ----------------------------------------------------
const products = [
    { id: 'P001', name: 'Bird Cage Large', category: 'Bird', price: 129.99, stock: 15, reorderThreshold: 10, description: 'Spacious cage for parrots and large birds.', imageUrl: 'https://img.pixers.pics/pho_wat(s3:700/FO/30/98/69/97/700_FO30986997_195f37941cdd173f733648d18754e301.jpg,700,700,cms:2018/10/5bd1b6b8d04b8_220x50-watermark.png,over,480,650,jpg)/stickers-3d-silver-bird-cage-with-open-door.jpg.jpg' },
    { id: 'F002', name: 'Gourmet Cat Wet Food ', category: 'Food', price: 39.50, stock: 150, reorderThreshold: 50, description: 'Variety pack with essential nutrients.', imageUrl: 'https://m.media-amazon.com/images/I/81Rdq60ps3L._SX679_PIbundle-14,TopRight,0,0_AA679SH20_.jpg' },
    { id: 'P002', name: 'Cat Scratching Post', category: 'Cat', price: 34.99, stock: 45, reorderThreshold: 10, description: 'Durable sisal rope scratching post.', imageUrl: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTD6UmDSS5zj8TqbALqcf_0Us-z8rbnp-EMD3r4z5fGb8cHpvNtg2qopw4jw8m2mL7ZTLQ84ahkmlwlg3fSJpTS3ix3AZBsciiGl8lghNx0S0q9n3HMKa2hkA' },
    { id: 'F001', name: 'Premium Dog Kibble (10kg)', category: 'Food', price: 49.99, stock: 12, reorderThreshold: 20, description: 'High-protein diet for active dogs.', imageUrl: 'https://www.pedigree.in/files/styles/webp/public/2024-02/Why-is-packaged-food-mobile.jpg.webp?VersionId=c8Q_uk7ETL0EtUQJMnHPVxo_JMR0Py3n&itok=D0lTt94v'  },
        { id: 'P003', name: 'Cat Litter Premium', category: 'Cat', price: 19.99, stock: 300, reorderThreshold: 50, description: 'Odor control clumping litter.', imageUrl: 'https://m.media-amazon.com/images/I/71kPDz1GgiL._AC_UF350,350_QL80_.jpg' },
];


// ----------------------------------------------------
// SHOPPING CART STATE
// ----------------------------------------------------
let cart = []; 
// Each item becomes:
// { id, quantity, name, price, image }


// ----------------------------------------------------
// USER PROFILE
// ----------------------------------------------------
let userProfile = {
    name: "John Doe",
    phone: "9876543210",
    address: "123 Pet Lane, Animal City",
    email: "john.doe@example.com",
    pincode: "110001"
};


// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------
function findCartItem(productId) {
    return cart.find(item => item.id === productId);
}


// ----------------------------------------------------
// ADD TO CART  ⭐ FIXED VERSION (USES IMAGE, NAME, PRICE)
// ----------------------------------------------------
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(i => i.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            quantity: 1,
            name: product.name,
            price: product.price,
            image: product.imageUrl  // ⭐ Image added for cart
        });
    }
}


// ----------------------------------------------------
// UPDATE CART QUANTITY (UNCHANGED & SAFE)
// ----------------------------------------------------
function updateCartQuantity(productId, change) {
    const index = cart.findIndex(item => item.id === productId);

    if (index !== -1) {
        if (change === 0) {  
            cart.splice(index, 1);
        } else {
            cart[index].quantity += change;

            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
        }
    }
}


// ----------------------------------------------------
// ADMIN CRUD
// ----------------------------------------------------
function generateProductId(category) {
    let prefix = 'P';
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


// ----------------------------------------------------
// EXPORTS
// ----------------------------------------------------
module.exports = {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    findCartItem,
    userProfile,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock
};
