document.addEventListener('DOMContentLoaded', function() {
    // Initialize Isotope
    const grid = document.querySelector('.projects-grid');
    const iso = new Isotope(grid, {
        itemSelector: '.project-item',
        layoutMode: 'fitRows',
        percentPosition: true
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-container .btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');
            iso.arrange({ filter: filterValue });
        });
    });
});
