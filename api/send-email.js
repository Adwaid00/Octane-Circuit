const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { orderDetails } = req.body;

        // Generate email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'info@octanecircuits.com',
            subject: `New Order #${orderDetails.orderId}`,
            html: `
                <h2>New Order Received</h2>
                <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
                <p><strong>Customer Name:</strong> ${orderDetails.customer.name}</p>
                <p><strong>Customer Email:</strong> ${orderDetails.customer.email}</p>
                <p><strong>Customer Phone:</strong> ${orderDetails.customer.phone}</p>
                <p><strong>Shipping Address:</strong> ${orderDetails.customer.address}</p>
                
                <h3>Order Items:</h3>
                <ul>
                    ${orderDetails.items.map(item => `
                        <li>
                            ${item.name} - ${item.quantity} x $${item.price}
                        </li>
                    `).join('')}
                </ul>
                
                <p><strong>Subtotal:</strong> $${orderDetails.subtotal}</p>
                <p><strong>Shipping:</strong> $${orderDetails.shipping}</p>
                <p><strong>Total:</strong> $${orderDetails.total}</p>
                <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
} 