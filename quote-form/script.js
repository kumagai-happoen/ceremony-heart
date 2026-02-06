// グローバル変数
let conductId = ''; // 施工ID
let deceasedName = ''; // 故人名前
let mournerName = ''; // 喪主名前
let quotes = []; // 見積一覧
let patterns = []; // 商品パターン一覧
let productMaster = []; // 商品マスタ
let currentQuoteIndex = 0; // 現在選択中の見積インデックス
let currentCategory = 'plan'; // 現在選択中のカテゴリ ('plan', 'food', 'gift')

// カテゴリ定義
const CATEGORIES = {
    plan: { name: 'プラン', type: 'プラン' },
    food: { name: '料理', type: '料理' },
    gift: { name: '返礼品', type: '返礼品' }
};

// 初期化
async function init() {
    // URLパラメータから施工IDを取得
    const urlParams = new URLSearchParams(window.location.search);
    conductId = urlParams.get('id') || '';
    
    if (!conductId) {
        alert('施工IDが指定されていません。URLに?id=xxxを追加してください。');
        return;
    }
    
    showLoading();
    
    try {
        // 施工情報を取得
        const conductInfo = await fetchConductInfo(conductId);
        deceasedName = conductInfo.deceased_name || '';
        mournerName = conductInfo.mourner_name || '';
        
        // 商品パターンマスタを取得
        patterns = await fetchPatternMaster();
        console.log('商品パターンマスタを読み込みました:', patterns.length, '件');
        
        // 商品マスタを取得（全カテゴリ）
        productMaster = await fetchProductMaster();
        console.log('商品マスタを読み込みました:', productMaster.length, '件');
        
        // 見積一覧を取得
        quotes = await fetchQuotes(conductId);
        console.log('見積を読み込みました:', quotes.length, '件');
        
        // 見積がない場合は1つ作成
        if (quotes.length === 0) {
            await createNewQuote();
        }
        
        // UIを初期化
        renderUI();
        
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
// UI描画
// ========================================
function renderUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="app-header">
            ${renderHeader()}
            ${renderQuoteTabs()}
        </div>
        <div class="quote-content">
            ${renderCategoryTabs()}
            ${renderCategoryContent()}
        </div>
        ${renderPatternModal()}
        ${renderProductModal()}
    `;
}

// ヘッダー描画
function renderHeader() {
    return `
        <div class="name-header">
            <div class="name-box">
                <div class="name-label">喪主</div>
                <div class="name-value">${mournerName} 様</div>
            </div>
            <div class="name-box">
                <div class="name-label">故人</div>
                <div class="name-value">${deceasedName} 様</div>
            </div>
        </div>
    `;
}

// 見積タブ描画
function renderQuoteTabs() {
    return `
        <div class="quote-tabs-container">
            ${quotes.map((quote, index) => `
                <div class="quote-tab ${index === currentQuoteIndex ? 'active' : ''} ${quote.is_finalized ? 'finalized' : ''}" 
                     onclick="switchQuote(${index})">
                    ${quote.is_finalized ? '<span class="finalized-badge">✓</span>' : ''}
                    見積 ${index + 1}
                </div>
            `).join('')}
            <div class="quote-tab-new" onclick="createNewQuote()">
                + 新規作成
            </div>
        </div>
    `;
}

// カテゴリタブ描画
function renderCategoryTabs() {
    // 総合計を計算
    const quote = quotes[currentQuoteIndex] || { plan_items: [], food_items: [], gift_items: [] };
    const planTotal = (quote.plan_items || []).reduce((sum, item) => {
        return sum + (parseInt(item.price_tax_included || 0) * parseInt(item.quantity || 1));
    }, 0);
    const foodTotal = (quote.food_items || []).reduce((sum, item) => {
        return sum + (parseInt(item.price_tax_included || 0) * parseInt(item.quantity || 1));
    }, 0);
    const giftTotal = (quote.gift_items || []).reduce((sum, item) => {
        return sum + (parseInt(item.price_tax_included || 0) * parseInt(item.quantity || 1));
    }, 0);
    const grandTotal = planTotal + foodTotal + giftTotal;
    
    return `
        <div class="category-tabs">
            <div class="category-tabs-menu">
                ${Object.entries(CATEGORIES).map(([key, cat]) => `
                    <div class="category-tab ${key === currentCategory ? 'active' : ''}" 
                         onclick="switchCategory('${key}')">
                        ${cat.name}
                    </div>
                `).join('')}
            </div>
            <div class="category-tabs-footer">
                <div class="grand-total">
                    <div class="grand-total-label">総合計</div>
                    <div class="grand-total-amount">¥${grandTotal.toLocaleString()}</div>
                </div>
                ${!quote.is_finalized ? `
                    <button class="btn-finalize-quote" onclick="finalizeQuoteConfirm()">
                        見積確定
                    </button>
                ` : `
                    <div class="finalized-message">
                        <span class="finalized-icon">✓</span>
                        確定済み
                    </div>
                `}
                <button class="btn-copy-quote" onclick="copyQuote()">
                    この見積をコピーして作成
                </button>
                ${quotes.length > 1 && !quote.is_finalized ? `
                    <button class="btn-delete-quote" onclick="deleteQuoteConfirm()">
                        この見積を削除
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// カテゴリコンテンツ描画
function renderCategoryContent() {
    if (quotes.length === 0) {
        return '<div class="category-content"><div class="empty-message">見積がありません</div></div>';
    }
    
    const quote = quotes[currentQuoteIndex];
    const category = CATEGORIES[currentCategory];
    
    let items = [];
    if (currentCategory === 'plan') {
        items = quote.plan_items || [];
    } else if (currentCategory === 'food') {
        items = quote.food_items || [];
    } else if (currentCategory === 'gift') {
        items = quote.gift_items || [];
    }
    
    // カテゴリ合計金額を計算
    const categoryTotal = items.reduce((sum, item) => {
        const price = parseInt(item.price_tax_included || 0);
        const quantity = parseInt(item.quantity || 1);
        return sum + (price * quantity);
    }, 0);
    
    return `
        <div class="category-content">
            <div class="category-header">
                <h2 class="category-title">${category.name}</h2>
                <div class="category-total">¥${categoryTotal.toLocaleString()}</div>
            </div>
            
            ${currentCategory === 'plan' ? renderPlanSection(quote) : ''}
            
            <div class="product-list-section">
                ${items.length === 0 ? `
                    <div class="empty-message">商品がありません</div>
                ` : `
                    <div class="product-items">
                        ${items.map((item, index) => `
                            <div class="product-item">
                                <div class="product-info">
                                    <div class="product-name">${item.product_name}</div>
                                    <div class="product-details">
                                        <span class="product-category">${item.product_category}</span>
                                        <span class="product-price">¥${parseInt(item.price_tax_included || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div class="product-controls">
                                    <button class="qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                                    <input type="number" 
                                           class="qty-input" 
                                           value="${item.quantity}" 
                                           min="1" 
                                           onchange="updateQuantityDirect(${index}, this.value)"
                                           onclick="this.select()">
                                    <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                                    <button class="btn-remove" onclick="removeProduct(${index})">削除</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
                ${currentCategory !== 'plan' ? `
                    <button class="btn-add-product" onclick="showProductModal()">
                        + 商品を追加
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// プランセクション描画
function renderPlanSection(quote) {
    return `
        <div class="pattern-selector">
            <div class="pattern-current">
                <div class="pattern-name">
                    ${quote.product_pattern_name || '商品パターン未選択'}
                </div>
                <button class="btn-change-pattern" onclick="showPatternModal()">
                    ${quote.product_pattern_name ? '変更' : '選択'}
                </button>
            </div>
        </div>
    `;
}

// 商品パターン選択モーダル描画
function renderPatternModal() {
    // kintoneから取得した種別を使用（番号付きでソート）
    const patternTypes = [...new Set(patterns.map(p => p.product_pattern_type))].sort();
    
    return `
        <div id="patternModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">商品パターンを選択</h2>
                    <button class="modal-close" onclick="closePatternModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="filter-section">
                        <label for="patternTypeFilter" class="filter-label">種別:</label>
                        <select id="patternTypeFilter" class="filter-select" onchange="filterPatterns(this.value)">
                            <option value="">-- 種別を選択してください --</option>
                            ${patternTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>
                    <div class="pattern-grid" id="patternGrid"></div>
                </div>
            </div>
        </div>
    `;
}

// 商品追加モーダル描画
function renderProductModal() {
    return `
        <div id="productModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">商品を追加</h2>
                    <button class="modal-close" onclick="closeProductModal()">×</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="productSearch" placeholder="商品名で検索..." 
                           class="search-input" oninput="filterProducts(this.value)">
                    <div class="product-list" id="productList"></div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// 見積操作
// ========================================
async function createNewQuote() {
    showLoading();
    try {
        const result = await createQuote(conductId, '', '', [], [], []);
        
        // 見積一覧を再取得
        quotes = await fetchQuotes(conductId);
        
        // 最後（最新）の見積を選択
        currentQuoteIndex = quotes.length - 1;
        
        renderUI();
        
    } catch (error) {
        console.error('見積作成エラー:', error);
        alert('見積の作成に失敗しました');
    } finally {
        hideLoading();
    }
}

async function copyQuote() {
    showLoading();
    try {
        const currentQuote = quotes[currentQuoteIndex];
        
        // 現在の見積をコピーして新規作成
        const result = await createQuote(
            conductId,
            currentQuote.product_pattern_id,
            currentQuote.product_pattern_name,
            currentQuote.plan_items || [],
            currentQuote.food_items || [],
            currentQuote.gift_items || []
        );
        
        // 見積一覧を再取得
        quotes = await fetchQuotes(conductId);
        
        // 最後（最新）の見積を選択
        currentQuoteIndex = quotes.length - 1;
        
        renderUI();
        
    } catch (error) {
        console.error('見積コピーエラー:', error);
        alert('見積のコピーに失敗しました');
    } finally {
        hideLoading();
    }
}

function switchQuote(index) {
    currentQuoteIndex = index;
    renderUI();
}

async function deleteQuoteConfirm() {
    if (!confirm('この見積を削除しますか？')) {
        return;
    }
    
    showLoading();
    try {
        const quoteId = quotes[currentQuoteIndex].quote_id;
        await deleteQuote(quoteId);
        
        // 見積一覧を再取得
        quotes = await fetchQuotes(conductId);
        
        // インデックス調整
        if (currentQuoteIndex >= quotes.length) {
            currentQuoteIndex = quotes.length - 1;
        }
        if (currentQuoteIndex < 0) {
            currentQuoteIndex = 0;
        }
        
        // 見積がなくなった場合は1つ作成
        if (quotes.length === 0) {
            await createNewQuote();
        } else {
            renderUI();
        }
        
    } catch (error) {
        console.error('見積削除エラー:', error);
        alert('見積の削除に失敗しました');
    } finally {
        hideLoading();
    }
}

async function finalizeQuoteConfirm() {
    if (!confirm('この見積を確定して施工管理アプリに保存しますか？\n\n※施工管理アプリの見積データが上書きされます。')) {
        return;
    }
    
    showLoading();
    try {
        const quoteId = quotes[currentQuoteIndex].quote_id;
        await finalizeQuote(conductId, quoteId);
        
        // 見積一覧を再取得（確定済みフラグを反映）
        quotes = await fetchQuotes(conductId);
        
        renderUI();
        
        alert('見積を確定しました。\n施工管理アプリに保存されました。');
        
    } catch (error) {
        console.error('見積確定エラー:', error);
        alert('見積の確定に失敗しました: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ========================================
// カテゴリ切り替え
// ========================================
function switchCategory(category) {
    currentCategory = category;
    renderUI();
}
// ========================================
// 商品パターン選択
// ========================================
function showPatternModal() {
    const modal = document.getElementById('patternModal');
    modal.style.display = 'flex';
}

function closePatternModal() {
    const modal = document.getElementById('patternModal');
    modal.style.display = 'none';
}

function filterPatterns(patternType) {
    const grid = document.getElementById('patternGrid');
    
    if (!patternType) {
        grid.innerHTML = '';
        return;
    }
    
    const filtered = patterns
        .filter(p => p.product_pattern_type === patternType)
        .sort((a, b) => a.product_pattern_id.localeCompare(b.product_pattern_id));
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-message">該当する商品パターンがありません</div>';
        return;
    }
    
    grid.innerHTML = filtered.map(pattern => `
        <div class="pattern-card" onclick="selectPattern('${pattern.product_pattern_id}')">
            <div class="pattern-image">
                ${pattern.imageUrl 
                    ? `<img src="${pattern.imageUrl}" alt="${pattern.product_pattern_name}" class="pattern-img">`
                    : `<div class="pattern-no-image">NO IMAGE</div>`
                }
            </div>
            <div class="pattern-card-body">
                <div class="pattern-card-name">${pattern.product_pattern_name}</div>
            </div>
        </div>
    `).join('');
}

async function selectPattern(patternId) {
    showLoading();
    
    try {
        // 商品パターン詳細を取得
        const detail = await fetchPatternDetail(patternId);
        
        const quote = quotes[currentQuoteIndex];
        
        // プラン商品を更新（料理・返礼品は維持）
        const planItems = (detail.products || []).map(p => ({
            product_category: p.product_category || '',
            product_attribute: p.product_attribute || '',
            product_id: p.product_id || '',
            product_name: p.product_name || '',
            price_tax_included: p.price_tax_included || '0',
            quantity: p.quantity || '1',
            tax_rate: p.tax_rate || '10'
        }));
        
        // 見積を更新
        await updateQuote(
            quote.quote_id,
            detail.product_pattern_id,
            detail.product_pattern_name,
            planItems,
            quote.food_items || [],
            quote.gift_items || []
        );
        
        // 見積一覧を再取得
        quotes = await fetchQuotes(conductId);
        
        closePatternModal();
        renderUI();
        
    } catch (error) {
        console.error('商品パターン選択エラー:', error);
        alert('商品パターンの選択に失敗しました');
    } finally {
        hideLoading();
    }
}

// ========================================
// 商品追加
// ========================================
function showProductModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'flex';
    
    // 検索をクリア
    const searchInput = document.getElementById('productSearch');
    searchInput.value = '';
    
    filterProducts('');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

function filterProducts(searchTerm) {
    const productList = document.getElementById('productList');
    const categoryType = CATEGORIES[currentCategory].type;
    
    // カテゴリでフィルタ
    let filtered = productMaster.filter(p => p.productType === categoryType);
    
    // 検索語でフィルタ
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.productName.includes(searchTerm) ||
            (p.productCategory && p.productCategory.includes(searchTerm))
        );
    }
    
    if (filtered.length === 0) {
        productList.innerHTML = '<div class="empty-message">商品が見つかりません</div>';
        return;
    }
    
    productList.innerHTML = filtered.map(product => `
        <div class="product-list-item" onclick="addProduct('${product.productId}')">
            ${product.imageUrl 
                ? `<img src="${product.imageUrl}" class="product-thumb">`
                : '<div class="product-thumb-placeholder">NO IMAGE</div>'
            }
            <div class="product-list-item-info">
                <div class="product-list-item-name">${product.productName}</div>
                <div class="product-list-item-price">¥${product.price.toLocaleString()}</div>
            </div>
        </div>
    `).join('');
}

async function addProduct(productId) {
    const product = productMaster.find(p => p.productId === productId);
    if (!product) return;
    
    showLoading();
    
    try {
        const quote = quotes[currentQuoteIndex];
        
        // 現在のカテゴリの商品リストを取得
        let items = [];
        if (currentCategory === 'plan') {
            items = [...(quote.plan_items || [])];
        } else if (currentCategory === 'food') {
            items = [...(quote.food_items || [])];
        } else if (currentCategory === 'gift') {
            items = [...(quote.gift_items || [])];
        }
        
        // 既に存在する場合は数量を増やす
        const existing = items.find(i => i.product_id === productId);
        if (existing) {
            existing.quantity = (parseInt(existing.quantity) + 1).toString();
        } else {
            items.push({
                product_category: product.productCategory,
                product_attribute: product.productAttribute,
                product_id: product.productId,
                product_name: product.productName,
                price_tax_included: product.price.toString(),
                quantity: '1',
                tax_rate: product.taxRate
            });
        }
        
        // 見積を更新
        await updateQuote(
            quote.quote_id,
            quote.product_pattern_id,
            quote.product_pattern_name,
            currentCategory === 'plan' ? items : quote.plan_items || [],
            currentCategory === 'food' ? items : quote.food_items || [],
            currentCategory === 'gift' ? items : quote.gift_items || []
        );
        
        // 見積一覧を再取得
        quotes = await fetchQuotes(conductId);
        
        closeProductModal();
        renderUI();
        
    } catch (error) {
        console.error('商品追加エラー:', error);
        alert('商品の追加に失敗しました');
    } finally {
        hideLoading();
    }
}

// ========================================
// 商品数量変更
// ========================================
async function updateQuantity(itemIndex, delta) {
    showLoading();
    
    try {
        const quote = quotes[currentQuoteIndex];
        
        // 現在のカテゴリの商品リストを取得
        let items = [];
        if (currentCategory === 'plan') {
            items = [...(quote.plan_items || [])];
        } else if (currentCategory === 'food') {
            items = [...(quote.food_items || [])];
        } else if (currentCategory === 'gift') {
            items = [...(quote.gift_items || [])];
        }
        
        const item = items[itemIndex];
        if (!item) return;
        
        let newQty = parseInt(item.quantity) + delta;
        if (newQty < 1) newQty = 1;
        
        item.quantity = newQty.toString();
        
        // 見積を更新
        await updateQuote(
            quote.quote_id,
            quote.product_pattern_id,
            quote.product_pattern_name,
            currentCategory === 'plan' ? items : quote.plan_items || [],
            currentCategory === 'food' ? items : quote.food_items || [],
            currentCategory === 'gift' ? items : quote.gift_items || []
        );
        
        // 見積一覧を再取得
        quotes = await fetchQuotes(conductId);
        
        renderUI();
        
    } catch (error) {
        console.error('数量変更エラー:', error);
        alert('数量の変更に失敗しました');
    } finally {
        hideLoading();
    }
}

async function updateQuantityDirect(itemIndex, newValue) {
    const newQty = parseInt(newValue);
    
    // 入力値の検証
    if (isNaN(newQty) || newQty < 1) {
        alert('数量は1以上の整数を入力してください');
        renderUI(); // 元の値に戻す
        return;
    }
    
    showLoading();
    
    try {
        const quote = quotes[currentQuoteIndex];
        
        // 現在のカテゴリの商品リストを取得
        let items = [];
        if (currentCategory === 'plan') {
            items = [...(quote.plan_items || [])];
        } else if (currentCategory === 'food') {
            items = [...(quote.food_items || [])];
        } else if (currentCategory === 'gift') {
            items = [...(quote.gift_items || [])];
        }
        
        const item = items[itemIndex];
        if (!item) return;
        
        item.quantity = newQty.toString();
        
        // 見積を更新
        await updateQuote(
            quote.quote_id,
            quote.product_pattern_id,
            quote.product_pattern_name,
            currentCategory === 'plan' ? items : quote.plan_items || [],
            currentCategory === 'food' ? items : quote.food_items || [],
            currentCategory === 'gift' ? items : quote.gift_items || []
        );
        
        // 見積一覧を再取得
        quotes = await fetchQuotes(conductId);
        
        renderUI();
        
    } catch (error) {
        console.error('数量変更エラー:', error);
        alert('数量の変更に失敗しました');
    } finally {
        hideLoading();
    }
}

// ========================================
// 商品削除
// ========================================
async function removeProduct(itemIndex) {
    if (!confirm('この商品を削除しますか？')) {
        return;
    }
    
    showLoading();
    
    try {
        const quote = quotes[currentQuoteIndex];
        
        // 現在のカテゴリの商品リストを取得
        let items = [];
        if (currentCategory === 'plan') {
            items = [...(quote.plan_items || [])];
        } else if (currentCategory === 'food') {
            items = [...(quote.food_items || [])];
        } else if (currentCategory === 'gift') {
            items = [...(quote.gift_items || [])];
        }
        
        // 指定された商品を削除
        items.splice(itemIndex, 1);
        
        // 見積を更新
        await updateQuote(
            quote.quote_id,
            quote.product_pattern_id,
            quote.product_pattern_name,
            currentCategory === 'plan' ? items : quote.plan_items || [],
            currentCategory === 'food' ? items : quote.food_items || [],
            currentCategory === 'gift' ? items : quote.gift_items || []
        );
        
        // 見積一覧を再取得
        quotes = await fetchQuotes(conductId);
        
        renderUI();
        
    } catch (error) {
        console.error('商品削除エラー:', error);
        alert('商品の削除に失敗しました');
    } finally {
        hideLoading();
    }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', init);
