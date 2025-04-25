// Cart functionality
class Cart {
    constructor() {
        this.items = [];
        this.loadFromLocalStorage();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        this.saveToLocalStorage();
        this.updateDisplay();
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveToLocalStorage();
        this.updateDisplay();
    }

    updateQuantity(id, newQuantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            if (newQuantity > 0) {
                item.quantity = newQuantity;
            } else {
                this.removeItem(id);
            }
            this.saveToLocalStorage();
            this.updateDisplay();
        }
    }

    calculateTotals() {
        const subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = this.items.length > 0 ? 99 : 0; // ₹99 shipping if cart not empty
        return {
            subtotal,
            shipping,
            total: subtotal + shipping
        };
    }

    formatPrice(price) {
        return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    generateCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-price">${this.formatPrice(item.price)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="cart.removeItem('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    updateDisplay() {
        const cartContainer = document.querySelector('.cart-items');
        const checkoutBtn = document.querySelector('.checkout-btn');
        
        if (cartContainer) {
            if (this.items.length === 0) {
                cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
                checkoutBtn.disabled = true;
            } else {
                cartContainer.innerHTML = this.items.map(item => this.generateCartItemHTML(item)).join('');
                checkoutBtn.disabled = false;
            }

            const totals = this.calculateTotals();
            document.querySelector('.subtotal').textContent = this.formatPrice(totals.subtotal);
            document.querySelector('.shipping').textContent = this.formatPrice(totals.shipping);
            document.querySelector('.total-amount').textContent = this.formatPrice(totals.total);
        }

        // Update cart count in header
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.items.reduce((total, item) => total + item.quantity, 0);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    loadFromLocalStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.updateDisplay();
        }
    }
}

// Initialize cart
const cart = new Cart();

// Add event listeners to "Add to Cart" buttons
document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productCard = button.closest('.product-card');
            const product = {
                id: Math.random().toString(36).substr(2, 9),
                name: productCard.querySelector('h3').textContent,
                price: parseFloat(productCard.querySelector('.price').textContent.replace('₹', '').replace(',', '')),
                image: productCard.querySelector('img').src
            };
            cart.addItem(product);
        });
    });
}); 