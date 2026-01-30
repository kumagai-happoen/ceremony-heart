// ステップ定義
const steps = [
    { id: 1, name: 'プラン', category: 'plan', required: true },
    { id: 2, name: '棺', category: 'casket_only', required: true },
    { id: 3, name: '祭壇', category: 'altar', required: true },
    { id: 4, name: '供花・供物', category: 'flower', required: true },
    { id: 5, name: 'お食事', category: 'service', required: false },
    { id: 6, name: 'その他', category: 'other', required: false }
];

// 商品データ（kintoneから取得後に上書きされる）
let products = [];

// カート状態管理
let cart = [];
let currentStepIndex = 0;

// DOM要素
const stepIndicator = document.getElementById('stepIndicator');
const stepTitle = document.getElementById('stepTitle');
const productsGrid = document.getElementById('productsGrid');
const cartItemsContainer = document.getElementById('cartItems');
const cartSummary = document.getElementById('cartSummary');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnCreateQuote = document.getElementById('btnCreateQuote');

// 初期化
async function init() {
    // ローディング表示
    showLoading();
    
    try {
        // kintoneから商品データを取得
        // initializeProducts関数はkintone-api.jsで定義されている
        if (typeof initializeProducts === 'function') {
            products = await initializeProducts(true);
            console.log('商品データを読み込みました:', products.length, '件');
        } else {
            console.warn('kintone-api.jsが読み込まれていません。固定データを使用します。');
            products = getDefaultProducts();
        }
        
        // UIを初期化
        renderStepIndicator();
        renderCurrentStep();
        updateCart();
        setupEventListeners();
        
    } catch (error) {
        console.error('初期化エラー:', error);
        alert('商品データの読み込みに失敗しました。ページを再読み込みしてください。');
    } finally {
        hideLoading();
    }
}

// ローディング表示
function showLoading() {
    const loadingHtml = `
        <div id="loadingOverlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        ">
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                <div style="font-size: 1.2rem; color: #4A5568;">商品データを読み込んでいます...</div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHtml);
}

// ローディング非表示
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// デフォルト商品データ（フォールバック用）
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: '一般葬プラン',
            description: '通夜・告別式を含む伝統的な葬儀',
            price: 580000,
            category: 'plan',
            emoji: '🏛️'
        },
        {
            id: 2,
            name: '家族葬プラン',
            description: 'ご家族・親族中心の小規模葬儀',
            price: 420000,
            category: 'plan',
            emoji: '🏠'
        },
        {
            id: 3,
            name: '一日葬プラン',
            description: '通夜を行わず告別式のみ',
            price: 350000,
            category: 'plan',
            emoji: '⛪'
        }
    ];
}

// イベントリスナー設定
function setupEventListeners() {
    btnPrev.addEventListener('click', goToPrevStep);
    btnNext.addEventListener('click', goToNextStep);
    btnCreateQuote.addEventListener('click', createQuote);
}

// 現在のステップのカテゴリに該当する商品がカートにあるかチェック
function isCurrentStepCompleted() {
    const currentStep = steps[currentStepIndex];
    return cart.some(item => item.category === currentStep.category);
}

// すべての必須ステップが完了しているかチェック
function areAllRequiredStepsCompleted() {
    return steps
        .filter(step => step.required)
        .every(step => cart.some(item => item.category === step.category));
}

// ステップインジケーター表示
function renderStepIndicator() {
    stepIndicator.innerHTML = `
        <div class="step-indicator-content">
            ${steps.map((step, index) => {
                const isCompleted = cart.some(item => item.category === step.category);
                const isActive = index === currentStepIndex;
                const classes = ['step-item'];
                if (isCompleted) classes.push('completed');
                if (isActive) classes.push('active');
                
                return `
                    <div class="${classes.join(' ')}" data-step="${index}">
                        <div class="step-number">${isCompleted ? '✓' : step.id}</div>
                        <div class="step-label">${step.name}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 現在のステップを表示
function renderCurrentStep() {
    const currentStep = steps[currentStepIndex];
    const requiredText = currentStep.required ? '（必須・1つ選択）' : '（任意・複数選択可）';
    stepTitle.textContent = `ステップ${currentStep.id}: ${currentStep.name}を選択 ${requiredText}`;
    
    // ナビゲーションボタンの表示制御
    btnPrev.style.display = currentStepIndex > 0 ? 'block' : 'none';
    
    // 次へボタンの表示と有効化制御
    if (currentStepIndex < steps.length - 1) {
        btnNext.style.display = 'block';
        // 必須ステップの場合は選択が必須
        if (currentStep.required) {
            btnNext.disabled = !isCurrentStepCompleted();
        } else {
            btnNext.disabled = false;
        }
    } else {
        btnNext.style.display = 'none';
    }
    
    // 商品を表示
    const filteredProducts = products.filter(p => p.category === currentStep.category);
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #718096;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                <div>このカテゴリには商品がありません</div>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        const isSelected = cart.some(item => item.id === product.id);
        
        // 画像表示の決定: imageUrlがあれば画像、なければNO IMAGE
        const imageContent = product.imageUrl 
            ? `<img src="${product.imageUrl}" alt="${product.name}" width="100%" height="180" class="product-image-img" onerror="this.style.display='none'; this.parentElement.querySelector('.product-no-image').style.display='flex';">
               <div class="product-no-image" style="display: none;">NO IMAGE</div>`
            : `<div class="product-no-image">NO IMAGE</div>`;
        
        return `
            <div class="product-card ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
                <div class="product-image">
                    ${imageContent}
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">${product.description}</div>
                    <div class="product-footer">
                        <div class="product-price">¥${product.price.toLocaleString()}</div>
                        <button class="btn-add ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
                            ${isSelected ? '選択中' : '選択'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 追加ボタンにイベントリスナーを設定
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(btn.dataset.productId);
            toggleProduct(productId);
        });
    });

    // カード全体のクリックイベント
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = parseInt(card.dataset.productId);
            toggleProduct(productId);
        });
    });
}

// 商品の選択/解除を切り替え
function toggleProduct(productId) {
    const product = products.find(p => p.id === productId);
    const currentStep = steps[currentStepIndex];
    
    // 必須ステップの場合、同じカテゴリの他の商品を削除（単一選択）
    if (currentStep.required) {
        cart = cart.filter(item => item.category !== currentStep.category);
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // すでに選択されている場合は削除
        cart = cart.filter(item => item.id !== productId);
    } else {
        // 新規選択
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
    renderStepIndicator();
    renderCurrentStep();
    
    // フィードバックアニメーション
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('pulse');
        setTimeout(() => cartIcon.classList.remove('pulse'), 400);
    }
}

// 前のステップへ
function goToPrevStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderStepIndicator();
        renderCurrentStep();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 次のステップへ
function goToNextStep() {
    const currentStep = steps[currentStepIndex];
    
    // 必須ステップで未選択の場合は進めない
    if (currentStep.required && !isCurrentStepCompleted()) {
        alert(`${currentStep.name}を選択してください`);
        return;
    }
    
    if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        renderStepIndicator();
        renderCurrentStep();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 数量変更（任意ステップのみ）
function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    const step = steps.find(s => s.category === product.category);
    
    // 必須ステップの場合は数量変更不可
    if (step && step.required) {
        return;
    }
    
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        updateCart();
        renderStepIndicator();
    }
}

// カート表示更新
function updateCart() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">📄</div>
                <div>項目を選択してください</div>
            </div>
        `;
        cartSummary.style.display = 'none';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.id);
            const step = steps.find(s => s.category === product.category);
            const isRequired = step && step.required;
            
            return `
                <div class="cart-item">
                    <div style="font-size: 1.8rem;">${item.emoji}</div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">¥${item.price.toLocaleString()}</div>
                    </div>
                    ${!isRequired ? `
                    <div class="cart-item-controls">
                        <button class="quantity-btn" data-product-id="${item.id}" data-action="decrease">−</button>
                        <div class="quantity-display">${item.quantity}</div>
                        <button class="quantity-btn" data-product-id="${item.id}" data-action="increase">+</button>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // 数量ボタンにイベントリスナーを設定
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.dataset.productId);
                const action = btn.dataset.action;
                const delta = action === 'increase' ? 1 : -1;
                updateQuantity(productId, delta);
            });
        });

        cartSummary.style.display = 'block';
    }

    // 合計計算
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + tax;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // 表示更新
    document.getElementById('subtotal').textContent = subtotal.toLocaleString();
    document.getElementById('tax').textContent = tax.toLocaleString();
    document.getElementById('total').textContent = total.toLocaleString();
    document.getElementById('headerCartCount').textContent = itemCount;
    document.getElementById('headerCartTotal').textContent = total.toLocaleString();
    
    // 確定ボタンの有効化制御
    btnCreateQuote.disabled = !areAllRequiredStepsCompleted();
}

// 見積作成
async function createQuote() {
    if (!areAllRequiredStepsCompleted()) {
        alert('すべての必須項目を選択してください');
        return;
    }

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + tax;
    
    const summary = {
        itemCount,
        subtotal,
        tax,
        total
    };

    try {
        // カートデータをローカルストレージに保存
        localStorage.setItem('quoteCart', JSON.stringify(cart));
        localStorage.setItem('quoteSummary', JSON.stringify(summary));
        
        // kintoneに見積データを保存（オプション）
        if (typeof saveQuoteToKintone === 'function') {
            console.log('kintoneに見積データを保存中...');
            await saveQuoteToKintone(cart, summary);
            alert(`お見積内容をkintoneに保存しました。\n\n選択項目: ${itemCount}件\n合計金額: ¥${total.toLocaleString()}`);
        } else {
            alert(`お見積内容を保存しました。\n\n選択項目: ${itemCount}件\n合計金額: ¥${total.toLocaleString()}\n\n次のステップでお見積書を作成します。`);
        }
        
        console.log('お見積データ:', {
            items: cart,
            summary: summary
        });
        
    } catch (error) {
        console.error('見積保存エラー:', error);
        alert('見積の保存中にエラーが発生しました。ローカルには保存されています。');
    }
}

// 初期化実行
document.addEventListener('DOMContentLoaded', init);
