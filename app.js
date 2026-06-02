// ==========================================
// GLOBALS & STATE
// ==========================================
let cart = [];
const STORE_PHONE = "0383330278";

// DOM Elements
const navbar = document.querySelector('.navbar');
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const cartFloatingBtn = document.getElementById('cart-floating-btn');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartBadgeCount = document.getElementById('cart-badge-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const btnOrderZalo = document.getElementById('btn-order-zalo');

// ==========================================
// SCROLL EFFECT & ACTIVE NAVIGATION LINK
// ==========================================
window.addEventListener('scroll', () => {
  // Add background/shadow to navbar on scroll
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active link highlighting on scroll
  let current = "";
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.pageYOffset >= (sectionTop - 120)) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  const icon = menuToggle.querySelector('i');
  if (navMenu.classList.contains('open')) {
    icon.classList.replace('fa-bars', 'fa-xmark');
  } else {
    icon.classList.replace('fa-xmark', 'fa-bars');
  }
});

// Close mobile menu when a link is clicked
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    const icon = menuToggle.querySelector('i');
    icon.classList.replace('fa-xmark', 'fa-bars');
  });
});

// ==========================================
// SHOPPING CART CONTROLLER
// ==========================================

// Add to Cart Event Listeners
document.querySelectorAll('.product-card').forEach(card => {
  const btnAdd = card.querySelector('.btn-add-cart');
  btnAdd.addEventListener('click', () => {
    const id = parseInt(card.getAttribute('data-id'));
    const name = card.getAttribute('data-name');
    const price = parseInt(card.getAttribute('data-price'));
    
    addToCart(id, name, price);
    
    // Quick micro-animation for the button
    btnAdd.innerHTML = '<i class="fa-solid fa-check"></i> Đã Thêm';
    btnAdd.style.backgroundColor = '#d97706';
    btnAdd.style.color = '#fff';
    setTimeout(() => {
      btnAdd.innerHTML = '<i class="fa-solid fa-plus"></i> Thêm';
      btnAdd.style.backgroundColor = '';
      btnAdd.style.color = '';
    }, 1000);
  });
});

// Toggle Cart Sidebar Drawer on Mobile
cartFloatingBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  cartSidebar.classList.toggle('open');
});

// Close Cart Sidebar on outside click (Mobile)
document.addEventListener('click', (e) => {
  if (window.innerWidth <= 1024) {
    if (!cartSidebar.contains(e.target) && e.target !== cartFloatingBtn && !cartFloatingBtn.contains(e.target)) {
      cartSidebar.classList.remove('open');
    }
  }
});

// Add Item
function addToCart(id, name, price) {
  const existingItemIndex = cart.findIndex(item => item.id === id);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }
  
  updateCartUI();
  
  // Auto open cart on desktop, bounce on mobile
  if (window.innerWidth > 1024) {
    // Already visible
  } else {
    cartFloatingBtn.style.transform = 'scale(1.2)';
    setTimeout(() => cartFloatingBtn.style.transform = '', 300);
  }
}

// Change Quantity
function changeQuantity(id, delta) {
  const index = cart.findIndex(item => item.id === id);
  if (index > -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1); // remove if zero
    }
    updateCartUI();
  }
}

// Format currency
function formatVND(number) {
  return number.toLocaleString('vi-VN') + 'đ';
}

// Update Cart DOM
function updateCartUI() {
  cartItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-basket-shopping"></i>
        <p>Chưa có sản phẩm nào được chọn.</p>
      </div>
    `;
    cartCount.textContent = '0';
    cartBadgeCount.textContent = '0';
    cartSubtotal.textContent = '0đ';
    cartTotal.textContent = '0đ';
    return;
  }
  
  let totalItems = 0;
  let totalPrice = 0;
  
  cart.forEach(item => {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;
    
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatVND(item.price)}</div>
      </div>
      <div class="cart-item-actions">
        <button class="btn-qty" onclick="changeQuantity(${item.id}, -1)">-</button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="btn-qty" onclick="changeQuantity(${item.id}, 1)">+</button>
      </div>
    `;
    cartItemsContainer.appendChild(itemEl);
  });
  
  cartCount.textContent = totalItems;
  cartBadgeCount.textContent = totalItems;
  cartSubtotal.textContent = formatVND(totalPrice);
  cartTotal.textContent = formatVND(totalPrice);
}

// Attach changeQuantity to window to make it accessible by onclick
window.changeQuantity = changeQuantity;

// ==========================================
// CHECKOUT & ZALO REDIRECT
// ==========================================
btnOrderZalo.addEventListener('click', () => {
  // 1. Validation
  if (cart.length === 0) {
    alert("Giỏ hàng của bạn đang trống! Vui lòng chọn ít nhất 1 ổ bánh mì.");
    return;
  }
  
  const customerName = document.getElementById('order-name').value.trim();
  const customerPhone = document.getElementById('order-phone').value.trim();
  const customerAddress = document.getElementById('order-address').value.trim();
  const customerNote = document.getElementById('order-note').value.trim();
  
  if (!customerName || !customerPhone || !customerAddress) {
    alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ để chúng tôi giao bánh!");
    return;
  }
  
  // 2. Build order message content
  let orderMsg = `🍞 ĐƠN ĐẶT HÀNG - LOVE BÁNH MÌ 🍞\n`;
  orderMsg += `----------------------------------------\n`;
  
  let totalPrice = 0;
  cart.forEach((item, index) => {
    const sub = item.price * item.quantity;
    totalPrice += sub;
    orderMsg += `${index + 1}. ${item.name} x${item.quantity} - ${formatVND(sub)}\n`;
  });
  
  orderMsg += `----------------------------------------\n`;
  orderMsg += `💰 TỔNG THANH TOÁN: ${formatVND(totalPrice)}\n\n`;
  orderMsg += `👤 Khách hàng: ${customerName}\n`;
  orderMsg += `📞 Điện thoại: ${customerPhone}\n`;
  orderMsg += `📍 Địa chỉ giao: ${customerAddress}\n`;
  if (customerNote) {
    orderMsg += `📝 Ghi chú: ${customerNote}\n`;
  }
  orderMsg += `\n(Đơn hàng được khởi tạo từ Website Love Bánh Mì)`;

  // 3. Copy to clipboard
  navigator.clipboard.writeText(orderMsg).then(() => {
    // Notify user of successful clipboard copy
    alert(
      `🎉 Thông tin đơn hàng đã được sao chép tự động!\n\n` +
      `Hệ thống sẽ mở Zalo số điện thoại cửa hàng (${STORE_PHONE}) ngay bây giờ.\n` +
      `Bạn chỉ cần bấm nút Dán (Paste hoặc Ctrl+V) tin nhắn và Gửi đi để hoàn tất đặt bánh.`
    );
    
    // 4. Open Zalo chat
    const zaloUrl = `https://zalo.me/${STORE_PHONE}`;
    window.open(zaloUrl, '_blank');
  }).catch(err => {
    console.error("Lỗi khi sao chép đơn hàng: ", err);
    // Fallback if clipboard fails: open chat anyway
    const zaloUrl = `https://zalo.me/${STORE_PHONE}`;
    window.open(zaloUrl, '_blank');
  });
});

// ==========================================
// SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
// ==========================================
const revealElements = [
  document.querySelector('.hero-content'),
  document.querySelector('.hero-image-wrapper'),
  document.querySelector('.menu-section .section-header'),
  document.querySelector('.products-grid'),
  document.querySelector('.cart-sidebar'),
  document.querySelector('.story-image'),
  document.querySelector('.story-text'),
  document.querySelector('.business-card'),
  document.querySelector('.contact-form-box'),
  document.querySelector('.contact-map')
];

// Add dynamic CSS class for transition initialization
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .reveal.active {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
`);

// Setup intersection observer
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); // Animates only once
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px' // Trigges slightly before element enters view fully
});

revealElements.forEach(el => {
  if (el) {
    el.classList.add('reveal');
    revealObserver.observe(el);
  }
});
