// Cart functionality for menu and products pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart from localStorage or create empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update cart count in navbar
    function updateCartCount() {
      const cartCountElements = document.querySelectorAll('.cart-count, #cart-count');
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      
      cartCountElements.forEach(element => {
        element.textContent = totalItems;
      });
    }
    
    // Add to cart functionality
    function setupAddToCartButtons() {
      const addToCartButtons = document.querySelectorAll('.add-to-cart');
      
      addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
          // Get product details
          const card = this.closest('.menu-card, .product-card');
          const item = {
            id: card.dataset.id || Date.now().toString(),
            name: card.querySelector('h3, .product-title').textContent,
            description: card.querySelector('p, .product-description')?.textContent || '',
            price: parseFloat(card.querySelector('.price, .product-price').textContent.replace(/[^0-9.]/g, '')),
            image: card.querySelector('img').src,
            quantity: 1
          };
          
          // Check if item already exists in cart
          const existingItem = cart.find(cartItem => cartItem.id === item.id);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            cart.push(item);
          }
          
          // Save to localStorage
          localStorage.setItem('cart', JSON.stringify(cart));
          
          // Update UI
          updateCartCount();
          
          // Visual feedback
          const originalText = this.textContent;
          this.textContent = 'Added!';
          this.style.backgroundColor = '#4CAF50';
          
          setTimeout(() => {
            this.textContent = originalText;
            this.style.backgroundColor = '';
          }, 1500);
        });
      });
    }
    
    // Initialize
    updateCartCount();
    setupAddToCartButtons();
  });