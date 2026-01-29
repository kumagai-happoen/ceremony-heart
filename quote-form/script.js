// ステップ定義
const steps = [
    { id: 1, name: 'プラン', category: 'plan', required: true },
    { id: 2, name: '棺', category: 'casket_only', required: true },
    { id: 3, name: '祭壇', category: 'altar', required: true },
    { id: 4, name: '供花・供物', category: 'flower', required: true },
    { id: 5, name: '式場サービス', category: 'service', required: false },
    { id: 6, name: 'その他', category: 'other', required: false }
];

// 葬儀関連の商品データ
const products = [
    // プラン
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
    },
    {
        id: 4,
        name: '直葬プラン',
        description: '火葬のみのシンプルなお別れ',
        price: 180000,
        category: 'plan',
        emoji: '🕯️'
    },
    
    // 棺
    {
        id: 5,
        name: '桐製棺（上級）',
        description: '高級桐材を使用した格調高い棺',
        price: 280000,
        category: 'casket_only',
        emoji: '⚰️'
    },
    {
        id: 6,
        name: '檜製棺（特級）',
        description: '最高級檜材の棺',
        price: 450000,
        category: 'casket_only',
        emoji: '⚰️'
    },
    {
        id: 7,
        name: '布張棺（標準）',
        description: '布張り仕上げの棺',
        price: 120000,
        category: 'casket_only',
        emoji: '⚰️'
    },
    
    // 祭壇
    {
        id: 8,
        name: '白木祭壇（中型）',
        description: '伝統的な白木祭壇',
        price: 350000,
        category: 'altar',
        emoji: '🎋'
    },
    {
        id: 9,
        name: '白木祭壇（大型）',
        description: '荘厳な大型白木祭壇',
        price: 580000,
        category: 'altar',
        emoji: '🎋'
    },
    {
        id: 10,
        name: '生花祭壇（標準）',
        description: '季節の花を使用した生花祭壇',
        price: 280000,
        category: 'altar',
        emoji: '💐'
    },
    
    // 供花・供物
    {
        id: 11,
        name: '供花一対（菊・洋花）',
        description: '菊または洋花のスタンド花',
        price: 35000,
        category: 'flower',
        emoji: '🌸'
    },
    {
        id: 12,
        name: '供花一基（菊・洋花）',
        description: '菊または洋花のスタンド花（片側）',
        price: 18000,
        category: 'flower',
        emoji: '🌸'
    },
    {
        id: 13,
        name: '枕花',
        description: 'ご安置用のアレンジメント',
        price: 15000,
        category: 'flower',
        emoji: '🌺'
    },
    {
        id: 14,
        name: '献花セット',
        description: 'お別れの献花用（50名分）',
        price: 25000,
        category: 'flower',
        emoji: '🌹'
    },
    {
        id: 15,
        name: '盛籠一対',
        description: '果物等の供物籠',
        price: 28000,
        category: 'flower',
        emoji: '🧺'
    },
    
    // 式場サービス
    {
        id: 16,
        name: '式場使用料（1日）',
        description: '式場・控室の使用料',
        price: 120000,
        category: 'service',
        emoji: '🏢'
    },
    {
        id: 17,
        name: '霊柩車（宮型）',
        description: '伝統的な宮型霊柩車',
        price: 85000,
        category: 'service',
        emoji: '🚗'
    },
    {
        id: 18,
        name: '霊柩車（洋型）',
        description: 'リムジン型霊柩車',
        price: 65000,
        category: 'service',
        emoji: '🚙'
    },
    {
        id: 19,
        name: 'マイクロバス',
        description: '会葬者送迎用（29名乗り）',
        price: 45000,
        category: 'service',
        emoji: '🚌'
    },
    {
        id: 20,
        name: '通夜振る舞い',
        description: 'お料理とお飲物（30名分）',
        price: 120000,
        category: 'service',
        emoji: '🍱'
    },
    {
        id: 21,
        name: '精進落とし',
        description: 'お料理とお飲物（30名分）',
        price: 150000,
        category: 'service',
        emoji: '🍱'
    },
    
    // その他
    {
        id: 22,
        name: '寝台車',
        description: 'ご遺体搬送（50kmまで）',
        price: 35000,
        category: 'other',
        emoji: '🚑'
    },
    {
        id: 23,
        name: 'ドライアイス（1日分）',
        description: 'ご遺体保全用',
        price: 12000,
        category: 'other',
        emoji: '❄️'
    },
    {
        id: 24,
        name: '遺影写真',
        description: '四つ切サイズ額入り',
        price: 25000,
        category: 'other',
        emoji: '🖼️'
    },
    {
        id: 25,
        name: '会葬礼状・返礼品',
        description: '100名分',
        price: 55000,
        category: 'other',
        emoji: '📜'
    },
    {
        id: 26,
        name: '骨壺（白磁7寸）',
        description: '標準サイズ骨壺',
        price: 18000,
        category: 'other',
        emoji: '🏺'
    },
    {
        id: 27,
        name: '位牌（塗位牌）',
        description: '本漆塗り位牌',
        price: 35000,
        category: 'other',
        emoji: '🪦'
    }
];

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
function init() {
    renderStepIndicator();
    renderCurrentStep();
    updateCart();
    setupEventListeners();
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
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        const isSelected = cart.some(item => item.id === product.id);
        return `
            <div class="product-card ${isSelected ? 'selected' : ''}" data-product-id="${product.id}">
                <div class="product-image">
                    <span style="font-size: 4rem;">${product.emoji}</span>
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
    cartIcon.classList.add('pulse');
    setTimeout(() => cartIcon.classList.remove('pulse'), 400);
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
function createQuote() {
    if (!areAllRequiredStepsCompleted()) {
        alert('すべての必須項目を選択してください');
        return;
    }

    // カートデータをローカルストレージに保存
    localStorage.setItem('quoteCart', JSON.stringify(cart));
    
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + tax;
    
    alert(`お見積内容を保存しました。\n\n選択項目: ${itemCount}件\n合計金額: ¥${total.toLocaleString()}\n\n次のステップでお見積書を作成します。`);
    console.log('お見積データ:', {
        items: cart,
        summary: {
            itemCount,
            subtotal,
            tax,
            total
        }
    });
}

// 初期化実行
document.addEventListener('DOMContentLoaded', init);
