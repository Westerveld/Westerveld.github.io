class ProjectsManager {
    constructor() {
        this.grid = document.querySelector('.projects-grid');
        this.template = document.querySelector('#project-card-template');
        this.isotope = null;
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.projectPopup = new ProjectPopup();
    }

    async init() {
        try {
            await this.loadProjects();
            this.initializeIsotope();
            this.setupFilterListeners();
        } catch (error) {
            console.error('Error initializing projects:', error);
            this.handleError(error);
        }
    }

    async loadProjects() {
        const response = await fetch('projects.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.renderProjects(data.projects);
    }

    renderProjects(projects) {
        projects.forEach(project => {
            const card = this.createProjectCard(project);
            this.grid.appendChild(card);
        });
    }

    createProjectCard(project) {
        const clone = this.template.content.cloneNode(true);
        const container = clone.querySelector('.project-item');

        this.setProjectCardContent(container, project);
        this.addProjectCardEventListeners(container, project);

        return clone;
    }

    setProjectCardContent(container, project) {
        // Set category classes
        container.classList.add(...project.category.split(' '));

        // Set content
        const elements = {
            image: container.querySelector('.project-image'),
            title: container.querySelector('.project-title'),
            description: container.querySelector('.project-description')
        };

        elements.image.src = project.banner;
        elements.image.alt = project.title;
        elements.title.textContent = project.title;
        elements.description.textContent = project.description;
    }

    addProjectCardEventListeners(container, project) {
        const learnMoreBtn = container.querySelector('.project-link');
        learnMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.projectPopup.show(project);
        });
    }

    initializeIsotope() {
        this.isotope = new Isotope(this.grid, {
            itemSelector: '.project-item',
            layoutMode: 'fitRows'
        });
    }

    setupFilterListeners() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
        });
    }

    handleFilterClick(event) {
        const filterValue = event.target.getAttribute('data-filter');

        // Update active state
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Apply filter
        this.isotope.arrange({
            filter: filterValue === '*' ? null : filterValue
        });

        // Hide project info when "All" filter is clicked
        if (filterValue === '*') {
            this.hideProjectInfo();
        }
    }

    hideProjectInfo() {
        const projectInfo = document.getElementById('project-info');
        projectInfo.classList.add('d-none');
    }

    handleError(error) {
        // Add appropriate error handling for your application
        console.error('Projects Manager Error:', error);
    }
}

class ProjectPopup {
    constructor() {
        this.popup = new bootstrap.Modal(document.getElementById('projectPopup'));
        this.popupElement = document.getElementById('projectPopup');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.popupElement.addEventListener('hidden.bs.modal', () => {
            const carousel = this.popupElement.querySelector('#popupCarousel');
            if (carousel) {
                bootstrap.Carousel.getInstance(carousel)?.dispose();
            }
            // Restore the original page title
            if (this.originalTitle) {
                document.title = this.originalTitle;
            }
        });
    }

    show(projectData) {
        this.setPopupContent(projectData);
        this.setupCarousel(projectData['carousel-images']);
        // Store the original title to restore it later
        this.originalTitle = document.title;
        // Update the page title to include the project name
        document.title = `${projectData.title} | ${this.originalTitle}`;
        this.popup.show();
    }

    setPopupContent(projectData) {
        this.popupElement.querySelector('.modal-title').textContent = projectData.title;

        this.setDescription(projectData['long-description']);
        this.setProjectInfo(projectData);
        this.setLinks(projectData.links);
    }

    setDescription(description) {
        const descriptionEl = this.popupElement.querySelector('.project-description');
        descriptionEl.innerHTML = description.split('. ')
            .map(sentence => `<p>${sentence}</p>`)
            .join('');
    }

    setProjectInfo(projectData) {
        this.popupElement.querySelector('.project-info').innerHTML = `
            <li><strong>Date:</strong> ${projectData.date}</li>
            <li><strong>Role:</strong> ${projectData.role}</li>
            <li><strong>Technologies:</strong> ${projectData.Technologies}</li>
        `;
    }

    setLinks(links) {
        this.popupElement.querySelector('.project-links').innerHTML = links
            .map(link => `
                <a href="${link.url}" 
                   class="btn btn-${link.name === 'Steam' ? 'primary' : 'outline-secondary'} mb-2 w-100" 
                   target="_blank" 
                   rel="noopener noreferrer">${link.name}</a>
            `).join('');
    }

    setupCarousel(images) {
        const carousel = this.setupCarouselStructure(images);
        
        // Hide navigation buttons if there's only one image
        const prevButton = carousel.querySelector('.carousel-control-prev');
        const nextButton = carousel.querySelector('.carousel-control-next');
        const indicators = carousel.querySelector('.carousel-indicators');
        
        if (images.length <= 1) {
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
            indicators.style.display = 'none'; // Also hide indicators for single image
        } else {
            prevButton.style.display = '';
            nextButton.style.display = '';
            indicators.style.display = ''; // Show indicators for multiple images
        }

        new bootstrap.Carousel(carousel);
    }

    setupCarouselStructure(images) {
        const carousel = this.popupElement.querySelector('#popupCarousel');
        const indicators = carousel.querySelector('.carousel-indicators');
        const carouselInner = carousel.querySelector('.carousel-inner');

        indicators.innerHTML = '';
        carouselInner.innerHTML = '';

        images.forEach((imagePath, index) => {
            this.addCarouselIndicator(indicators, index);
            this.addCarouselSlide(carouselInner, imagePath, index);
        });

        return carousel;
    }

    addCarouselIndicator(indicators, index) {
        indicators.innerHTML += `
        <button type="button" 
                data-bs-target="#popupCarousel" 
                data-bs-slide-to="${index}" 
                ${index === 0 ? 'class="active"' : ''}
                aria-label="Slide ${index + 1}"></button>
    `;
    }

    addCarouselSlide(carouselInner, imagePath, index) {
        carouselInner.innerHTML += `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
            <img src="${imagePath}" class="d-block w-100">
        </div>
    `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const projectsManager = new ProjectsManager();
    projectsManager.init();
});