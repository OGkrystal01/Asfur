const express = require('express');
const cors = require('cors');
const path = require('path');
const csv = require('csv-parse');
const fs = require('fs');
const { createMollieClient } = require('@mollie/api-client');
require('dotenv').config();

// Initialize Mollie client with strict error checking
const mollieClient = createMollieClient({ 
    apiKey: process.env.MOLLIE_API_KEY 
});

if (!process.env.MOLLIE_API_KEY || !process.env.APP_URL) {
    console.error('ERROR: Missing required environment variables. Check .env file.');
    process.exit(1);
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
        const { cartItems, customer } = req.body;
        console.log('Received payment request:', { cartItems, customer });
        
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
            console.error('Invalid cart items:', cartItems);
            return res.status(400).json({ error: 'Invalid cart items' });
        }

        // Calculate total amount from cart items
        const total = cartItems.reduce((sum, item) => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            console.log(`Processing item: ${item.title}, price: ${price}, quantity: ${quantity}`);
            return sum + (price * quantity);
        }, 0);

        if (isNaN(total) || total <= 0) {
            console.error('Invalid total amount:', total);
            return res.status(400).json({ error: 'Invalid total amount' });
        }

        // Format amount to 2 decimal places
        const amount = total.toFixed(2);
        console.log('Calculated amount:', amount);

        // Create payment with Mollie
        const payment = await mollieClient.payments.create({
            amount: {
                currency: 'EUR',
                value: amount
            },
            description: 'Order from Resell Depot',
            redirectUrl: `${process.env.APP_URL}/pages/order-confirmation.html`,
            webhookUrl: `${process.env.APP_URL}/api/webhooks/mollie`,
            metadata: {
                cartItems: cartItems,
                customer: customer
            },
            method: ['creditcard', 'applepay', 'banktransfer', 'klarnapaylater', 'klarnapaynow'],
            locale: 'en_US',
            billingAddress: {
                streetAndNumber: customer.address.street + ' ' + (customer.address.apartment || ''),
                postalCode: customer.address.postalCode,
                city: customer.address.city,
                country: customer.address.country
            },
            shippingAddress: {
                streetAndNumber: customer.address.street + ' ' + (customer.address.apartment || ''),
                postalCode: customer.address.postalCode,
                city: customer.address.city,
                country: customer.address.country
            },
            consumerName: customer.firstName + ' ' + customer.lastName,
            email: customer.email,
            phoneNumber: customer.phone
        });

        console.log('Payment created successfully:', payment.id);
        res.json({ 
            checkoutUrl: payment.getCheckoutUrl(),
            paymentId: payment.id
        });

    } catch (error) {
        console.error('Payment creation failed:', error.message);
        if (error.details) {
            console.error('Error details:', error.details);
        }
        res.status(500).json({
            error: 'Payment processing failed. Please try again or contact support.'
        });
    }
});

// Secure webhook endpoint for Mollie callbacks
app.post('/api/webhooks/mollie', async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            console.error('Missing payment ID in webhook');
            return res.status(200).send('OK'); // Always return 200 to Mollie
        }

        const payment = await mollieClient.payments.get(id);
        
        if (payment.isPaid()) {
            console.log(`Payment ${id} completed successfully`);
            // Here you would typically:
            // 1. Update order status in database
            // 2. Send confirmation email
            // 3. Clear customer's cart
            // 4. Update inventory
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
