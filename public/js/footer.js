// Load footer component
document.addEventListener('DOMContentLoaded', function() {
    const footerContainer = document.getElementById('footer-container');
    
    if (footerContainer) {
        footerContainer.innerHTML = `
    <footer class="footer">
        <div class="footer__content">
            <div class="footer__section">
                <h4>About Us</h4>
                <p>Resell Depot offers premium quality products at unbeatable prices.</p>
            </div>
            <div class="footer__section">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="/pages/products.html">Products</a></li>
                    <li><a href="/pages/contact.html">Contact</a></li>
                    <li><a href="/pages/newsletter.html">Newsletter</a></li>
                </ul>
            </div>
            <div class="footer__section">
                <h4>Contact</h4>
                <p>Need help? Contact our support team.</p>
                <p>Email: support@reselldepot.com</p>
            </div>
            <div class="footer__section">
                <h4>Payment Methods</h4>
                <div class="payment-methods">
                    <div class="payment-icon">
                        <i class="fab fa-cc-visa"></i>
                    </div>
                    <div class="payment-icon">
                        <i class="fab fa-cc-mastercard"></i>
                    </div>
                    <div class="payment-icon">
                        <i class="fab fa-cc-amex"></i>
                    </div>
                    <div class="payment-icon">
                        <i class="fab fa-cc-apple-pay"></i>
                    </div>
                    <div class="payment-icon">
                        <i class="fab fa-google-pay"></i>
                    </div>
                    <div class="payment-icon">
                        <i class="fab fa-klarna"></i>
                    </div>
                </div>
            </div>
        </div>
    </footer>`;
    }
});
