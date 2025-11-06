const express = require('express');
const cors = require('cors');
const path = require('path');
const csv = require('csv-parse');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const createOrderConfirmationEmail = require('./email-templates/order-confirmation');
require('dotenv').config();

// Validate environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const APP_URL = process.env.APP_URL;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_FROM = process.env.EMAIL_FROM;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_SECRET_KEY) {
    console.warn('WARNING: Missing STRIPE_SECRET_KEY environment variable. Payment features will be disabled until configured.');
}

if (!APP_URL) {
    console.error('ERROR: Missing APP_URL environment variable. Check your .env file.');
    process.exit(1);
}

// Remove trailing slash from APP_URL if present
const normalizedAppUrl = APP_URL.endsWith('/') ? APP_URL.slice(0, -1) : APP_URL;

console.log('Environment configuration:');
console.log(`- APP_URL: ${normalizedAppUrl}`);
console.log(`- Stripe configured: ${STRIPE_SECRET_KEY ? 'Yes' : 'No'}`);
console.log(`- Webhook secret configured: ${STRIPE_WEBHOOK_SECRET ? 'Yes' : 'No'}`);

// Initialize Stripe (only if key is provided)
const stripe = STRIPE_SECRET_KEY ? require('stripe')(STRIPE_SECRET_KEY) : null;

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
            from: `"Dupelify" <${EMAIL_FROM}>`,
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

// Webhook endpoint needs raw body for signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    console.log('Webhook event received:', event.type);
    
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(`PaymentIntent ${paymentIntent.id} succeeded!`);
                
                // Extract order metadata
                const metadata = paymentIntent.metadata;
                const orderNumber = metadata.orderNumber || 'DP' + Date.now().toString().slice(-6);
                
                // Parse cart items from metadata
                let items = [];
                try {
                    items = JSON.parse(metadata.cartItems || '[]');
                } catch (e) {
                    console.error('Error parsing cart items:', e);
                }
                
                // Create order object for email
                const order = {
                    orderNumber,
                    customerName: metadata.customerName || 'Valued Customer',
                    customerEmail: metadata.customerEmail || paymentIntent.receipt_email,
                    items: items,
                    total: paymentIntent.amount / 100 // Convert from cents to euros
                };
                
                // Send confirmation email
                await sendOrderConfirmationEmail(order);
                console.log(`Order confirmation email sent for order #${orderNumber}`);
                break;
                
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log(`PaymentIntent ${failedPayment.id} failed.`);
                // You can add additional logic here (e.g., notify customer)
                break;
                
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// For all other routes, use JSON parser
app.use(express.json());
app.use(express.static('public'));

// Import hardcoded products data
const { products } = require('./public/js/data/products.js');

// Endpoint to serve Stripe publishable key to frontend
app.get('/api/stripe-config', (req, res) => {
    res.json({ 
        publishableKey: STRIPE_PUBLISHABLE_KEY || ''
    });
});

// Stripe Payment Intents endpoint - creates a payment intent and returns client secret
app.post('/api/payment-intents', async (req, res) => {
    try {
        // Check if Stripe is configured
        if (!stripe) {
            return res.status(503).json({ 
                error: 'Payment system not configured. Please contact support.' 
            });
        }

        console.log('Payment Intent request received:', req.body);
        const { cartItems, customerName, customerEmail } = req.body;
        
        // Validate cart items
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            console.error('Invalid cart items:', cartItems);
            return res.status(400).json({ error: 'Invalid cart items' });
        }

        // Calculate total amount server-side (never trust client input)
        const total = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);

        if (isNaN(total) || total <= 0) {
            console.error('Invalid total amount:', total);
            return res.status(400).json({ error: 'Invalid total amount' });
        }

        // Convert to cents for Stripe
        const amountInCents = Math.round(total * 100);
        console.log('Calculated amount in cents:', amountInCents);

        // Generate order number
        const orderNumber = 'DP' + Date.now().toString().slice(-6);

        // Create a PaymentIntent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
            // Store order metadata for webhook processing
            metadata: {
                orderNumber,
                customerName,
                customerEmail,
                cartItems: JSON.stringify(cartItems.map(item => ({
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity
                })))
            },
            receipt_email: customerEmail,
            description: `Order from Dupelify - ${cartItems.length} item(s)`
        });

        console.log('PaymentIntent created:', paymentIntent.id);

        // Return client secret to frontend
        res.json({
            clientSecret: paymentIntent.client_secret,
            orderNumber: orderNumber
        });

    } catch (error) {
        console.error('Payment Intent creation failed:', error);
        res.status(500).json({
            error: 'Payment processing failed. Please try again or contact support.'
        });
    }
});

// Stripe payment verification endpoint (optional - for checking payment status)
app.get('/api/verify-payment/:paymentIntentId', async (req, res) => {
    try {
        const { paymentIntentId } = req.params;
        
        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Payment Intent ID is required' });
        }

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        res.json({
            status: paymentIntent.status,
            isPaid: paymentIntent.status === 'succeeded'
        });

    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({
            error: 'Payment verification failed'
        });
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
            orderNumber: 'DP' + Date.now().toString().slice(-6),
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
