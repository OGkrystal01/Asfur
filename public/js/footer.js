// Load footer component
document.addEventListener('DOMContentLoaded', function() {
    const footerContainer = document.getElementById('footer-container');
    
    if (footerContainer) {
        // Create footer HTML
        const footerHTML = `
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-section">
                        <h3>About Dupelify</h3>
                        <p>Your trusted source for premium pre-owned items. Quality guaranteed.</p>
                    </div>
                    <div class="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="/pages/products.html">Products</a></li>
                            <li><a href="/pages/contact.html">Contact</a></li>
                            <li><a href="/pages/terms-of-service.html">Terms of Service</a></li>
                            <li><a href="/pages/privacy-policy.html">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Contact</h4>
                        <p>Email: support@dupelify.com</p>
                    </div>
                    <div class="footer-section">
                        <h4>Follow Us</h4>
                        <div class="social-links">
                            <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; ${new Date().getFullYear()} Dupelify. All rights reserved.</p>
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
