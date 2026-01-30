/**
 * kintone API連携モジュール（Cloudflare Workers経由）
 * 商品マスタからデータを取得して見積画面に表示
 */

// Cloudflare Workers設定
const WORKER_CONFIG = {
    productMasterUrl: 'https://get-product-master.kkumagai.workers.dev/',
    productImageUrl: 'https://get-product-image.kkumagai.workers.dev/'
};

// カテゴリーマッピング（kintoneの商品カテゴリとsteps定義のカテゴリを紐付け）
const CATEGORY_MAPPING = {
    'プラン': 'plan',
    '棺': 'casket_only',
    '祭壇': 'altar',
    '供花・供物': 'flower',
    'お食事': 'service',
    'その他': 'other'
};

// 絵文字マッピング（カテゴリごとのデフォルト絵文字）
const EMOJI_MAPPING = {
    'plan': '🏛️',
    'casket_only': '⚰️',
    'altar': '🎋',
    'flower': '🌸',
    'service': '🍱',
    'other': '📜'
};

/**
 * Cloudflare Workers経由で商品マスタを取得
 * @returns {Promise<Array>} 商品データの配列
 */
async function fetchProductsFromKintone() {
    try {
        const response = await fetch(WORKER_CONFIG.productMasterUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Workers API エラー: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Workersから取得したデータ:', data);

        // 商品データを変換
        return convertProductsData(data.products);

    } catch (error) {
        console.error('商品マスタの取得に失敗しました:', error);
        // エラー時は空配列を返す
        return [];
    }
}

/**
 * Workersから取得した商品データを変換
 * @param {Array} products 商品データ配列
 * @returns {Array} 変換後の商品データ配列
 */
function convertProductsData(products) {
    if (!products || !Array.isArray(products)) {
        console.warn('商品データが配列ではありません:', products);
        return [];
    }

    return products
        .map((product, index) => {
            const category = product.product_category || '';
            const name = product.product_name || '';
            const price = parseInt(product.price_tax_included || '0');
            const displayOrder = parseInt(product.display_order || '999');
            
            // 画像ファイル情報を取得
            const imageFiles = product.image_files || [];
            // WorkersのプロキシURL経由で画像を取得
            const imageUrl = imageFiles.length > 0 
                ? `${WORKER_CONFIG.productImageUrl}?fileKey=${imageFiles[0].fileKey}` 
                : null;

            // カテゴリをマッピング
            const mappedCategory = CATEGORY_MAPPING[category] || 'other';
            
            // 絵文字を設定
            const emoji = EMOJI_MAPPING[mappedCategory] || '📦';

            return {
                id: index + 1, // 連番でIDを振る
                name: name,
                description: `${name}`, // 説明文（必要に応じて追加フィールドから取得）
                price: price,
                category: mappedCategory,
                emoji: emoji,
                displayOrder: displayOrder,
                imageUrl: imageUrl, // 画像URL（認証が必要なので注意）
                imageFiles: imageFiles // 画像ファイル情報
            };
        })
        .filter(product => product.name && product.price > 0) // 名前と価格が有効な商品のみ
        .sort((a, b) => {
            // カテゴリごとに表示順序でソート
            if (a.category !== b.category) {
                const categoryOrder = ['plan', 'casket_only', 'altar', 'flower', 'service', 'other'];
                return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
            }
            return a.displayOrder - b.displayOrder;
        });
}

/**
 * 商品データを初期化（Workersから取得または固定データ使用）
 * @param {boolean} useWorkers Workersからデータを取得するかどうか
 * @returns {Promise<Array>} 商品データ配列
 */
async function initializeProducts(useWorkers = true) {
    if (useWorkers) {
        console.log('Workersから商品マスタを取得します...');
        const workerProducts = await fetchProductsFromKintone();
        
        if (workerProducts.length > 0) {
            console.log(`${workerProducts.length}件の商品を取得しました`);
            return workerProducts;
        } else {
            console.warn('Workersからのデータ取得に失敗したため、固定データを使用します');
            return getFallbackProducts();
        }
    } else {
        return getFallbackProducts();
    }
}

/**
 * フォールバック用の固定商品データ
 * @returns {Array} 固定の商品データ配列
 */
function getFallbackProducts() {
    // script.jsの元のproductsデータをフォールバックとして使用
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
        // 必要に応じて他の商品も追加
    ];
}

/**
 * 見積データをkintoneに保存（Workers経由）
 * @param {Array} cartItems カート内の商品配列
 * @param {Object} summary 合計情報
 * @returns {Promise<Object>} 保存結果
 */
async function saveQuoteToKintone(cartItems, summary) {
    try {
        // 見積保存用のWorkers エンドポイント（別途作成が必要）
        const saveQuoteUrl = 'https://save-quote.kkumagai.workers.dev/';

        // 見積データを作成
        const quoteData = {
            items: cartItems.map(item => ({
                product_name: item.name,
                unit_price: item.price,
                quantity: item.quantity,
                amount: item.price * item.quantity
            })),
            item_count: summary.itemCount,
            subtotal: summary.subtotal,
            tax: summary.tax,
            total: summary.total,
            quote_date: new Date().toISOString().split('T')[0]
        };

        const response = await fetch(saveQuoteUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quoteData)
        });

        if (!response.ok) {
            throw new Error(`見積保存エラー: ${response.status}`);
        }

        const result = await response.json();
        console.log('見積を保存しました:', result);
        return result;

    } catch (error) {
        console.error('見積の保存に失敗しました:', error);
        throw error;
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchProductsFromKintone,
        initializeProducts,
        saveQuoteToKintone
    };
}
