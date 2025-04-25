// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.total = 0;
        this.init();
    }

    init() {
        this.updateCartCount();
        this.renderCart();
        this.addEventListeners();
    }

    addEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card, .sensor-item');
                const product = {
                    id: card.dataset.id,
                    name: card.querySelector('h3, h2').textContent,
                    price: parseFloat(card.dataset.price.replace('₹', '').replace(',', '')),
                    image: card.querySelector('img').src,
                    quantity: 1
                };
                this.addItem(product);
            });
        });

        // Cart quantity buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.quantity-btn')) {
                const itemId = e.target.closest('.cart-item').dataset.id;
                if (e.target.classList.contains('increase')) {
                    this.updateQuantity(itemId, 1);
                } else if (e.target.classList.contains('decrease')) {
                    this.updateQuantity(itemId, -1);
                }
            }
        });

        // Remove item buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.remove-item')) {
                const itemId = e.target.closest('.cart-item').dataset.id;
                this.removeItem(itemId);
            }
        });
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push(product);
        }
        this.saveCart();
        this.showSuccessMessage('Item added to cart');
    }

    updateQuantity(id, change) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity < 1) {
                this.removeItem(id);
            } else {
                this.saveCart();
            }
        }
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.renderCart();
    }

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? '' : 'none';
        }
    }

    renderCart() {
        const cartItems = document.querySelector('.cart-items');
        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="/" class="btn primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase">+</button>
                    </div>
                </div>
                <button class="remove-item">×</button>
            </div>
        `).join('');

        // Update summary
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const summary = document.querySelector('.cart-summary');
        if (summary) {
            summary.innerHTML = `
                <h2>Order Summary</h2>
                <div class="summary-item">
                    <span>Subtotal</span>
                    <span>₹${this.total.toLocaleString()}</span>
                </div>
                <div class="summary-item">
                    <span>Shipping</span>
                    <span>₹99.00</span>
                </div>
                <div class="summary-item total">
                    <span>Total</span>
                    <span>₹${(this.total + 99).toLocaleString()}</span>
                </div>
                <button class="btn primary checkout-btn">Proceed to Checkout</button>
            `;
        }
    }

    showSuccessMessage(message) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 2000);
    }
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new Cart();
}); 