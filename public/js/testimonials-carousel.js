document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('.testimonials-section');
  sections.forEach(section => {
    const grid = section.querySelector('.testimonials-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.testimonial-card'));
    if (cards.length <= 1) return;

    // Build carousel structure
    const carousel = document.createElement('div');
    carousel.className = 'testimonials-carousel';

    const controls = document.createElement('div');
    controls.className = 'testimonials-carousel-controls';
    controls.innerHTML = `
      <button class="testimonials-control prev" aria-label="Previous testimonial">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button class="testimonials-control next" aria-label="Next testimonial">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

    const track = document.createElement('div');
    track.className = 'testimonials-track';
    cards.forEach(card => track.appendChild(card));

    // Replace grid content
    grid.innerHTML = '';
    grid.appendChild(controls);
    grid.appendChild(track);

    function updateButtons() {
      const prevBtn = grid.querySelector('.testimonials-control.prev');
      const nextBtn = grid.querySelector('.testimonials-control.next');
      if (!prevBtn || !nextBtn) return;

      const maxScroll = track.scrollWidth - track.clientWidth;
      const atStart = track.scrollLeft <= 0;
      const atEnd = track.scrollLeft >= maxScroll - 1; // small epsilon

      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;
      prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
      nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    }

    const prevBtn = grid.querySelector('.testimonials-control.prev');
    const nextBtn = grid.querySelector('.testimonials-control.next');
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        const step = grid.offsetWidth; // scroll by one viewport
        track.scrollBy({ left: -step, behavior: 'smooth' });
        setTimeout(updateButtons, 400);
      });
      nextBtn.addEventListener('click', () => {
        const step = grid.offsetWidth;
        track.scrollBy({ left: step, behavior: 'smooth' });
        setTimeout(updateButtons, 400);
      });
    }

    track.addEventListener('scroll', () => {
      updateButtons();
    });

    window.addEventListener('resize', () => {
      updateButtons();
    });

    // Initial state
    setTimeout(updateButtons, 0);
  });
});
