import EmailService from './email.js';

async function processOrder(orderDetails) {
    try {
        // Process the order (e.g., save to database)
        const orderId = await saveOrderToDatabase(orderDetails);
        
        // Send order confirmation email
        await EmailService.sendOrderConfirmation({
            ...orderDetails,
            orderId
        });
        
        return orderId;
    } catch (error) {
        console.error('Error processing order:', error);
        throw error;
    }
} 