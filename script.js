// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // ===== CURRENT YEAR IN FOOTER =====
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // ===== LAZY LOADING IMAGES WITH INTERSECTION OBSERVER =====
    // PDF Requirement #13 - Performance Optimization
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    
                    // If the image hasn't loaded yet, load it
                    if (!img.complete) {
                        img.onload = function() {
                            img.classList.add('loaded');
                        };
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px' // Load images 200px before they're visible
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ===== IMAGE SLIDER FUNCTIONALITY =====
    // PDF Requirement #8 - Gallery/Slider
    const initSlider = function() {
        const slider = document.querySelector('.slider');
        const slides = document.querySelectorAll('.slide');
        const btnPrev = document.querySelector('.prev-btn');
        const btnNext = document.querySelector('.next-btn');
        
        if (!slider || !slides.length) return;
        
        let currentSlide = 0;
        const maxSlide = slides.length - 1;
        
        // Arrange slides next to each other
        slider.style.transform = 'translateX(0)';
        
        // Next slide function
        const goToSlide = function(slide) {
            slides.forEach((s, i) => {
                s.style.transform = `translateX(${100 * (i - slide)}%)`;
            });
        };
        
        // Next slide
        const nextSlide = function() {
            if (currentSlide === maxSlide) {
                currentSlide = 0;
            } else {
                currentSlide++;
            }
            
            goToSlide(currentSlide);
        };
        
        // Previous slide
        const prevSlide = function() {
            if (currentSlide === 0) {
                currentSlide = maxSlide;
            } else {
                currentSlide--;
            }
            
            goToSlide(currentSlide);
        };
        
        // Event listeners
        btnNext.addEventListener('click', nextSlide);
        btnPrev.addEventListener('click', prevSlide);
        
        // Auto-slide every 5 seconds
        let slideInterval = setInterval(nextSlide, 5000);
        
        // Pause on hover
        slider.parentElement.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        slider.parentElement.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        // Initialize slider
        goToSlide(0);
    };
    
    initSlider();

    // ===== ONLINE ORDERING MODAL =====
    // PDF Requirement #9 - Optional Online Ordering
    const initOrderModal = function() {
        const orderBtns = document.querySelectorAll('.btn-order, [href="#order"]');
        const orderModal = document.getElementById('order-modal');
        const closeModal = document.querySelector('.modal-close');
        
        if (!orderModal) return;
        
        orderBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                orderModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Focus on first input when modal opens
                const firstInput = orderModal.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            });
        });
        
        closeModal.addEventListener('click', function() {
            orderModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close when clicking outside modal content
        orderModal.addEventListener('click', function(e) {
            if (e.target === orderModal) {
                orderModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && orderModal.classList.contains('active')) {
                orderModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    };
    
    initOrderModal();

    // ===== FORM VALIDATION =====
    const validateForms = function() {
        const forms = document.querySelectorAll('form:not(.no-validate)');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                let isValid = true;
                const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
                
                inputs.forEach(input => {
                    // Reset error states
                    input.classList.remove('error');
                    const errorMsg = input.nextElementSibling;
                    if (errorMsg && errorMsg.classList.contains('error-message')) {
                        errorMsg.remove();
                    }
                    
                    // Check validity
                    if (!input.value.trim()) {
                        showError(input, 'This field is required');
                        isValid = false;
                    } else if (input.type === 'email' && !isValidEmail(input.value)) {
                        showError(input, 'Please enter a valid email address');
                        isValid = false;
                    } else if (input.type === 'tel' && !isValidPhone(input.value)) {
                        showError(input, 'Please enter a valid phone number');
                        isValid = false;
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                    // Focus on first invalid input
                    const firstInvalid = form.querySelector('.error');
                    if (firstInvalid) firstInvalid.focus();
                }
            });
        });
        
        // Helper function to show error messages
        function showError(input, message) {
            input.classList.add('error');
            
            // Create error message element if it doesn't exist
            let errorMsg = input.nextElementSibling;
            if (!errorMsg || !errorMsg.classList.contains('error-message')) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                input.parentNode.insertBefore(errorMsg, input.nextSibling);
            }
            
            errorMsg.textContent = message;
            errorMsg.setAttribute('role', 'alert');
        }
        
        // Email validation helper
        function isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        // Phone validation helper (basic)
        function isValidPhone(phone) {
            const re = /^[\d\s\-\(\)\+]{10,}$/;
            return re.test(phone);
        }
    };
    
    validateForms();

    // ===== SMOOTH SCROLLING FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Don't intercept in-page anchor links
            if (href === '#' || href === '#!') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    location.hash = href;
                }
            }
        });
    });

    // ===== ACCESSIBILITY IMPROVEMENTS =====
    // PDF Requirement #11 - Accessibility
    document.addEventListener('keydown', function(e) {
        // Trap focus in modal when open
        const activeModal = document.querySelector('.modal.active');
        if (activeModal && e.key === 'Tab') {
            const focusable = activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            }
        }
    });

    // ===== LOADING ANIMATIONS =====
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });
            
            elements.forEach(element => {
                observer.observe(element);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            elements.forEach(element => {
                element.classList.add('animated');
            });
        }
    };
    
    animateOnScroll();
});

// ===== SERVICE WORKER FOR OFFLINE SUPPORT =====
// PDF Requirement #13 - Performance Optimization
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
// Menu Category Tabs Functionality
function initMenuTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    const menuSections = document.querySelectorAll('.menu-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get the category to show
            const category = this.dataset.category;
            
            // Hide all menu sections
            menuSections.forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show the selected category
            document.getElementById(category).classList.remove('hidden');
            
            // Smooth scroll to the section
            document.getElementById(category).scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

// Initialize menu tabs when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initMenuTabs();
    
    // Additional menu item interactions
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        // Add click effect
        item.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(2px)';
        });
        
        item.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Add to order button functionality
        const orderBtn = item.querySelector('.btn');
        if (orderBtn) {
            orderBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const itemName = this.closest('.menu-item').querySelector('h3').textContent;
                alert(`Added ${itemName} to your order!`);
                // In a real implementation, this would add to a cart system
            });
        }
    });
    
    // Menu item animation on scroll
    const animateMenuItems = function() {
        const items = document.querySelectorAll('.menu-item');
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });
            
            items.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                observer.observe(item);
            });
        }
    };
    
    animateMenuItems();
});