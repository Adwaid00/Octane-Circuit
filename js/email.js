// Email configuration
const EMAIL_CONFIG = {
    companyEmail: 'info@octanecircuits.com',
    apiEndpoint: '/api/send-email', // This will be your backend endpoint
};

class EmailService {
    static async sendOrderConfirmation(orderDetails) {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderDetails }),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending order confirmation email:', error);
            throw error;
        }
    }

    static generateOrderEmailTemplate(orderDetails) {
        return `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; }
                        .order-details { margin: 20px 0; }
                        .item { margin-bottom: 10px; }
                        .total { font-weight: bold; margin-top: 20px; }
                        .footer { text-align: center; padding: 20px; background-color: #f8f9fa; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>New Order Received</h1>
                        </div>
                        <div class="content">
                            <h2>Order Details</h2>
                            <p>Order ID: ${orderDetails.orderId}</p>
                            <p>Date: ${new Date().toLocaleDateString()}</p>
                            
                            <h3>Customer Information</h3>
                            <p>Name: ${orderDetails.customer.name}</p>
                            <p>Email: ${orderDetails.customer.email}</p>
                            <p>Phone: ${orderDetails.customer.phone}</p>
                            <p>Address: ${orderDetails.customer.address}</p>
                            
                            <h3>Order Items</h3>
                            <div class="order-details">
                                ${orderDetails.items.map(item => `
                                    <div class="item">
                                        <p>${item.name} x ${item.quantity}</p>
                                        <p>Price: ₹${item.price.toFixed(2)}</p>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="total">
                                <p>Subtotal: ₹${orderDetails.subtotal.toFixed(2)}</p>
                                <p>Shipping: ₹${orderDetails.shipping.toFixed(2)}</p>
                                <p>Total: ₹${orderDetails.total.toFixed(2)}</p>
                            </div>
                            
                            <h3>Payment Method</h3>
                            <p>${orderDetails.paymentMethod}</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }
}

export default EmailService; 