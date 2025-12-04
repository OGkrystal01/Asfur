// Load footer component
document.addEventListener('DOMContentLoaded', function() {
    const footerContainer = document.getElementById('footer-container');
    
    if (footerContainer) {
        // Create footer HTML
        const footerHTML = `
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-section">
                        <h3>Über Nevoris</h3>
                        <p>Ihre vertrauenswürdige Quelle für Premium-Luxustaschen. Qualität garantiert.</p>
                    </div>
                    <div class="footer-section">
                        <h4>Schnelllinks</h4>
                        <ul>
                            <li><a href="/pages/products.html">Produkte</a></li>
                            <li><a href="/pages/contact.html">Kontakt</a></li>
                            <li><a href="/pages/terms-of-service.html">Nutzungsbedingungen</a></li>
                            <li><a href="/pages/privacy-policy.html">Datenschutzerklärung</a></li>
                            <li><a href="/pages/refund-policy.html">Rückgaberecht</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Kontakt</h4>
                        <p>Brauchen Sie Hilfe? Kontaktieren Sie unser Support-Team.</p>
                        <p>E-Mail: support@nevoris.com</p>
                    </div>
                    <div class="footer-section">
                        <h4>Zahlungsmethoden</h4>
                        <div class="payment-methods" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                            <img src="../images/payment/visa.svg" alt="Visa" style="height: 24px; max-width: 50px;" onerror="this.src='/images/payment/visa.svg'">
                            <img src="../images/payment/mastercard.svg" alt="Mastercard" style="height: 24px; max-width: 50px;" onerror="this.src='/images/payment/mastercard.svg'">
                            <img src="../images/payment/american-express.svg" alt="American Express" style="height: 24px; max-width: 50px;" onerror="this.src='/images/payment/american-express.svg'">
                            <img src="../images/payment/apple-pay.svg" alt="Apple Pay" style="height: 24px; max-width: 50px;" onerror="this.src='/images/payment/apple-pay.svg'">
                            <img src="../images/payment/google-pay.svg" alt="Google Pay" style="height: 24px; max-width: 50px;" onerror="this.src='/images/payment/google-pay.svg'">
                            <img src="../images/payment/klarna.svg" alt="Klarna" style="height: 24px; max-width: 50px;" onerror="this.src='/images/payment/klarna.svg'">
                        </div>
                        <div style="margin-top: 20px;">
                            <p style="font-size: 0.85em; color: #888; margin-bottom: 10px;">🔒 Sichere Zahlung</p>
                            <p style="font-size: 0.75em; color: #666;">256-Bit SSL Verschlüsselung · 3D Secure by Stripe</p>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; ${new Date().getFullYear()} Nevoris. Alle Rechte vorbehalten.</p>
                </div>
            </footer>
        `;

        // Add footer styles
        const footerStyles = `
            <style>
                .footer {
                    background-color: #1a1a1a;
                    color: #ffffff;
                    padding: 40px 20px 20px;
                    margin-top: 60px;
                }

                .footer-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 40px;
                    margin-bottom: 40px;
                }

                .footer-section h3 {
                    color: #ffffff;
                    margin-bottom: 20px;
                    font-size: 1.2em;
                }

                .footer-section h4 {
                    color: #ffffff;
                    margin-bottom: 20px;
                    font-size: 1.1em;
                }

                .footer-section ul {
                    list-style: none;
                    padding: 0;
                }

                .footer-section ul li {
                    margin-bottom: 10px;
                }

                .footer-section a {
                    color: #ffffff;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .footer-section a:hover {
                    color: #007bff;
                }

                .footer-bottom {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding-top: 20px;
                    border-top: 1px solid #333;
                    text-align: center;
                    font-size: 0.9em;
                    color: #888;
                }

                .social-links {
                    display: flex;
                    gap: 20px;
                }

                .social-links a {
                    color: #ffffff;
                    transition: color 0.3s ease;
                }

                .social-links a:hover {
                    color: #007bff;
                }

                @media (max-width: 768px) {
                    .footer-container {
                        grid-template-columns: 1fr;
                        text-align: center;
                    }

                    .footer-section {
                        margin-bottom: 30px;
                    }
                }
            </style>
        `;

        // Add footer to page
        document.head.insertAdjacentHTML('beforeend', footerStyles);
        footerContainer.innerHTML = footerHTML;
    }
});
