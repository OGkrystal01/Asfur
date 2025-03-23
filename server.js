const express = require('express');
const cors = require('cors');
const path = require('path');
const csv = require('csv-parse');
const fs = require('fs');
const { createMollieClient } = require('@mollie/api-client');
const nodemailer = require('nodemailer');
const createOrderConfirmationEmail = require('./email-templates/order-confirmation');
require('dotenv').config();

// Validate environment variables
const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
const APP_URL = process.env.APP_URL;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_FROM = process.env.EMAIL_FROM;

if (!MOLLIE_API_KEY) {
    console.error('ERROR: Missing MOLLIE_API_KEY environment variable. Check your .env file or Render.com environment settings.');
    process.exit(1);
}

if (!APP_URL) {
    console.error('ERROR: Missing APP_URL environment variable. Check your .env file or Render.com environment settings.');
    process.exit(1);
}

// Remove trailing slash from APP_URL if present
const normalizedAppUrl = APP_URL.endsWith('/') ? APP_URL.slice(0, -1) : APP_URL;

console.log('Environment configuration:');
console.log(`- APP_URL: ${normalizedAppUrl}`);
console.log(`- MOLLIE_API_KEY: ${MOLLIE_API_KEY.substring(0, 5)}...${MOLLIE_API_KEY.substring(MOLLIE_API_KEY.length - 4)}`);

// Initialize Mollie client
const mollieClient = createMollieClient({ 
    apiKey: MOLLIE_API_KEY 
});

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Function to send order confirmation email
async function sendOrderConfirmationEmail(order) {
    try {
        const htmlContent = createOrderConfirmationEmail(order);
        
        const mailOptions = {
            from: `"Resell Depot" <${EMAIL_FROM}>`,
            to: order.customerEmail,
            subject: `Order Confirmation #${order.orderNumber}`,
            html: htmlContent,
            replyTo: EMAIL_FROM
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import hardcoded products data
const { products } = require('./public/js/data/products.js');

// Secure payment endpoint with proper validation and error handling
app.post('/api/create-payment', async (req, res) => {
    try {
        console.log('Payment request received:', req.body);
        const { cartItems, customerName, customerEmail } = req.body;
        
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            console.error('Invalid cart items:', cartItems);
            return res.status(400).json({ error: 'Invalid cart items' });
        }

        // Calculate total amount from cart items
        const total = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);

        if (isNaN(total) || total <= 0) {
            console.error('Invalid total amount:', total);
            return res.status(400).json({ error: 'Invalid total amount' });
        }

        // Format amount to 2 decimal places - ensure it's a string as required by Mollie
        const amount = total.toFixed(2);
        console.log('Calculated amount:', amount);

        // Create payment with Mollie - using required fields according to latest API
        try {
            // Construct the webhook URL and redirect URL
            const redirectUrl = `${normalizedAppUrl}/pages/order-confirmation.html`;
            const webhookUrl = `${normalizedAppUrl}/api/webhooks/mollie`;
            
            console.log('Using the following URLs:');
            console.log(`- Redirect URL: ${redirectUrl}`);
            console.log(`- Webhook URL: ${webhookUrl}`);
            
            const paymentData = {
                amount: {
                    currency: 'EUR',
                    value: amount
                },
                description: 'Order from Resell Depot',
                redirectUrl: redirectUrl,
                webhookUrl: webhookUrl,
                metadata: {
                    customerName,
                    customerEmail,
                    items: cartItems
                }
            };
            
            console.log('Sending payment data to Mollie:', JSON.stringify(paymentData, null, 2));
            
            const payment = await mollieClient.payments.create(paymentData);
            
            console.log('Payment created successfully:', payment.id);
            console.log('Checkout URL:', payment.getCheckoutUrl());
            
            res.json({ 
                checkoutUrl: payment.getCheckoutUrl(),
                paymentId: payment.id
            });
        } catch (mollieError) {
            console.error('Mollie API error:', mollieError);
            
            // Provide more detailed error information
            let errorMessage = 'Payment provider error';
            
            if (mollieError.message) {
                errorMessage += ': ' + mollieError.message;
            }
            
            if (mollieError.details && mollieError.details.field) {
                errorMessage += ` (Field: ${mollieError.details.field})`;
            }
            
            res.status(500).json({
                error: errorMessage
            });
        }
    } catch (error) {
        console.error('Payment creation failed:', error);
        res.status(500).json({
            error: 'Payment processing failed. Please try again or contact support.'
        });
    }
});

// Add payment verification endpoint
app.get('/api/verify-payment/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        if (!paymentId) {
            return res.status(400).json({ error: 'Payment ID is required' });
        }

        const payment = await mollieClient.payments.get(paymentId);
        
        res.json({
            isPaid: payment.isPaid(),
            status: payment.status
        });

    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({
            error: 'Payment verification failed'
        });
    }
});

// Secure webhook endpoint for Mollie callbacks
app.post('/api/webhooks/mollie', async (req, res) => {
    try {
        console.log('Webhook called with body:', req.body);
        const { id } = req.body;
        
        if (!id) {
            console.error('Missing payment ID in webhook');
            return res.status(200).send('OK'); // Always return 200 to Mollie
        }

        console.log(`Processing webhook for payment: ${id}`);
        
        const payment = await mollieClient.payments.get(id);
        console.log(`Payment status: ${payment.status}`);
        
        if (payment.isPaid()) {
            console.log(`Payment ${id} completed successfully`);
            
            // Get payment metadata
            const metadata = payment.metadata || {};
            
            // Generate order number
            const orderNumber = 'RD' + Date.now().toString().slice(-6);
            
            // Get customer data from metadata or use defaults
            const customerName = metadata.customerName || 'Valued Customer';
            const customerEmail = metadata.customerEmail || payment.details?.consumerAccount || 'customer@example.com';
            
            // Create order object for email
            const order = {
                orderNumber,
                customerName,
                customerEmail,
                items: metadata.items || [{ title: 'Order from Resell Depot', price: payment.amount.value, quantity: 1 }],
                total: parseFloat(payment.amount.value)
            };
            
            // Send confirmation email
            await sendOrderConfirmationEmail(order);
            
            console.log(`Confirmation email sent to ${customerEmail} for order #${orderNumber}`);
        } else if (payment.isFailed()) {
            console.error(`Payment ${id} failed`);
        }

        res.status(200).send('OK');

    } catch (error) {
        console.error('Webhook processing failed:', error);
        res.status(200).send('OK'); // Always return 200 to Mollie
    }
});

// Product detail page route - must come before static file handling
app.get('/pages/product.html', (req, res) => {
    console.log('Serving product detail page');
    res.sendFile(path.join(__dirname, 'public', 'pages', 'product.html'));
});

// API route for product data
app.get('/api/products/:handle', (req, res) => {
    console.log('Product handle requested:', req.params.handle);
    const product = products.find(p => p.handle === req.params.handle);
    if (product) {
        console.log('Product found:', product.title);
        // Maintain exact Shopify data structure
        const transformedProduct = {
            handle: product.handle,
            title: product.title,
            body_html: product.body_html,
            vendor: product.vendor,
            rating_count: product.rating_count || 0,
            variants: product.variants,
            image: {
                src: product.image.src
            }
        };
        res.json(transformedProduct);
    } else {
        console.log('Product not found for handle:', req.params.handle);
        res.status(404).json({ error: 'Product not found' });
    }
});

// API route for all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Reviews endpoint
app.get('/api/reviews', (req, res) => {
    const reviews = [];
    fs.createReadStream('reviews.csv')
        .pipe(csv.parse({ columns: true, skip_empty_lines: true }))
        .on('data', (row) => {
            reviews.push(row);
        })
        .on('end', () => {
            res.json(reviews);
        })
        .on('error', (error) => {
            console.error('Error reading reviews:', error);
            res.status(500).json({ error: 'Failed to load reviews' });
        });
});

// Test email endpoint (remove in production)
app.get('/api/test-email', async (req, res) => {
    try {
        // Sample order data
        const order = {
            orderNumber: 'RD' + Date.now().toString().slice(-6),
            customerName: 'Test Customer',
            customerEmail: req.query.email || 'test@example.com',
            items: [
                {
                    title: 'Test Product',
                    price: 24.95,
                    quantity: 1
                }
            ],
            total: 24.95
        };
        
        // Send test email
        const result = await sendOrderConfirmationEmail(order);
        
        if (result) {
            res.json({ success: true, message: 'Test email sent successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send test email' });
        }
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ success: false, message: 'Error sending test email', error: error.message });
    }
});

// Frontend Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle other static pages
app.get('/pages/*', (req, res, next) => {
    const filePath = path.join(__dirname, 'public', req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            next();
        }
    });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
