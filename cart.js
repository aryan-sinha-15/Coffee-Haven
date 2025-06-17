// Cart functionality
const cart = {
  items: [],
  total: 0,
  
  init() {
    this.loadCart();
    this.setupEventListeners();
    this.updateCartCount();
  },
  
  loadCart() {
    const user = JSON.parse(localStorage.getItem('coffeeHavenUser'));
    if (user && user.uid) {
      // Load cart from Firestore for logged in users
      db.collection('userCarts').doc(user.uid).get()
        .then(doc => {
          if (doc.exists) {
            this.items = doc.data().items || [];
            this.calculateTotal();
            this.renderCartItems();
            this.updateCartCount();
          }
        });
    } else {
      // Load cart from localStorage for guests
      const guestCart = localStorage.getItem('coffeeHavenGuestCart');
      if (guestCart) {
        this.items = JSON.parse(guestCart);
        this.calculateTotal();
        this.renderCartItems();
        this.updateCartCount();
      }
    }
  },
  
  saveCart() {
    const user = JSON.parse(localStorage.getItem('coffeeHavenUser'));
    if (user && user.uid) {
      // Save to Firestore for logged in users
      db.collection('userCarts').doc(user.uid).set({
        items: this.items,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Save to localStorage for guests
      localStorage.setItem('coffeeHavenGuestCart', JSON.stringify(this.items));
    }
  },
  
  addItem(item) {
    const existingItem = this.items.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({...item, quantity: 1});
    }
    
    this.calculateTotal();
    this.saveCart();
    this.renderCartItems();
    this.updateCartCount();
    toastr.success(`${item.name} added to cart!`);
  },
  
  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    this.calculateTotal();
    this.saveCart();
    this.renderCartItems();
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
        this.renderCartItems();
      }
    }
  },
  
  calculateTotal() {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  renderCartItems() {
    const cartItemsEl = document.querySelector('.cart-items');
    const totalAmountEl = document.querySelector('.total-amount');
    
    if (this.items.length === 0) {
      cartItemsEl.innerHTML = '<p>Your cart is empty</p>';
      totalAmountEl.textContent = '0.00';
      return;
    }
    
    cartItemsEl.innerHTML = this.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
          <button class="quantity-btn minus">-</button>
          <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1">
          <button class="quantity-btn plus">+</button>
          <i class="fas fa-trash remove-item"></i>
        </div>
      </div>
    `).join('');
    
    totalAmountEl.textContent = this.total.toFixed(2);
  },
  
  updateCartCount() {
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
  },
  
  clearCart() {
    this.items = [];
    this.total = 0;
    this.saveCart();
    this.renderCartItems();
    this.updateCartCount();
  },
  
  setupEventListeners() {
    // Toggle cart modal
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.addEventListener('click', () => {
        document.querySelector('.cart-modal').classList.add('active');
        document.querySelector('.cart-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }
    
    const closeCart = document.querySelector('.close-cart');
    if (closeCart) {
      closeCart.addEventListener('click', this.closeCart.bind(this));
    }
    
    const cartOverlay = document.querySelector('.cart-overlay');
    if (cartOverlay) {
      cartOverlay.addEventListener('click', this.closeCart.bind(this));
    }
    
    const continueShopping = document.querySelector('.continue-shopping');
    if (continueShopping) {
      continueShopping.addEventListener('click', this.closeCart.bind(this));
    }
    
    // Checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) {
          toastr.warning('Your cart is empty');
          return;
        }
        
        this.closeCart();
        
        // Check if user is logged in or is guest
        const user = JSON.parse(localStorage.getItem('coffeeHavenUser'));
        const guest = localStorage.getItem('coffeeHavenGuest');
        
        if (user || guest) {
          this.generateBill(user ? JSON.parse(user) : null);
        } else {
          this.showLoginModal();
        }
      });
    }
    
    // Quantity changes
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('minus')) {
        const itemEl = e.target.closest('.cart-item');
        const itemId = itemEl.dataset.id;
        const quantityInput = itemEl.querySelector('.cart-item-quantity');
        const newQuantity = parseInt(quantityInput.value) - 1;
        this.updateQuantity(itemId, newQuantity);
      }
      
      if (e.target.classList.contains('plus')) {
        const itemEl = e.target.closest('.cart-item');
        const itemId = itemEl.dataset.id;
        const quantityInput = itemEl.querySelector('.cart-item-quantity');
        const newQuantity = parseInt(quantityInput.value) + 1;
        this.updateQuantity(itemId, newQuantity);
      }
      
      if (e.target.classList.contains('remove-item')) {
        const itemId = e.target.closest('.cart-item').dataset.id;
        this.removeItem(itemId);
      }
    });
    
    // Input quantity changes
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('cart-item-quantity')) {
        const itemId = e.target.closest('.cart-item').dataset.id;
        const newQuantity = parseInt(e.target.value);
        if (!isNaN(newQuantity)) {
          this.updateQuantity(itemId, newQuantity);
        }
      }
    });
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const item = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: parseFloat(btn.dataset.price)
        };
        this.addItem(item);
      });
    });
  },
  
  closeCart() {
    document.querySelector('.cart-modal').classList.remove('active');
    document.querySelector('.cart-overlay').classList.remove('active');
    document.body.style.overflow = '';
  },
  
  showLoginModal() {
    document.querySelector('.login-modal').classList.add('active');
    document.querySelector('.cart-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  
  hideLoginModal() {
    document.querySelector('.login-modal').classList.remove('active');
    document.querySelector('.cart-overlay').classList.remove('active');
    document.body.style.overflow = '';
  },
  
  generateBill(userInfo = null) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add logo and title
    doc.setFontSize(22);
    doc.setTextColor(111, 78, 55);
    doc.text('Coffee Haven', 105, 20, { align: 'center' });
    
    // Add customer info if available
    if (userInfo) {
      doc.text(`Customer: ${userInfo.name}`, 14, 48);
      doc.text(`Email: ${userInfo.email}`, 14, 52);
    } else {
      doc.text('Customer: Guest', 14, 48);
    }
    
    // Add items table
    doc.autoTable({
      startY: 62,
      head: [['Item', 'Quantity', 'Price', 'Total']],
      body: this.items.map(item => [
        item.name,
        item.quantity,
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.quantity).toFixed(2)}`
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [111, 78, 55],
        textColor: 255
      }
    });
    
    // Add total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(111, 78, 55);
    doc.text('Total:', 160, finalY);
    doc.text(`$${this.total.toFixed(2)}`, 190, finalY, { align: 'right' });
    
    // Save the PDF
    doc.save(`CoffeeHaven_Receipt_${new Date().getTime()}.pdf`);
    
    // Clear cart after generating bill
    this.clearCart();
    
    toastr.success('Thank you for your purchase! Your receipt has been downloaded.');
  }
};

// Initialize cart
cart.init();