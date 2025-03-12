document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncement();
    initializeAnnouncementSlider();
});

async function loadAnnouncement() {
    try {
        const response = await fetch('/components/announcement.html');
        const html = await response.text();
        
        // Insert announcement bar before the header
        const header = document.querySelector('.header');
        if (header && header.parentNode) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            header.parentNode.insertBefore(tempDiv.firstElementChild, header);
        }
    } catch (error) {
        console.error('Error loading announcement:', error);
    }
}

function initializeAnnouncementSlider() {
    let currentSlide = 0;
    const SLIDE_INTERVAL = 5000; // Change slide every 5 seconds
    
    function updateSlides() {
        const slider = document.querySelector('.announcement-slider');
        if (!slider) return;
        
        const slides = slider.querySelectorAll('.announcement-slide');
        if (!slides.length) return;
        
        slides.forEach(slide => slide.style.display = 'none');
        slides[currentSlide].style.display = 'block';
        
        currentSlide = (currentSlide + 1) % slides.length;
    }
    
    // Start the slider
    updateSlides();
    setInterval(updateSlides, SLIDE_INTERVAL);
}
