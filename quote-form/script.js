// グローバル変数
let conductId = ''; // 施工ID
let deceasedName = ''; // 故人名前
let patterns = []; // 商品パターン一覧
let productMaster = []; // 商品マスタ
let currentStep = 1; // 現在のステップ (1: パターン選択, 2: 商品編集, 3: 最終確認)
let selectedPattern = null; // 選択された商品パターン
let cart = []; // カート（商品一覧）

// 初期化
async function init() {
    // URLパラメータから施工IDを取得
    const urlParams = new URLSearchParams(window.location.search);
    conductId = urlParams.get('id') || '';
    
    if (!conductId) {
        alert('施工IDが指定されていません。URLに?id=xxxを追加してください。');
    }
    
    showLoading();
    
    try {
        // 施工情報と見積データを取得
        let conductInfo = null;
        if (typeof fetchConductInfo === 'function') {
            conductInfo = await fetchConductInfo(conductId);
            deceasedName = conductInfo.deceased_name || '';
            console.log('故人名を取得:', deceasedName);
            
            // 既存の見積データがあれば復元
            if (conductInfo.quote_items && conductInfo.quote_items.length > 0) {
                console.log('既存の見積データを復元します:', conductInfo.quote_items.length, '件');
                
                // 選択された商品パターン情報を保存
                if (conductInfo.product_pattern_id) {
                    selectedPattern = {
                        patternId: conductInfo.product_pattern_id,
                        patternName: conductInfo.product_pattern_name,
                        totalAmount: 0 // 後で計算
                    };
                }
            }
        }
        
        // 商品パターンマスタを取得
        if (typeof fetchPatternMaster === 'function') {
            patterns = await fetchPatternMaster();
            console.log('商品パターンマスタを読み込みました:', patterns.length, '件');
        }
        
        // 商品マスタを取得
        if (typeof fetchProductMaster === 'function') {
            productMaster = await fetchProductMaster();
            console.log('商品マスタを読み込みました:', productMaster.length, '件');
        }
        
        // 既存の見積データがある場合は最終確認画面へ、なければパターン選択画面へ
        if (selectedPattern && conductInfo && conductInfo.quote_items && conductInfo.quote_items.length > 0) {
            // カートに商品を復元
            cart = conductInfo.quote_items.map((item, index) => ({
                id: index + 1,
                productCategory: item.product_category,
                productAttribute: item.product_attribute,
                productId: item.product_id,
                productName: item.product_name,
                price: parseInt(item.price_tax_included || 0),
                quantity: parseInt(item.quantity || 1),
                taxRate: item.tax_rate || '10'
            }));
            
            renderStep3(); // 最終確認画面へ
        } else {
            renderStep1(); // パターン選択画面へ
        }
        
    } catch (error) {
        console.error('初期化エラー:', error);
        alert('データの読み込みに失敗しました。ページを再読み込みしてください。');
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
                <div style="font-size: 1.2rem; color: #4A5568;">データを読み込んでいます...</div>
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

// ========================================
// ステップ1: 商品パターン選択
// ========================================
function renderStep1() {
    currentStep = 1;
    
    // 商品パターン種別の順番を固定
    const patternTypesOrder = [
        '一般葬',
        '家族葬',
        '火葬式',
        'INORIE',
        'ﾌﾟﾚﾐｱﾑ',
        '互助会',
        'みんなのお葬式',
        'ｲｵﾝ',
        'お寺',
        '葬祭扶助',
        '区民葬儀'
    ];
    
    const container = document.getElementById('app');
    container.innerHTML = `
        <div class="deceased-name">${deceasedName} 様</div>
        <div class="step-container">
            <h2 class="page-title">プランを選択してください</h2>
            
            <div class="filter-section">
                <label for="patternTypeFilter" class="filter-label">種別:</label>
                <select id="patternTypeFilter" class="filter-select">
                    <option value="">-- 種別を選択してください --</option>
                    ${patternTypesOrder.map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
            </div>
            
            <div class="pattern-grid" id="patternGrid">
                <div class="empty-message">商品パターン種別を選択してください</div>
            </div>
        </div>
    `;
    
    // フィルタのイベントリスナー
    const filterSelect = document.getElementById('patternTypeFilter');
    filterSelect.addEventListener('change', (e) => {
        filterPatterns(e.target.value);
    });
}

// 商品パターンをフィルタリングして表示
function filterPatterns(patternType) {
    const grid = document.getElementById('patternGrid');
    
    if (!patternType) {
        grid.innerHTML = '<div class="empty-message">商品パターン種別を選択してください</div>';
        return;
    }
    
    const filteredPatterns = patterns
        .filter(p => p.product_pattern_type === patternType)
        .sort((a, b) => {
            // 商品パターンIDで昇順ソート
            return a.product_pattern_id.localeCompare(b.product_pattern_id);
        });
    
    if (filteredPatterns.length === 0) {
        grid.innerHTML = '<div class="empty-message">該当する商品パターンがありません</div>';
        return;
    }
    
    grid.innerHTML = filteredPatterns.map(pattern => `
        <div class="pattern-card" data-pattern-id="${pattern.product_pattern_id}">
            <div class="pattern-image">
                ${pattern.imageUrl 
                    ? `<img src="${pattern.imageUrl}" alt="${pattern.product_pattern_name}" class="pattern-img">`
                    : `<div class="pattern-no-image">NO IMAGE</div>`
                }
            </div>
            <div class="pattern-card-body">
                <h3 class="pattern-name">${pattern.product_pattern_name}</h3>
            </div>
        </div>
    `).join('');
    
    // カード全体のクリックイベント
    document.querySelectorAll('.pattern-card').forEach(card => {
        card.addEventListener('click', async () => {
            const patternId = card.dataset.patternId;
            await selectPattern(patternId);
        });
    });
}

// 商品パターンを選択
async function selectPattern(patternId) {
    console.log('選択された商品パターンID:', patternId); // デバッグログ
    showLoading();
    
    try {
        // 商品パターン詳細を取得
        const detail = await fetchPatternDetail(patternId);
        console.log('取得した商品パターン詳細:', detail); // デバッグログ
        
        selectedPattern = {
            patternId: detail.product_pattern_id,
            patternName: detail.product_pattern_name,
            totalAmount: detail.total_amount
        };
        
        // カートに商品を展開
        cart = (detail.products || []).map((product, index) => ({
            id: index + 1,
            productCategory: product.product_category,
            productAttribute: product.product_attribute,
            productId: product.product_id,
            productName: product.product_name,
            price: parseInt(product.price_tax_included || 0),
            quantity: parseInt(product.quantity || 1),
            taxRate: product.tax_rate || '10'
        }));
        
        // ステップ2へ
        renderStep2();
        
    } catch (error) {
        console.error('パターン選択エラー:', error);
        alert('商品パターンの読み込みに失敗しました');
    } finally {
        hideLoading();
    }
}

// 初期化実行
document.addEventListener('DOMContentLoaded', init);

// ========================================
// ステップ2: 商品編集
// ========================================
function renderStep2() {
    currentStep = 2;
    
    const container = document.getElementById('app');
    container.innerHTML = `
        <div class="deceased-name">${deceasedName} 様</div>
        <div class="step-container">
            <div class="step-header-bar">
                <h1 class="page-title">${selectedPattern.patternName}</h1>
            </div>
            
            <div class="cart-section">
                <h2 class="section-title">商品一覧</h2>
                <div class="cart-list" id="cartList"></div>
                <button class="btn-add-product" onclick="showProductModal()">+ 商品を追加</button>
            </div>
            
            <div class="confirm-total">
                <span>合計金額</span>
                <span class="total-amount">¥<span id="totalAmount">0</span></span>
            </div>
            
            <div class="confirm-actions">
                <button class="btn-secondary" onclick="renderStep1()">← 戻る</button>
                <button class="btn-primary" onclick="renderStep3()">確認画面へ</button>
            </div>
        </div>
        
        <!-- 商品追加モーダル -->
        <div id="productModal" class="modal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>商品を追加</h2>
                    <button class="modal-close" onclick="closeProductModal()">×</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="productSearch" placeholder="商品名で検索..." class="search-input">
                    <div class="product-list" id="productList"></div>
                </div>
            </div>
        </div>
    `;
    
    updateCartDisplay();
}

// カート表示更新
function updateCartDisplay() {
    const cartList = document.getElementById('cartList');
    if (!cartList) return;
    
    if (cart.length === 0) {
        cartList.innerHTML = '<div class="empty-message">商品がありません</div>';
    } else {
        cartList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.productName}</div>
                    <div class="cart-item-details">
                        <span class="detail-category">${item.productCategory}</span>
                        <span class="detail-price">¥${item.price.toLocaleString()}</span>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="btn-remove" onclick="removeItem(${item.id})">削除</button>
                </div>
            </div>
        `).join('');
    }
    
    // 合計金額を更新
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = total.toLocaleString();
    }
}

// 数量変更
function updateQuantity(itemId, delta) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity < 1) item.quantity = 1;
        updateCartDisplay();
    }
}

// 商品削除
function removeItem(itemId) {
    if (confirm('この商品を削除しますか？')) {
        cart = cart.filter(i => i.id !== itemId);
        updateCartDisplay();
    }
}

// 商品追加モーダル表示
function showProductModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'flex';
    
    renderProductList();
    
    // 検索イベント
    const searchInput = document.getElementById('productSearch');
    searchInput.addEventListener('input', (e) => {
        renderProductList(e.target.value);
    });
}

// 商品追加モーダル閉じる
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

// 商品リスト表示
function renderProductList(searchTerm = '') {
    const productList = document.getElementById('productList');
    
    const filtered = productMaster.filter(p => 
        searchTerm === '' || p.productName.includes(searchTerm)
    );
    
    if (filtered.length === 0) {
        productList.innerHTML = '<div class="empty-message">商品が見つかりません</div>';
        return;
    }
    
    productList.innerHTML = filtered.map(product => `
        <div class="product-item" onclick="addProductToCart('${product.productId}')">
            ${product.imageUrl ? `<img src="${product.imageUrl}" class="product-thumb">` : '<div class="product-thumb-placeholder">NO IMAGE</div>'}
            <div class="product-item-info">
                <div class="product-item-name">${product.productName}</div>
                <div class="product-item-price">¥${product.price.toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

// 商品をカートに追加
function addProductToCart(productId) {
    const product = productMaster.find(p => p.productId === productId);
    if (!product) return;
    
    // すでにカートにある場合は数量を増やす
    const existing = cart.find(i => i.productId === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            id: Date.now(),
            productCategory: product.productCategory,
            productAttribute: product.productAttribute,
            productId: product.productId,
            productName: product.productName,
            price: product.price,
            quantity: 1,
            taxRate: product.taxRate
        });
    }
    
    updateCartDisplay();
    closeProductModal();
}

// ========================================
// ステップ3: 最終確認
// ========================================
function renderStep3() {
    currentStep = 3;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const container = document.getElementById('app');
    container.innerHTML = `
        <div class="deceased-name">${deceasedName} 様</div>
        <div class="step-container">
            <h1 class="page-title">見積内容の確認</h1>
            
            <div class="confirm-section">
                <h2 class="section-title">商品パターン</h2>
                <div class="confirm-pattern">${selectedPattern.patternName}</div>
            </div>
            
            <div class="confirm-section">
                <h2 class="section-title">商品一覧（${cart.length}件）</h2>
                <table class="quote-table">
                    <thead>
                        <tr>
                            <th>商品区分</th>
                            <th>商品名</th>
                            <th>数量</th>
                            <th>単価</th>
                            <th>金額</th>
                            <th>計</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cart.map(item => `
                            <tr>
                                <td>${item.productCategory}</td>
                                <td>${item.productName}</td>
                                <td class="text-center">${item.quantity}</td>
                                <td class="text-right">¥${item.price.toLocaleString()}</td>
                                <td class="text-center">×</td>
                                <td class="text-right">¥${(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="confirm-total">
                <span>合計金額</span>
                <span class="total-amount">¥${total.toLocaleString()}</span>
            </div>
            
            <div class="confirm-actions">
                <button class="btn-secondary" onclick="renderStep2()">← 戻る</button>
                <button class="btn-primary" onclick="saveQuote()">保存</button>
            </div>
        </div>
    `;
}

// 見積保存
async function saveQuote() {
    if (!conductId) {
        alert('施工IDが設定されていません');
        return;
    }
    
    if (cart.length === 0) {
        alert('商品が選択されていません');
        return;
    }
    
    showLoading();
    
    try {
        const items = cart.map(item => ({
            productCategory: item.productCategory,
            productAttribute: item.productAttribute,
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            taxRate: item.taxRate
        }));
        
        await saveQuoteToKintone(
            conductId,
            selectedPattern.patternId,
            selectedPattern.patternName,
            items
        );
        
        alert('見積を保存しました');
        
    } catch (error) {
        console.error('保存エラー:', error);
        alert('見積の保存に失敗しました: ' + error.message);
    } finally {
        hideLoading();
    }
}

