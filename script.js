// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // ===== CURRENT YEAR IN FOOTER =====
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // ===== CART FUNCTIONALITY =====
    const cart = {
        items: [],
        total: 0,
        
        init() {
            this.loadCart();
            this.setupEventListeners();
            this.updateCartCount();
        },
        
        loadCart() {
            const savedCart = localStorage.getItem('coffeeHavenCart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
                this.calculateTotal();
                this.updateCartCount();
            }
        },
        
        saveCart() {
            localStorage.setItem('coffeeHavenCart', JSON.stringify(this.items));
        },
        
        addItem(item) {
            // Check if item already exists in cart
            const existingItem = this.items.find(i => i.id === item.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({...item, quantity: 1});
            }
            
            this.calculateTotal();
            this.saveCart();
            this.updateCartCount();
            this.showAddToCartToast(item.name);
        },
        
        removeItem(itemId) {
            this.items = this.items.filter(item => item.id !== itemId);
            this.calculateTotal();
            this.saveCart();
            this.updateCartCount();
        },
        
        updateQuantity(itemId, newQuantity) {
            const item = this.items.find(i => i.id === itemId);
            if (item) {
                item.quantity = newQuantity;
                if (item.quantity <= 0) {
                    this.removeItem(itemId);
                } else {
                    this.calculateTotal();
                    this.saveCart();
                }
            }
        },
        
        calculateTotal() {
            this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },
        
        updateCartCount() {
            const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
            const cartCountEl = document.querySelector('.cart-count');
            if (cartCountEl) {
                cartCountEl.textContent = count;
            }
        },
        
        showAddToCartToast(itemName) {
            toastr.success(`${itemName} added to cart!`);
        },
        
        setupEventListeners() {
            // Add to cart buttons
            document.querySelectorAll('.add-to-cart').forEach(btn => {
                btn.addEventListener('click', () => {
                    const item = {
                        id: btn.dataset.id,
                        name: btn.dataset.name,
                        price: parseFloat(btn.dataset.price)
                    };
                    this.addItem(item);
                    
                    // Check if user is logged in
                    const user = localStorage.getItem('coffeeHavenUser');
                    if (!user) {
                        this.showLoginModal();
                    }
                });
            });
            
            // Cart icon click
            const cartIcon = document.querySelector('.cart-icon');
            if (cartIcon) {
                cartIcon.addEventListener('click', () => {
                    this.showCartModal();
                });
            }
        },
        
        showCartModal() {
            // This would show the cart modal with all items
            console.log('Show cart modal with items:', this.items);
        },
        
        showLoginModal() {
            // This would show the login modal
            console.log('Show login modal');
            // In a real implementation, you would redirect to login page or show a modal
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
        }
    };
    
    // Initialize cart
    cart.init();

    // ===== LAZY LOADING IMAGES WITH INTERSECTION OBSERVER =====
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    
                    if (!img.complete) {
                        img.onload = function() {
                            img.classList.add('loaded');
                        };
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px 0px'
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ===== IMAGE SLIDER FUNCTIONALITY =====
    const initSlider = function() {
        const slider = document.querySelector('.slider');
        const slides = document.querySelectorAll('.slide');
        const btnPrev = document.querySelector('.prev-btn');
        const btnNext = document.querySelector('.next-btn');
        
        if (!slider || !slides.length) return;
        
        let currentSlide = 0;
        const maxSlide = slides.length - 1;
        
        slider.style.transform = 'translateX(0)';
        
        const goToSlide = function(slide) {
            slides.forEach((s, i) => {
                s.style.transform = `translateX(${100 * (i - slide)}%)`;
            });
        };
        
        const nextSlide = function() {
            if (currentSlide === maxSlide) {
                currentSlide = 0;
            } else {
                currentSlide++;
            }
            
            goToSlide(currentSlide);
        };
        
        const prevSlide = function() {
            if (currentSlide === 0) {
                currentSlide = maxSlide;
            } else {
                currentSlide--;
            }
            
            goToSlide(currentSlide);
        };
        
        btnNext.addEventListener('click', nextSlide);
        btnPrev.addEventListener('click', prevSlide);
        
        let slideInterval = setInterval(nextSlide, 5000);
        
        slider.parentElement.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        slider.parentElement.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        goToSlide(0);
    };
    
    initSlider();

    // ===== ONLINE ORDERING MODAL =====
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
                
                const firstInput = orderModal.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            });
        });
        
        closeModal.addEventListener('click', function() {
            orderModal.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        orderModal.addEventListener('click', function(e) {
            if (e.target === orderModal) {
                orderModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
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
                    input.classList.remove('error');
                    const errorMsg = input.nextElementSibling;
                    if (errorMsg && errorMsg.classList.contains('error-message')) {
                        errorMsg.remove();
                    }
                    
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
                    const firstInvalid = form.querySelector('.error');
                    if (firstInvalid) firstInvalid.focus();
                }
            });
        });
        
        function showError(input, message) {
            input.classList.add('error');
            
            let errorMsg = input.nextElementSibling;
            if (!errorMsg || !errorMsg.classList.contains('error-message')) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                input.parentNode.insertBefore(errorMsg, input.nextSibling);
            }
            
            errorMsg.textContent = message;
            errorMsg.setAttribute('role', 'alert');
        }
        
        function isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
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
                
                if (history.pushState) {
                    history.pushState(null, null, href);
                } else {
                    location.hash = href;
                }
            }
        });
    });

    // ===== ACCESSIBILITY IMPROVEMENTS =====
    document.addEventListener('keydown', function(e) {
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
            elements.forEach(element => {
                element.classList.add('animated');
            });
        }
    };
    
    animateOnScroll();
});

// ===== SERVICE WORKER FOR OFFLINE SUPPORT =====
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
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            
            menuSections.forEach(section => {
                section.classList.add('hidden');
            });
            
            document.getElementById(category).classList.remove('hidden');
            
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
    
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(2px)';
        });
        
        item.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        const orderBtn = item.querySelector('.btn');
        if (orderBtn) {
            orderBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const itemName = this.closest('.menu-item').querySelector('h3').textContent;
                alert(`Added ${itemName} to your order!`);
            });
        }
    });
    
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