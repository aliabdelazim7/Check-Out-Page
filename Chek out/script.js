// Enhanced Checkout JavaScript

// DOM Elements
const loadingOverlay = document.querySelector('.loading-overlay');
const progressSteps = document.querySelectorAll('.progress-step');
const cartItems = document.querySelectorAll('.cart-item');
const qtyBtns = document.querySelectorAll('.qty-btn');
const removeBtns = document.querySelectorAll('.remove-btn');
const paymentMethods = document.querySelectorAll('.payment-method');
const promoInput = document.querySelector('.promo-input input');
const applyBtn = document.querySelector('.apply-btn');
const promoMessage = document.querySelector('.promo-message');
const checkoutBtn = document.querySelector('.checkout-btn');
const successModal = document.getElementById('successModal');
const continueBtn = document.querySelector('.continue-btn');

// Cart Data
let cartData = {
  items: [
    {
      id: 1,
      name: "Wireless Headphones",
      description: "Premium Bluetooth headphones with noise cancellation",
      price: 199.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop"
    },
    {
      id: 2,
      name: "Smart Watch",
      description: "Fitness tracking smartwatch with heart rate monitor",
      price: 299.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop"
    },
    {
      id: 3,
      name: "Laptop Stand",
      description: "Adjustable aluminum laptop stand for ergonomic setup",
      price: 89.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=150&h=150&fit=crop"
    }
  ],
  subtotal: 0,
  shipping: 15.00,
  tax: 0,
  discount: 0,
  total: 0
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  hideLoading();
  initializeCheckout();
  initializeAnimations();
  initializeEventListeners();
  updateCartDisplay();
  calculateTotals();
});

// Hide loading overlay
function hideLoading() {
  setTimeout(() => {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 500);
  }, 1000);
}

// Initialize checkout functionality
function initializeCheckout() {
  // Set initial progress step
  setProgressStep(1);
  
  // Initialize cart items
  updateCartItems();
  
  // Set default payment method
  setPaymentMethod('credit-card');
}

// Set progress step
function setProgressStep(step) {
  progressSteps.forEach((stepEl, index) => {
    stepEl.classList.remove('active', 'completed');
    if (index + 1 < step) {
      stepEl.classList.add('completed');
    } else if (index + 1 === step) {
      stepEl.classList.add('active');
    }
  });
}

// Update cart items display
function updateCartItems() {
  const cartContainer = document.querySelector('.cart-items');
  if (!cartContainer) return;
  
  cartContainer.innerHTML = '';
  
  cartData.items.forEach(item => {
    const itemElement = createCartItemElement(item);
    cartContainer.appendChild(itemElement);
  });
  
  // Reattach event listeners
  attachCartItemListeners();
}

// Create cart item element
function createCartItemElement(item) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'cart-item';
  itemDiv.innerHTML = `
    <div class="item-image">
      <img src="${item.image}" alt="${item.name}">
    </div>
    <div class="item-details">
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="item-price">$${item.price.toFixed(2)}</div>
    </div>
    <div class="item-quantity">
      <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
      <span class="qty-value">${item.quantity}</span>
      <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
    </div>
    <button class="remove-btn" data-id="${item.id}">
      <i class="fas fa-trash"></i>
    </button>
  `;
  return itemDiv;
}

// Attach cart item event listeners
function attachCartItemListeners() {
  // Quantity buttons
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', handleQuantityChange);
  });
  
  // Remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', handleRemoveItem);
  });
}

// Handle quantity change
function handleQuantityChange(e) {
  const action = e.target.dataset.action;
  const itemId = parseInt(e.target.dataset.id);
  const item = cartData.items.find(item => item.id === itemId);
  
  if (action === 'increase') {
    item.quantity++;
  } else if (action === 'decrease' && item.quantity > 1) {
    item.quantity--;
  }
  
  updateCartDisplay();
  calculateTotals();
  animateButton(e.target);
}

// Handle remove item
function handleRemoveItem(e) {
  const itemId = parseInt(e.target.closest('.remove-btn').dataset.id);
  const itemIndex = cartData.items.findIndex(item => item.id === itemId);
  
  if (itemIndex > -1) {
    const itemElement = e.target.closest('.cart-item');
    itemElement.style.transform = 'translateX(100%)';
    itemElement.style.opacity = '0';
    
    setTimeout(() => {
      cartData.items.splice(itemIndex, 1);
      updateCartItems();
      calculateTotals();
      showNotification('Item removed from cart', 'success');
    }, 300);
  }
}

// Update cart display
function updateCartDisplay() {
  const itemCount = document.querySelector('.item-count');
  if (itemCount) {
    const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
    itemCount.textContent = `${totalItems} items`;
  }
}

// Calculate totals
function calculateTotals() {
  cartData.subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartData.tax = cartData.subtotal * 0.08; // 8% tax
  cartData.total = cartData.subtotal + cartData.shipping + cartData.tax - cartData.discount;
  
  updateSummaryDisplay();
}

// Update summary display
function updateSummaryDisplay() {
  const summaryRows = document.querySelectorAll('.summary-row');
  summaryRows.forEach(row => {
    const type = row.classList.contains('total') ? 'total' : 
                 row.classList.contains('subtotal') ? 'subtotal' :
                 row.classList.contains('shipping') ? 'shipping' :
                 row.classList.contains('tax') ? 'tax' : 'discount';
    
    const value = cartData[type];
    const valueElement = row.querySelector('span:last-child');
    if (valueElement) {
      valueElement.textContent = `$${value.toFixed(2)}`;
    }
  });
  
  // Update checkout button
  if (checkoutBtn) {
    const amountElement = checkoutBtn.querySelector('.btn-amount');
    if (amountElement) {
      amountElement.textContent = `$${cartData.total.toFixed(2)}`;
    }
  }
}

// Set payment method
function setPaymentMethod(method) {
  paymentMethods.forEach(pm => {
    pm.classList.remove('active');
    if (pm.dataset.method === method) {
      pm.classList.add('active');
    }
  });
}

// Handle promo code
function handlePromoCode() {
  const code = promoInput.value.trim().toUpperCase();
  
  if (!code) {
    showPromoMessage('Please enter a promo code', 'error');
    return;
  }
  
  // Simulate promo code validation
  const validCodes = {
    'SAVE20': 20,
    'WELCOME10': 10,
    'FREESHIP': 15
  };
  
  if (validCodes[code]) {
    cartData.discount = validCodes[code];
    calculateTotals();
    showPromoMessage(`Promo code applied! You saved $${validCodes[code].toFixed(2)}`, 'success');
    animateButton(applyBtn);
  } else {
    showPromoMessage('Invalid promo code', 'error');
  }
}

// Show promo message
function showPromoMessage(message, type) {
  promoMessage.textContent = message;
  promoMessage.className = `promo-message ${type}`;
  
  setTimeout(() => {
    promoMessage.style.display = 'none';
  }, 3000);
}

// Handle checkout
function handleCheckout() {
  if (cartData.items.length === 0) {
    showNotification('Your cart is empty', 'error');
    return;
  }
  
  // Show loading state
  checkoutBtn.disabled = true;
  checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  
  // Simulate payment processing
  setTimeout(() => {
    showSuccessModal();
    checkoutBtn.disabled = false;
    checkoutBtn.innerHTML = '<i class="fas fa-lock"></i> Secure Checkout <span class="btn-amount">$0.00</span>';
  }, 2000);
}

// Show success modal
function showSuccessModal() {
  const orderNumber = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  document.querySelector('.order-number strong').textContent = orderNumber;
  document.querySelector('.order-total strong').textContent = `$${cartData.total.toFixed(2)}`;
  
  successModal.style.display = 'block';
  
  // Animate success icon
  const successIcon = document.querySelector('.success-animation i');
  successIcon.style.animation = 'none';
  setTimeout(() => {
    successIcon.style.animation = 'bounce 0.6s ease';
  }, 10);
}

// Initialize animations
function initializeAnimations() {
  // Intersection Observer for fade-in animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  // Observe cards for animation
  document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

// Initialize event listeners
function initializeEventListeners() {
  // Payment method selection
  paymentMethods.forEach(pm => {
    pm.addEventListener('click', () => {
      setPaymentMethod(pm.dataset.method);
      animateButton(pm);
    });
  });
  
  // Promo code apply button
  if (applyBtn) {
    applyBtn.addEventListener('click', handlePromoCode);
  }
  
  // Promo code input enter key
  if (promoInput) {
    promoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handlePromoCode();
      }
    });
  }
  
  // Checkout button
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
  
  // Continue shopping button
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      successModal.style.display = 'none';
      showNotification('Thank you for your purchase!', 'success');
    });
  }
  
  // Modal close on outside click
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.style.display = 'none';
      }
    });
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal.style.display === 'block') {
      successModal.style.display = 'none';
    }
  });
  
  // Form validation
  document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('blur', validateField);
    input.addEventListener('input', clearFieldError);
  });
}

// Animate button
function animateButton(button) {
  button.style.transform = 'scale(0.95)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 150);
}

// Show notification
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 10px;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Validate field
function validateField(e) {
  const field = e.target;
  const value = field.value.trim();
  
  // Remove existing error
  clearFieldError(e);
  
  // Check required fields
  if (field.hasAttribute('required') && !value) {
    showFieldError(field, 'This field is required');
    return false;
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showFieldError(field, 'Please enter a valid email address');
      return false;
    }
  }
  
  // Phone validation
  if (field.name === 'phone' && value) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      showFieldError(field, 'Please enter a valid phone number');
      return false;
    }
  }
  
  return true;
}

// Show field error
function showFieldError(field, message) {
  field.style.borderColor = '#e74c3c';
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    color: #e74c3c;
    font-size: 0.8em;
    margin-top: 5px;
    animation: slideInDown 0.3s ease;
  `;
  
  field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(e) {
  const field = e.target;
  field.style.borderColor = 'rgba(102, 126, 234, 0.2)';
  
  const errorDiv = field.parentNode.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .cart-item {
    transition: all 0.3s ease;
  }
  
  .qty-btn, .remove-btn {
    transition: all 0.3s ease;
  }
  
  .payment-method {
    transition: all 0.3s ease;
  }
  
  .checkout-btn {
    transition: all 0.3s ease;
  }
  
  .notification {
    animation: slideInRight 0.3s ease;
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
    }
    to {
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);

// Performance optimization
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(() => {
    // Handle scroll-based animations if needed
  }, 16);
});

// Accessibility improvements
document.addEventListener('keydown', (e) => {
  // Add keyboard navigation for cart items
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
});

// Touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - could be used for navigation
    } else {
      // Swipe right - could be used for navigation
    }
  }
}

// Initialize on window load
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
