// متغيرات التطبيق
let cart = [];
// تحميل السلة من التخزين المحلي عند البدء
try {
  const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (Array.isArray(savedCart)) cart = savedCart;
} catch {}
let total = 0;
let currentProduct = null;
// تخزين تقييمات المنتجات المميزة حسب الاسم
const featuredRatings = {};
const specialtyRatings = {};
// تعيين طبيب لكل منتج (يمكن تعديل الأسماء لاحقاً)
const doctorAssignments = {
    'جهاز الأشعة السينية الرقمي': 'د. أحمد – اختصاص أشعة',
    'جهاز الأشعة المقطعية CT': 'د. علي – اختصاص أشعة',
    'جهاز الرنين المغناطيسي': 'د. مصطفى – اختصاص أشعة',
    'جهاز تخطيط القلب ECG': 'د. حسين – اختصاص قلب',
    'جهاز هولتر القلب': 'د. ميثم – اختصاص قلب',
    'جهاز مزيل الرجفان': 'د. كرار – اختصاص قلب',
    'جهاز تحليل الدم الكامل': 'د. سارة – اختصاص مختبر',
    'جهاز تحليل الكيماويات الحيوية': 'د. زهراء – اختصاص مختبر',
    'جهاز تحليل البول التلقائي': 'د. نور – اختصاص مختبر'
};

// عناصر DOM
const cartModal = document.getElementById('cart-modal');
const overlay = document.getElementById('overlay');
const cartToggle = document.getElementById('cart-toggle');
const closeCart = document.getElementById('close-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const cartBody = document.getElementById('cart-body');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.querySelector('.cart-count');
const toast = document.getElementById('toast');
const orderForm = document.getElementById('order-form');
const productModal = document.getElementById('product-modal');
const closeModal = document.getElementById('close-modal');
const modalAddToCart = document.getElementById('modal-add-to-cart');
const userIcon = document.getElementById('user-icon');
const authModal = document.getElementById('auth-modal');
const closeAuthModal = document.getElementById('close-auth-modal');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
const creditCardDetails = document.getElementById('credit-card-details');
const priceRange = document.getElementById('price-range');
const maxPriceDisplay = document.getElementById('max-price');
const categoryFilters = document.querySelectorAll('input[name="category"]');
const sortBy = document.getElementById('sort-by');
const productsGrid = document.getElementById('products-grid');
const filterToggle = document.getElementById('filter-toggle');
const filterPopup = document.getElementById('filter-popup');
const closeFilter = document.getElementById('close-filter');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');

// بيانات المنتجات
const products = [{
    name: 'جهاز تخطيط القلب ECJ',
    price: 500000,
    image: 'https://cdn.altibbi.com/cdn/cache/1000x500/image/2020/03/12/742d13dea638d95c0f156816befc050f.png.webp',
    rating: 4.5,
    ratingCount: 24,
    category: 'diagnostic',
    year: 2022,
    country: 'ألمانيا',
    features: [
        'للأقسام: القلب، العناية المركزة، الطوارئ',
        '12 قناة تخطيط قلب',
        'شاشة لمس 10 بوصة',
        'ذاكرة تخزين 500 اختبار',
        'بطارية تعمل لمدة 8 ساعات'
    ],
    description: 'جهاز تخطيط القلب ECJ هو أحدث جهاز في مجال تخطيط القلب، يتميز بدقة عالية وسهولة في الاستخدام مع شاشة لمس عالية الجودة.'
}, {
    name: 'جهاز الأشعة السينية XRAY',
    price: 900000,
    image: 'https://media.istockphoto.com/id/1005121658/photo/mri-scan-machine.jpg?s=2048x2048&w=is&k=20&c=BDjnN1Z82gLDPbxUvlj4m3cSknXOzSnjeepwSYdTlno=',
    rating: 5,
    ratingCount: 42,
    category: 'imaging',
    year: 2021,
    country: 'اليابان',
    features: [
        'للأقسام: الأشعة، الطوارئ، العظام',
        'نظام رقمي متكامل',
        'دقة تصوير عالية الدقة',
        'تقليل جرعة الإشعاع',
        'شاشة عرض 15 بوصة'
    ],
    description: 'جهاز الأشعة السينية XRAY يوفر صورًا عالية الدقة مع تقليل جرعة الإشعاع للمريض، مما يجعله خيارًا آمنًا وفعالًا.'
}, {
    name: 'جهاز قياس السكر BG meter',
    price: 40000,
    image: 'https://t3.ftcdn.net/jpg/02/62/45/22/360_F_262452236_7o2L1GJUiLwa561qwaJ1cvWv5vkIirKf.jpg',
    rating: 4,
    ratingCount: 18,
    category: 'diagnostic',
    year: 2023,
    country: 'الولايات المتحدة',
    features: [
        'للأقسام: الغدد الصماء، العيادات، المنزلية',
        'نتائج في 5 ثواني',
        'ذاكرة تخزين 500 قراءة',
        'شاشة LCD كبيرة',
        'يتطلب كمية دم صغيرة'
    ],
    description: 'جهاز قياس السكر BG meter سريع ودقيق، مع ذاكرة كبيرة لتخزين القراءات وشاشة واضحة وسهلة القراءة.'
}, {
    name: 'جهاز المفراز EBS',
    price: 400000,
    image: 'https://images.newscientist.com/wp-content/uploads/2023/12/14152757/SEI_184072268.jpg',
    rating: 4.2,
    ratingCount: 15,
    category: 'lab',
    year: 2022,
    country: 'سويسرا',
    features: [
        'للأقسام: المختبرات، التحاليل',
        'تحليل سريع ودقيق',
        'شاشة ملونة عالية الوضوح',
        'طباعة النتائج تلقائياً',
        'ذاكرة كبيرة للنتائج'
    ],
    description: 'جهاز المفراز EBS مصمم لتحليل العينات بدقة عالية وسرعة في النتائج، مناسب للاستخدام في المختبرات الطبية.'
}, {
    name: 'جهاز التنفس الاصطناعي VENT',
    price: 1200000,
    image: 'https://img.freepik.com/premium-photo/medical-ventilator-machine-hospital-ai-generated_647016-1534.jpg',
    rating: 4.8,
    ratingCount: 28,
    category: 'treatment',
    year: 2023,
    country: 'ألمانيا',
    features: [
        'للأقسام: العناية المركزة، الطوارئ',
        'نظام تنفس متقدم',
        'شاشة مراقبة شاملة',
        'تنبيهات ذكية',
        'نظام إنذار متطور'
    ],
    description: 'جهاز التنفس الاصطناعي VENT يوفر دعمًا تنفسيًا متقدمًا مع مراقبة مستمرة ونظام إنذار ذكي لضمان سلامة المريض.'
}, {
    name: 'جهاز الموجات فوق الصوتية ULTRASOUND',
    price: 800000,
    image: 'https://img.freepik.com/premium-photo/doctor-using-ultrasound-machine-modern-clinic_357257-1063.jpg',
    rating: 4.6,
    ratingCount: 35,
    category: 'imaging',
    year: 2023,
    country: 'الولايات المتحدة',
    features: [
        'للأقسام: النسائية، القلب، الباطنية',
        'تصوير ثلاثي ورباعي الأبعاد',
        'دقة عالية في الصور',
        'سهولة في الاستخدام',
        'ذاكرة للتخزين'
    ],
    description: 'جهاز الموجات فوق الصوتية ULTRASOUND يوفر تصويرًا طبيًا عالي الجودة مع إمكانيات تصوير ثلاثية ورباعية الأبعاد.'
}];

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    initializeEventListeners();
    enableFeaturedCardsModal();
    enableSpecialtyCardsBehavior();
    assignDoctorsToSpecialtyProducts();
    injectDoctorBadgeStyles();
    updateCartDisplay();
    updateMaxPriceDisplay();
});

// عرض المنتجات
function displayProducts(filteredProducts = products) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    filteredProducts.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsGrid.appendChild(productCard);
    });
    
    // إضافة تأثيرات الحركة
    animateElements();
}

// إنشاء بطاقة المنتج
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="product-badge">جديد</div>
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-meta">
                <span class="product-country">${product.country}</span>
                <span class="product-year">${product.year}</span>
            </div>
            <div class="rating">
                <div class="stars product-card-stars" data-index="${index}">
                    ${generateStars(product.rating)}
                </div>
                <span class="rating-count">(${product.ratingCount} تقييم)</span>
            </div>
            <div class="product-price">${formatPrice(product.price)} دينار</div>
            <div class="product-actions">
                <button class="btn btn-primary btn-sm" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    <i class="fas fa-cart-plus"></i> إضافة للسلة
                </button>
                <button class="btn-icon" onclick="toggleProductDetails(this)">
                    <i class="fas fa-info-circle"></i>
                </button>
            </div>
            <div class="product-details">
                <p>${product.description}</p>
                <h4>المميزات الرئيسية:</h4>
                <ul>
                    ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    // إضافة مستمع للعرض المكبر
    card.querySelector('.product-image').addEventListener('click', () => showProductModal(product));

    // نجوم تفاعلية على البطاقة نفسها
    const starsContainer = card.querySelector('.product-card-stars');
    if (starsContainer) {
        // أنشئ 5 نجوم ثابتة وتعامل مع الحالة دون تغيير innerHTML لاحقاً
        starsContainer.innerHTML = '';
        const starsEls = [];
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            star.style.cursor = 'pointer';
            starsContainer.appendChild(star);
            starsEls.push(star);
            star.addEventListener('mouseenter', () => {
                starsEls.forEach((s, si) => { s.className = si <= i ? 'fas fa-star' : 'far fa-star'; });
            });
            star.addEventListener('mouseleave', () => {
                applyStarsFromRatingOnCard(starsEls, product.rating);
            });
            star.addEventListener('click', () => {
                const value = i + 1;
                const currentTotal = product.rating * product.ratingCount;
                product.ratingCount += 1;
                product.rating = parseFloat(((currentTotal + value) / product.ratingCount).toFixed(1));
                // حدث النجوم والعداد على البطاقة مباشرة
                applyStarsFromRatingOnCard(starsEls, product.rating);
                const countSpan = card.querySelector('.rating-count');
                if (countSpan) countSpan.textContent = `(${product.ratingCount} تقييم)`;
                showToast('شكراً لتقييمك!', 'success');
            });
        }
        // طبق حالة التقييم الحالية
        applyStarsFromRatingOnCard(starsEls, product.rating);
    }
    
    return card;
}

// توليد النجوم
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-stroke"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// نجوم تفاعلية داخل نافذة المنتج
function setupModalRating(product) {
    const container = document.getElementById('modal-product-rating');
    if (!container) return;
    container.innerHTML = '';
    container.classList.add('interactive');

    const starsEls = [];
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = 'far fa-star';
        star.dataset.value = String(i);
        star.style.cursor = 'pointer';
        star.addEventListener('mouseenter', () => highlight(starsEls, i));
        star.addEventListener('mouseleave', () => highlightToRating(starsEls, product.rating));
        star.addEventListener('click', () => rateProduct(product, i, starsEls));
        container.appendChild(star);
        starsEls.push(star);
    }
    // عرض الحالة الحالية
    highlightToRating(starsEls, product.rating);
}

function highlight(starsEls, upto) {
    starsEls.forEach((el, idx) => {
        el.className = idx < upto ? 'fas fa-star' : 'far fa-star';
    });
}

function highlightToRating(starsEls, rating) {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    starsEls.forEach((el, idx) => {
        if (idx < full) el.className = 'fas fa-star';
        else if (idx === full && hasHalf) el.className = 'fas fa-star-half-stroke';
        else el.className = 'far fa-star';
    });
}

// تطبيق النجوم على بطاقة المنتج وفق التقييم (يدعم نصف نجمة)
function applyStarsFromRatingOnCard(starsEls, rating) {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    starsEls.forEach((el, idx) => {
        if (idx < full) el.className = 'fas fa-star';
        else if (idx === full && hasHalf) el.className = 'fas fa-star-half-stroke';
        else el.className = 'far fa-star';
    });
}

function rateProduct(product, value, starsEls) {
    const currentTotal = product.rating * product.ratingCount;
    const newCount = product.ratingCount + 1;
    const newAvg = (currentTotal + value) / newCount;
    product.ratingCount = newCount;
    product.rating = parseFloat(newAvg.toFixed(1));

    // تحديث عرض النجوم والعداد في النافذة
    highlightToRating(starsEls, product.rating);
    const countEl = document.getElementById('modal-rating-count');
    if (countEl) countEl.textContent = `(${product.ratingCount} تقييم)`;

    // تحديث السعر/العرض في الشبكة بإعادة العرض
    displayProducts();
    showToast('شكراً لتقييمك!', 'success');
}

// تهيئة مستمعي الأحداث
function initializeEventListeners() {
    // أحداث سلة التسوق
    if (cartToggle) {
        cartToggle.addEventListener('click', toggleCart);
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', closeCartModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeAllModals);
    }
    
    // زر إتمام الشراء
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedCheckout);
    }
    
    // ربط أزرار "أضف للسلة" على مستوى الوثيقة لكل الأقسام
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.add-to-cart, .btn-add-cart');
        if (!btn) return;
        const card = btn.closest('.product-card');
        if (!card) return;
        const product = buildProductFromCard(card);
        if (product) addToCart(product);
    });
    
    // أحداث المصادقة
    if (userIcon) {
        userIcon.addEventListener('click', toggleAuthModal);
    }
    
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', closeAuthModalFunc);
    }
    
    // أحداث النوافذ المنبثقة
    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }
    
    if (modalAddToCart) {
        modalAddToCart.addEventListener('click', addCurrentProductToCart);
    }
    
    // أحداث الفلاتر
    if (filterToggle) {
        filterToggle.addEventListener('click', toggleFilterPopup);
    }
    
    if (closeFilter) {
        closeFilter.addEventListener('click', closeFilterPopup);
    }
    
    if (priceRange) {
        priceRange.addEventListener('input', updateMaxPriceDisplay);
    }
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // أحداث التبويبات
    authTabs.forEach(tab => {
        tab.addEventListener('click', switchAuthTab);
    });
    
    // أحداث طرق الدفع
    paymentMethods.forEach(method => {
        method.addEventListener('change', toggleCreditCardDetails);
    });
    
    // إغلاق النوافذ بـ ESC
    document.addEventListener('keydown', handleKeydown);
    
    // تمرير ناعم للروابط
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', smoothScroll);
    });
    
    // تأثيرات التمرير
    window.addEventListener('scroll', handleScroll);
}

// بناء كائن المنتج من بطاقة HTML (عام لكل الأقسام)
function buildProductFromCard(card) {
    try {
        const name = (card.querySelector('.product-title')?.textContent || card.querySelector('h4')?.textContent || 'منتج').trim();
        const image = card.querySelector('.product-image img')?.getAttribute('src') || '';
        const priceText = (card.querySelector('.current-price, .product-price')?.textContent || '0');
        const price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        const rating = card.querySelectorAll('.stars i.fas').length || 5;
        const ratingCountText = card.querySelector('.rating-count')?.textContent || '(0)';
        const ratingCount = parseInt(ratingCountText.replace(/[^\d]/g, '')) || 0;
        const description = card.querySelector('.product-description, .product-info p')?.textContent?.trim() || '';
        const category = card.closest('.featured-products-section') ? 'featured' : (card.closest('.specialty-products') ? 'specialty' : 'general');
        return { name, image, price, rating, ratingCount, description, category, year: new Date().getFullYear(), country: 'غير محدد', features: [] };
    } catch (err) {
        console.error('تعذر بناء المنتج من البطاقة:', err);
        showToast('تعذر إضافة المنتج، حاول مرة أخرى', 'error');
        return null;
    }
}

// إضافة منتج للسلة
function addToCart(product) {
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    updateCartDisplay();
    try { localStorage.setItem('cart', JSON.stringify(cart)); } catch {}
    showToast('تم إضافة المنتج للسلة', 'success');
    pulseCartIcon();
}

// إضافة المنتج الحالي للنافذة المنبثقة
function addCurrentProductToCart() {
    if (currentProduct) {
        addToCart(currentProduct);
        closeProductModal();
    }
}

// إزالة منتج من السلة
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    showToast('تم إزالة المنتج من السلة', 'success');
}

// تحديث عرض السلة
function updateCartDisplay() {
    if (!cartBody || !cartTotalPrice || !cartCount) return;
    
    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div class="empty-cart-message" style="text-align: center; padding: 40px 0;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ddd; margin-bottom: 15px;"></i>
                <p>سلة التسوق فارغة</p>
            </div>
        `;
        cartTotalPrice.textContent = '0 دينار';
        cartCount.textContent = '0';
        try { localStorage.setItem('cart', JSON.stringify(cart)); } catch {}
        return;
    }
    
    cartBody.innerHTML = '';
    total = 0;
    
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)} دينار</div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i> إزالة
                    </button>
                </div>
            </div>
        `;
        
        cartBody.appendChild(cartItem);
    });
    
    cartTotalPrice.textContent = formatPrice(total) + ' دينار';
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    try { localStorage.setItem('cart', JSON.stringify(cart)); } catch {}
}

// تحديث الكمية
function updateQuantity(index, change) {
    const item = cart[index];
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(index);
    } else {
        updateCartDisplay();
    }
}

// تنسيق السعر
function formatPrice(price) {
    return new Intl.NumberFormat('ar-IQ').format(price);
}

// تبديل عرض السلة
function toggleCart() {
    if (cartModal) {
        cartModal.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

// إغلاق نافذة السلة
function closeCartModal() {
    if (cartModal) {
        cartModal.classList.remove('open');
        overlay.classList.remove('active');
    }
}

// تبديل نافذة المصادقة
function toggleAuthModal() {
    if (authModal) {
        authModal.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

// إغلاق نافذة المصادقة
function closeAuthModalFunc() {
    if (authModal) {
        authModal.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// تبديل تبويبات المصادقة
function switchAuthTab(e) {
    const targetTab = e.target.dataset.tab;
    
    authTabs.forEach(tab => tab.classList.remove('active'));
    authForms.forEach(form => form.classList.remove('active'));
    
    e.target.classList.add('active');
    document.getElementById(`${targetTab}-form`).classList.add('active');
}

// تبديل تفاصيل بطاقة المنتج
function toggleProductDetails(button) {
    const card = button.closest('.product-card');
    const details = card.querySelector('.product-details');
    const icon = button.querySelector('i');
    
    if (details.style.display === 'block') {
        details.style.display = 'none';
        icon.className = 'fas fa-info-circle';
    } else {
        details.style.display = 'block';
        icon.className = 'fas fa-chevron-up';
    }
}

// عرض نافذة المنتج المكبرة
function showProductModal(product) {
    currentProduct = product;
    
    if (productModal) {
        document.getElementById('modal-product-title').textContent = product.name;
        document.getElementById('modal-product-image').src = product.image;
        setupModalRating(product);
        document.getElementById('modal-rating-count').textContent = `(${product.ratingCount} تقييم)`;
        document.getElementById('modal-product-price').textContent = formatPrice(product.price) + ' دينار';
        document.getElementById('modal-product-description').textContent = product.description;
        
        const featuresList = document.getElementById('modal-product-features');
        featuresList.innerHTML = product.features.map(feature => `<li>${feature}</li>`).join('');
        
        productModal.classList.add('active');
        overlay.classList.add('active');
    }
}

// إغلاق نافذة المنتج المكبرة
function closeProductModal() {
    if (productModal) {
        productModal.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// تبديل نافذة الفلاتر
function toggleFilterPopup() {
    if (filterPopup) {
        filterPopup.classList.toggle('active');
    }
}

// إغلاق نافذة الفلاتر
function closeFilterPopup() {
    if (filterPopup) {
        filterPopup.classList.remove('active');
    }
}

// تحديث عرض السعر الأقصى
function updateMaxPriceDisplay() {
    if (maxPriceDisplay && priceRange) {
        const value = parseInt(priceRange.value);
        maxPriceDisplay.textContent = formatPrice(value) + ' دينار';
    }
}

// تطبيق الفلاتر
function applyFilters() {
    const maxPrice = parseInt(priceRange.value);
    const selectedCategories = Array.from(categoryFilters)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    let filtered = products.filter(product => 
        product.price <= maxPrice && 
        selectedCategories.includes(product.category)
    );
    
    // ترتيب المنتجات
    const sortValue = sortBy.value;
    switch (sortValue) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            filtered.sort((a, b) => b.year - a.year);
            break;
    }
    
    displayProducts(filtered);
    closeFilterPopup();
    showToast('تم تطبيق الفلاتر', 'success');
}

// إعادة تعيين الفلاتر
function resetFilters() {
    if (priceRange) {
        priceRange.value = 5000000;
        updateMaxPriceDisplay();
    }
    
    categoryFilters.forEach(cb => cb.checked = true);
    if (sortBy) {
        sortBy.value = 'default';
    }
    
    displayProducts();
    closeFilterPopup();
    showToast('تم إعادة تعيين الفلاتر', 'success');
}

// تبديل تفاصيل بطاقة الائتمان
function toggleCreditCardDetails() {
    const creditCardMethod = document.querySelector('input[name="payment-method"][value="credit-card"]');
    if (creditCardDetails && creditCardMethod) {
        if (creditCardMethod.checked) {
            creditCardDetails.classList.add('active');
        } else {
            creditCardDetails.classList.remove('active');
        }
    }
}

// إغلاق جميع النوافذ المنبثقة
function closeAllModals() {
    closeCartModal();
    closeAuthModalFunc();
    closeProductModal();
    closeFilterPopup();
}

// معالجة الضغط على المفاتيح
function handleKeydown(e) {
    if (e.key === 'Escape') {
        closeAllModals();
    }
}

// تمرير ناعم
function smoothScroll(e) {
    e.preventDefault();
    const target = document.querySelector(e.target.getAttribute('href'));
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// معالجة التمرير
function handleScroll() {
    const sections = document.querySelectorAll('.section');
    const windowHeight = window.innerHeight;
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        
        if (sectionTop < windowHeight - 100) {
            section.classList.add('visible');
        }
    });
}

// إضافة تأثيرات الحركة
function animateElements() {
    const elements = document.querySelectorAll('.product-card');
    
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// عرض رسالة تنبيه
function showToast(message, type = 'success') {
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// تأثير نبض على أيقونة السلة
function pulseCartIcon() {
    if (cartToggle) {
        cartToggle.classList.add('pulse-effect');
        setTimeout(() => {
            cartToggle.classList.remove('pulse-effect');
        }, 500);
    }
}

// إتمام الشراء (بدون نموذج طلب)
function proceedCheckout() {
    if (cart.length === 0) {
        showToast('السلة فارغة', 'error');
        return;
    }
    // حفظ الحالة لضمان تزامن النافذة
    try { localStorage.setItem('cart', JSON.stringify(cart)); } catch {}

    // محاولة فتح نافذة الدفع المنبثقة داخل الصفحة
    const modal = document.getElementById('checkout-modal');
    const overlayEl = document.getElementById('overlay');
    const itemsEl = document.getElementById('checkout-items');
    const itemsCountEl = document.getElementById('checkout-items-count');
    const totalEl = document.getElementById('checkout-total');

    if (modal && itemsEl && itemsCountEl && totalEl) {
        // توليد الملخص
        itemsEl.innerHTML = '';
        let c = 0, t = 0;
        cart.forEach(it => {
            const q = it.quantity || 1;
            c += q; t += (it.price || 0) * q;
            const row = document.createElement('div');
            row.className = 'checkout-item';
            row.innerHTML = `
                <img src="${it.image || ''}" alt="${it.name || ''}" />
                <div><h4>${it.name || ''}</h4><div class="muted">الكمية: ${q}</div></div>
                <div style="font-weight:700; color:#6a11cb;">${new Intl.NumberFormat('ar-IQ').format(it.price || 0)} دينار</div>
            `;
            itemsEl.appendChild(row);
        });
        itemsCountEl.textContent = String(c);
        totalEl.textContent = new Intl.NumberFormat('ar-IQ').format(t) + ' دينار';

        modal.classList.add('active');
        if (overlayEl) overlayEl.classList.add('active');
        return;
    }

    // في حال عدم وجود النافذة ضمن الصفحة، نلجأ للانتقال
    window.location.href = 'checkout.html';
}

// إرسال الطلب
function submitOrder(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        showToast('السلة فارغة', 'error');
        return;
    }
    
    // هنا يمكن إضافة كود إرسال الطلب إلى الخادم
    const formData = new FormData(orderForm);
    const orderData = Object.fromEntries(formData);
    orderData.items = cart;
    orderData.total = total;
    
    console.log('بيانات الطلب:', orderData);
    
    showToast('تم إرسال الطلب بنجاح! سنتواصل معك قريباً', 'success');
    
    // مسح السلة
    cart = [];
    updateCartDisplay();
    
    // إغلاق النوافذ
    closeAllModals();
    
    // إعادة تعيين النموذج
    orderForm.reset();
}

// عرض المنتجات المميزة في الصفحة الرئيسية
function displayFeaturedProducts() {
    if (!document.getElementById('featured-products')) return;
    
    const featuredProducts = products.slice(0, 4);
    const container = document.getElementById('featured-products');
    container.innerHTML = '';
    
    featuredProducts.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        container.appendChild(productCard);
    });
    
    animateElements();
}

// تحديث عداد الوقت للعروض المحدودة
function updateCountdown() {
    // تاريخ انتهاء العرض (أسبوع من الآن)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);
    endDate.setHours(23, 59, 59, 999);
    
    const now = new Date().getTime();
    const distance = endDate.getTime() - now;
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    
    if (distance < 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minutesEl) minutesEl.textContent = '00';
        if (secondsEl) secondsEl.textContent = '00';
    }
}

// أحداث تسجيل الدخول وإنشاء حساب
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // هنا يمكنك إضافة كود تسجيل الدخول
    showToast('تم تسجيل الدخول بنجاح', 'success');
    authModal.classList.remove('active');
    overlay.classList.remove('active');
});

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // هنا يمكنك إضافة كود إنشاء الحساب
    showToast('تم إنشاء الحساب بنجاح', 'success');
    authModal.classList.remove('active');
    overlay.classList.remove('active');
});

// تهيئة تفاصيل المنتج
document.querySelectorAll('.product-details').forEach(details => {
    details.style.display = 'none';
});

// دالة عدادات الإحصائيات
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.textContent);
                let current = 0;
                const increment = target / 50;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

// دالة تحسين نموذج الاتصال
function enhanceContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // جمع البيانات
            const name = document.getElementById('contact-name')?.value;
            const email = document.getElementById('contact-email')?.value;
            const phone = document.getElementById('contact-phone')?.value;
            const subject = document.getElementById('contact-subject')?.value;
            const message = document.getElementById('contact-message')?.value;
            
            // التحقق من البيانات
            if (!name || !email || !phone || !subject || !message) {
                showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
                return;
            }
            
            // التحقق من صحة البريد الإلكتروني
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
                return;
            }
            
            // محاكاة إرسال الرسالة
            showToast('تم إرسال رسالتك بنجاح! سنتواصل معك خلال 24 ساعة', 'success');
            
            // إعادة تعيين النموذج
            this.reset();
        });
    }
}

// دالة تحسين الأسئلة الشائعة
function enhanceFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // إغلاق جميع الأسئلة
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // فتح السؤال المحدد إذا لم يكن مفتوحاً
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

// دالة تأثير الموجة للزر
function addRippleEffect() {
    document.querySelectorAll('.ripple-effect').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// إضافة أنيميشن الموجة إلى CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// تفعيل النافذة المنبثقة للمنتجات المميزة (الثابتة في HTML)
function enableFeaturedCardsBehaviorForCard(card) {
    const imgEl = card.querySelector('.product-image img');
    if (!imgEl) return;
    const name = (card.querySelector('.product-title')?.textContent || card.querySelector('h4')?.textContent || 'منتج').trim();

    // قراءة السعر والوصف الابتدائي
    const priceText = card.querySelector('.current-price, .product-price')?.textContent || '0';
    const initialPrice = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
    const descText = card.querySelector('.product-description, .product-info p')?.textContent?.trim() || 'منتج ضمن قسم التخصصات.';

    // عناصر التقييم (إن لم توجد، ننشئها)
    let ratingWrapper = card.querySelector('.product-rating');
    let starsContainer = card.querySelector('.product-rating .stars, .stars');
    let countTextNode = card.querySelector('.rating-count');
    if (!ratingWrapper) {
        ratingWrapper = document.createElement('div');
        ratingWrapper.className = 'product-rating';
        starsContainer = document.createElement('div');
        starsContainer.className = 'stars';
        countTextNode = document.createElement('span');
        countTextNode.className = 'rating-count';
        countTextNode.style.marginRight = '8px';
        const info = card.querySelector('.product-info');
        if (info) {
            info.insertBefore(ratingWrapper, info.querySelector('.product-price'));
        } else {
            card.appendChild(ratingWrapper);
        }
        ratingWrapper.appendChild(starsContainer);
        ratingWrapper.appendChild(countTextNode);
    }

    // تهيئة مخزن التقييم إن لم يكن موجوداً
    if (!specialtyRatings[name]) {
        specialtyRatings[name] = { rating: 5, ratingCount: 0, price: initialPrice, description: descText };
    }

    // تفعيل فتح النافذة عند الضغط على الصورة
    imgEl.style.cursor = 'pointer';
    imgEl.addEventListener('click', () => {
        const { rating, ratingCount, price, description } = specialtyRatings[name];
        const image = imgEl.getAttribute('src');
        const product = {
            name,
            image,
            price,
            rating,
            ratingCount,
            category: 'specialty',
            year: new Date().getFullYear(),
            country: 'غير محدد',
            features: ['مخصص للتخصص', 'موثوق', 'اختيار شائع'],
            description
        };
        showProductModal(product);
    });

    // نجوم تفاعلية للبطاقة
    if (starsContainer) {
        starsContainer.innerHTML = '';
        const starsEls = [];
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            star.style.cursor = 'pointer';
            starsContainer.appendChild(star);
            starsEls.push(star);
            star.addEventListener('mouseenter', () => {
                starsEls.forEach((s, si) => { s.className = si <= i ? 'fas fa-star' : 'far fa-star'; });
            });
            star.addEventListener('mouseleave', () => {
                applyStarsFromRatingOnCard(starsEls, specialtyRatings[name].rating);
            });
            star.addEventListener('click', () => {
                const value = i + 1;
                const { rating, ratingCount } = specialtyRatings[name];
                const currentTotal = rating * ratingCount;
                const newCount = ratingCount + 1;
                const newAvg = (currentTotal + value) / newCount;
                specialtyRatings[name].rating = parseFloat(newAvg.toFixed(1));
                specialtyRatings[name].ratingCount = newCount;
                applyStarsFromRatingOnCard(starsEls, specialtyRatings[name].rating);
                if (countTextNode) countTextNode.textContent = `(${specialtyRatings[name].ratingCount} تقييم)`;
                showToast('شكراً لتقييمك!', 'success');
            });
        }
        applyStarsFromRatingOnCard(starsEls, specialtyRatings[name].rating);
        if (countTextNode) countTextNode.textContent = `(${specialtyRatings[name].ratingCount} تقييم)`;
    }
}

function enableSpecialtyCardsBehavior() {
    const specialtyCards = document.querySelectorAll('.specialty-products .product-card');
    specialtyCards.forEach(card => enableFeaturedCardsBehaviorForCard(card));
}

// إضافة شارة اسم الدكتور لكل بطاقة في قسم التخصصات وتمرير الاسم للنافذة
function assignDoctorsToSpecialtyProducts() {
    const specialtyCards = document.querySelectorAll('.specialty-products .product-card');
    specialtyCards.forEach(card => {
        const titleEl = card.querySelector('.product-info h4, h4');
        const name = titleEl?.textContent?.trim() || '';
        if (!name) return;
        const doctorName = doctorAssignments[name] || guessDoctorFromSpecialty(card) || 'د. غير محدد';
        // احفظ الاسم ضمن بيانات البطاقة لاستخدامه لاحقاً
        card.dataset.doctorName = doctorName;
        // أنشئ/حدّث الشارة
        let badge = card.querySelector('.doctor-assigned');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'doctor-assigned';
            const info = card.querySelector('.product-info') || card;
            info.appendChild(badge);
        }
        badge.textContent = doctorName;
        // عند فتح النافذة، أضف اسم الدكتور للمميزات
        const imgEl = card.querySelector('.product-image img');
        if (imgEl) {
            imgEl.addEventListener('click', () => {
                const doctor = card.dataset.doctorName || doctorName;
                // إذا كانت نافذة المنتج معروضة، أضف ميزة الدكتور (يتم حقنها في showProductModal عبر description/features)
                const featuresList = document.getElementById('modal-product-features');
                if (featuresList) {
                    // أضف سطر الطبيب أعلى القائمة عند الفتح التالي بعد تعبئة showProductModal
                    setTimeout(() => {
                        if (!featuresList.querySelector('.doctor-feature')) {
                            const li = document.createElement('li');
                            li.className = 'doctor-feature';
                            li.textContent = `مخصص لـ ${doctor}`;
                            featuresList.insertBefore(li, featuresList.firstChild);
                        }
                    }, 0);
                }
            });
        }
    });
}

function guessDoctorFromSpecialty(card) {
    // استنتاج من عنوان قسم التخصص المحيط
    const section = card.closest('.specialty-section');
    const header = section?.querySelector('h3')?.textContent || '';
    if (header.includes('الأشعة')) return 'د. أحمد – اختصاص أشعة';
    if (header.includes('القلب')) return 'د. حسين – اختصاص قلب';
    if (header.includes('المختبر')) return 'د. سارة – اختصاص مختبر';
    return null;
}

function injectDoctorBadgeStyles() {
    if (document.getElementById('doctor-badge-style')) return;
    const style = document.createElement('style');
    style.id = 'doctor-badge-style';
    style.textContent = `
        .doctor-assigned {
            margin-top: 8px;
            background: rgba(106, 17, 203, 0.08);
            color: #4a0a9a;
            border: 1px solid rgba(106, 17, 203, 0.25);
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 0.85rem;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
}

function enableFeaturedCardsModal() {
    const featuredCards = document.querySelectorAll('.featured-products-section .product-card');
    featuredCards.forEach(card => {
        const imgEl = card.querySelector('.product-image img');
        if (!imgEl) return;
        const name = card.querySelector('.product-title')?.textContent?.trim() || 'منتج';

        // قراءة السعر والتقييم الابتدائي
        const priceText = card.querySelector('.current-price')?.textContent || '0';
        const initialPrice = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
        const countTextNode = card.querySelector('.rating-count');
        const initialCount = parseInt((countTextNode?.textContent || '(0)').replace(/[^\d]/g, '')) || 0;
        const initialRating = card.querySelectorAll('.stars i.fas').length || 5;

        // تهيئة مخزن التقييم إن لم يكن موجوداً
        if (!featuredRatings[name]) {
            featuredRatings[name] = { rating: initialRating, ratingCount: initialCount, price: initialPrice };
        }

        // تفعيل فتح النافذة عند الضغط على الصورة
        imgEl.style.cursor = 'pointer';
        imgEl.addEventListener('click', () => {
            const { rating, ratingCount, price } = featuredRatings[name];
            const image = imgEl.getAttribute('src');
            const product = {
                name,
                image,
                price,
                rating,
                ratingCount,
                category: 'featured',
                year: new Date().getFullYear(),
                country: 'غير محدد',
                features: ['مميز', 'عالي الجودة', 'عرض خاص'],
                description: card.querySelector('.product-description')?.textContent?.trim() || 'منتج مميز من تشكيلتنا.'
            };
            showProductModal(product);
        });

        // تفعيل نجوم تفاعلية في البطاقة
        const starsContainer = card.querySelector('.product-rating .stars, .stars');
        if (starsContainer) {
            // أنشئ 5 نجوم ثابتة وتطبيق الحالة من المخزن
            starsContainer.innerHTML = '';
            const starsEls = [];
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('i');
                star.style.cursor = 'pointer';
                starsContainer.appendChild(star);
                starsEls.push(star);
                star.addEventListener('mouseenter', () => {
                    starsEls.forEach((s, si) => { s.className = si <= i ? 'fas fa-star' : 'far fa-star'; });
                });
                star.addEventListener('mouseleave', () => {
                    applyStarsFromRatingOnCard(starsEls, featuredRatings[name].rating);
                });
                star.addEventListener('click', () => {
                    const value = i + 1;
                    const { rating, ratingCount } = featuredRatings[name];
                    const currentTotal = rating * ratingCount;
                    const newCount = ratingCount + 1;
                    const newAvg = (currentTotal + value) / newCount;
                    featuredRatings[name].rating = parseFloat(newAvg.toFixed(1));
                    featuredRatings[name].ratingCount = newCount;
                    applyStarsFromRatingOnCard(starsEls, featuredRatings[name].rating);
                    if (countTextNode) countTextNode.textContent = `(${featuredRatings[name].ratingCount} تقييم)`;
                    showToast('شكراً لتقييمك!', 'success');
                });
            }
            applyStarsFromRatingOnCard(starsEls, featuredRatings[name].rating);
        }
    });
}

// تهيئة جميع التحسينات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تشغيل عدادات الإحصائيات
    setTimeout(animateCounters, 500);
    
    // تحسين نموذج الاتصال
    enhanceContactForm();
    
    // تحسين الأسئلة الشائعة
    enhanceFAQ();
    
    // إضافة تأثير الموجة
    addRippleEffect();
});