import { EmailService } from './email.js';

document.addEventListener('DOMContentLoaded', function() {
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    const placeOrderBtn = document.querySelector('.place-order-btn');
    const shippingForm = document.getElementById('shippingForm');
    const loadingOverlay = document.querySelector('.loading-overlay');
    let selectedPaymentMethod = null;
    let selectedUPIApp = null;

    // Format card number as user types
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;

            // Detect card type and update UI
            detectCardType(value);
            validateCardNumber(value);
        });
    }

    // Format expiry date as user types
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4);
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
            validateExpiryDate(value);
        });
    }

    // Validate CVV as user types
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4);
            e.target.value = value;
            validateCVV(value);
        });
    }

    // Validate card name as user types
    const cardNameInput = document.getElementById('cardName');
    if (cardNameInput) {
        cardNameInput.addEventListener('input', function(e) {
            validateCardName(e.target.value);
        });
    }

    function detectCardType(cardNumber) {
        const cardTypes = document.querySelectorAll('.card-type');
        cardTypes.forEach(type => type.classList.remove('active'));

        // Remove all spaces for validation
        const cleanNumber = cardNumber.replace(/\s/g, '');

        if (/^4/.test(cleanNumber)) {
            document.querySelector('.card-type[data-type="visa"]').classList.add('active');
        } else if (/^5[1-5]/.test(cleanNumber)) {
            document.querySelector('.card-type[data-type="mastercard"]').classList.add('active');
        } else if (/^3[47]/.test(cleanNumber)) {
            document.querySelector('.card-type[data-type="amex"]').classList.add('active');
        } else if (/^6/.test(cleanNumber)) {
            document.querySelector('.card-type[data-type="rupay"]').classList.add('active');
        }
    }

    function validateCardNumber(cardNumber) {
        const inputGroup = cardNumberInput.closest('.input-group');
        const errorMessage = inputGroup.querySelector('.error-message');
        const checkIcon = inputGroup.querySelector('i');
        const input = inputGroup.querySelector('input');

        // Remove all spaces for validation
        const cleanNumber = cardNumber.replace(/\s/g, '');

        if (cleanNumber.length === 16 && /^\d+$/.test(cleanNumber)) {
            inputGroup.classList.add('valid');
            inputGroup.classList.remove('invalid');
            input.classList.add('valid');
            input.classList.remove('invalid');
            errorMessage.style.display = 'none';
            checkIcon.style.display = 'block';
            return true;
        } else {
            inputGroup.classList.remove('valid');
            inputGroup.classList.add('invalid');
            input.classList.remove('valid');
            input.classList.add('invalid');
            errorMessage.style.display = 'block';
            checkIcon.style.display = 'none';
            return false;
        }
    }

    function validateExpiryDate(expiry) {
        const inputGroup = expiryInput.closest('.input-group');
        const errorMessage = inputGroup.querySelector('.error-message');
        const checkIcon = inputGroup.querySelector('i');
        const input = inputGroup.querySelector('input');

        if (/^\d{2}\/\d{2}$/.test(expiry)) {
            const [month, year] = expiry.split('/');
            const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
            const today = new Date();

            if (expiryDate > today) {
                inputGroup.classList.add('valid');
                inputGroup.classList.remove('invalid');
                input.classList.add('valid');
                input.classList.remove('invalid');
                errorMessage.style.display = 'none';
                checkIcon.style.display = 'block';
                return true;
            }
        }

        inputGroup.classList.remove('valid');
        inputGroup.classList.add('invalid');
        input.classList.remove('valid');
        input.classList.add('invalid');
        errorMessage.style.display = 'block';
        checkIcon.style.display = 'none';
        return false;
    }

    function validateCVV(cvv) {
        const inputGroup = cvvInput.closest('.input-group');
        const errorMessage = inputGroup.querySelector('.error-message');
        const checkIcon = inputGroup.querySelector('i');
        const input = inputGroup.querySelector('input');

        if ((cvv.length === 3 || cvv.length === 4) && /^\d+$/.test(cvv)) {
            inputGroup.classList.add('valid');
            inputGroup.classList.remove('invalid');
            input.classList.add('valid');
            input.classList.remove('invalid');
            errorMessage.style.display = 'none';
            checkIcon.style.display = 'block';
            return true;
        } else {
            inputGroup.classList.remove('valid');
            inputGroup.classList.add('invalid');
            input.classList.remove('valid');
            input.classList.add('invalid');
            errorMessage.style.display = 'block';
            checkIcon.style.display = 'none';
            return false;
        }
    }

    function validateCardName(name) {
        const inputGroup = cardNameInput.closest('.input-group');
        const errorMessage = inputGroup.querySelector('.error-message');
        const checkIcon = inputGroup.querySelector('i');
        const input = inputGroup.querySelector('input');

        if (name.trim().length >= 3) {
            inputGroup.classList.add('valid');
            inputGroup.classList.remove('invalid');
            input.classList.add('valid');
            input.classList.remove('invalid');
            errorMessage.style.display = 'none';
            checkIcon.style.display = 'block';
            return true;
        } else {
            inputGroup.classList.remove('valid');
            inputGroup.classList.add('invalid');
            input.classList.remove('valid');
            input.classList.add('invalid');
            errorMessage.style.display = 'block';
            checkIcon.style.display = 'none';
            return false;
        }
    }

    // Handle UPI app selection
    const upiApps = document.querySelectorAll('.upi-app');
    upiApps.forEach(app => {
        app.addEventListener('click', function() {
            upiApps.forEach(a => {
                a.classList.remove('selected');
                a.style.transform = 'translateY(0)';
            });
            this.classList.add('selected');
            this.style.transform = 'translateY(-2px)';
            selectedUPIApp = this.querySelector('span').textContent;
        });
    });

    // Payment recommendation system
    function recommendPaymentMethod() {
        const recommendation = document.querySelector('.payment-recommendation');
        const recommendedMethod = recommendation.querySelector('.recommended-method');
        const subtotal = parseFloat(document.querySelector('.subtotal').textContent.replace('₹', ''));
        
        // Determine recommended payment method based on order value
        let recommendedMethodText = 'UPI Payment';
        let recommendationText = 'Based on your order value, we recommend using ';
        
        if (subtotal > 5000) {
            recommendedMethodText = 'Credit/Debit Card';
            recommendationText += 'Credit/Debit Card for better security and rewards.';
        } else if (subtotal > 2000) {
            recommendedMethodText = 'Net Banking';
            recommendationText += 'Net Banking for a seamless transaction.';
        } else {
            recommendationText += 'UPI Payment for a faster checkout experience.';
        }
        
        recommendedMethod.textContent = recommendedMethodText;
        recommendation.querySelector('p').textContent = recommendationText;
        
        // Highlight recommended payment method
        const recommendedElement = document.querySelector(`[data-method="${recommendedMethodText.toLowerCase().replace(' payment', '')}"]`);
        if (recommendedElement) {
            recommendedElement.classList.add('recommended');
        }
    }

    // Enhanced order summary
    function loadCartItems() {
        const orderItems = document.querySelector('.order-items');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            orderItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            return;
        }

        let itemsHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            itemsHTML += `
                <div class="order-item">
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">Qty: ${item.quantity}</span>
                    </div>
                    <span class="item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
        });

        orderItems.innerHTML = itemsHTML;
        document.querySelector('.subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        
        // Update shipping cost based on subtotal
        const shippingCost = subtotal > 999 ? 0 : 99;
        document.querySelector('.shipping').textContent = `₹${shippingCost.toFixed(2)}`;
        
        // Update total
        const total = subtotal + shippingCost;
        document.querySelector('.total-amount').textContent = `₹${total.toFixed(2)}`;
        
        // Update shipping info visibility
        const shippingInfo = document.querySelector('.shipping-info');
        if (subtotal > 999) {
            shippingInfo.style.display = 'none';
        } else {
            shippingInfo.style.display = 'flex';
        }
        
        // Update payment recommendation
        recommendPaymentMethod();
    }

    // Enhanced payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove selected and recommended classes from all methods
            paymentMethods.forEach(m => {
                m.classList.remove('selected', 'recommended');
                m.querySelector('.payment-details').classList.remove('active');
                m.style.transform = 'translateY(0)';
            });

            // Add selected class to clicked method
            this.classList.add('selected');
            this.style.transform = 'translateY(-2px)';
            this.querySelector('.payment-details').classList.add('active');
            selectedPaymentMethod = this.dataset.method;

            // Update total if COD is selected
            if (selectedPaymentMethod === 'cod') {
                updateTotalWithCOD();
            } else {
                updateTotalWithoutCOD();
            }

            // Reset UPI app selection when switching methods
            if (selectedPaymentMethod !== 'upi') {
                upiApps.forEach(app => {
                    app.classList.remove('selected');
                    app.style.transform = 'translateY(0)';
                });
                selectedUPIApp = null;
            }
        });
    });

    // Form validation and submission
    placeOrderBtn.addEventListener('click', function(e) {
        e.preventDefault();

        // Validate shipping form
        if (!shippingForm.checkValidity()) {
            shippingForm.reportValidity();
            return;
        }

        // Validate payment method
        if (!selectedPaymentMethod) {
            alert('Please select a payment method');
            return;
        }

        // Validate payment details based on selected method
        let isValidPayment = true;
        switch (selectedPaymentMethod) {
            case 'upi':
                const upiId = document.getElementById('upiId').value;
                if (!upiId || !upiId.includes('@')) {
                    alert('Please enter a valid UPI ID');
                    isValidPayment = false;
                } else if (!selectedUPIApp) {
                    alert('Please select a UPI app');
                    isValidPayment = false;
                }
                break;
            case 'card':
                const cardNumber = document.getElementById('cardNumber').value;
                const expiry = document.getElementById('expiry').value;
                const cvv = document.getElementById('cvv').value;
                const cardName = document.getElementById('cardName').value;
                
                if (!validateCardNumber(cardNumber) || 
                    !validateExpiryDate(expiry) || 
                    !validateCVV(cvv) || 
                    !validateCardName(cardName)) {
                    isValidPayment = false;
                }
                break;
            case 'netbanking':
                const bank = document.getElementById('bank').value;
                if (!bank) {
                    alert('Please select a bank');
                    isValidPayment = false;
                }
                break;
            case 'cod':
                // No additional validation needed for COD
                break;
        }

        if (!isValidPayment) {
            return;
        }

        // Store selected payment method
        localStorage.setItem('lastPaymentMethod', selectedPaymentMethod);
        if (selectedUPIApp) {
            localStorage.setItem('lastUPIApp', selectedUPIApp);
        }

        // If all validations pass, proceed with order placement
        placeOrder();
    });

    function updateTotalWithCOD() {
        const subtotal = parseFloat(document.querySelector('.subtotal').textContent.replace('₹', ''));
        const shipping = 99;
        const codCharge = 50;
        const total = subtotal + shipping + codCharge;
        
        document.querySelector('.total-amount').textContent = `₹${total.toFixed(2)}`;
    }

    function updateTotalWithoutCOD() {
        const subtotal = parseFloat(document.querySelector('.subtotal').textContent.replace('₹', ''));
        const shipping = 99;
        const total = subtotal + shipping;
        
        document.querySelector('.total-amount').textContent = `₹${total.toFixed(2)}`;
    }

    async function placeOrder() {
        try {
            showLoadingOverlay();
            
            // Validate form
            if (!validateForm()) {
                hideLoadingOverlay();
                return;
            }

            // Get order details
            const orderDetails = {
                orderId: generateOrderId(),
                customer: {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    address: document.getElementById('address').value
                },
                items: getCartItems(),
                subtotal: calculateSubtotal(),
                shipping: calculateShipping(),
                total: calculateTotal(),
                paymentMethod: getSelectedPaymentMethod()
            };

            // Send order confirmation email
            await EmailService.sendOrderConfirmation(orderDetails);

            // Process payment and complete order
            const paymentResult = await processPayment(orderDetails);
            
            if (paymentResult.success) {
                // Clear cart and show success message
                clearCart();
                showSuccessMessage('Order placed successfully!');
                // Redirect to order confirmation page
                window.location.href = `/order-confirmation.html?orderId=${orderDetails.orderId}`;
            } else {
                throw new Error(paymentResult.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            showErrorMessage('Failed to place order. Please try again.');
        } finally {
            hideLoadingOverlay();
        }
    }

    // Initialize
    loadCartItems();
    
    // Update recommendation when cart changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            loadCartItems();
        }
    });
}); 