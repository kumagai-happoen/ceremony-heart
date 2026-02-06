/**
 * kintone API連携モジュール（統合Cloudflare Worker経由）
 * 商品パターン・商品マスタからデータを取得して見積画面に表示
 */

// Cloudflare Worker設定（統合Worker）
const WORKER_BASE_URL = 'https://quote-worker.kkumagai.workers.dev';

/**
 * 施工情報と見積データを取得
 * @param {string} conductId 施工ID
 * @returns {Promise<Object>} 施工情報と見積データ
 */
async function fetchConductInfo(conductId) {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/conduct-info?conductId=${conductId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Workers API エラー: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('施工情報と見積データを取得:', data);
        return data;

    } catch (error) {
        console.error('施工情報の取得に失敗:', error);
        return { 
            deceased_name: '',
            mourner_name: '',
            product_pattern_id: '',
            product_pattern_name: '',
            quote_items: []
        };
    }
}

/**
 * 商品パターンマスタを取得
 * @returns {Promise<Array>} 商品パターンの配列
 */
async function fetchPatternMaster() {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/product-pattern-master`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Workers API エラー: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('商品パターンマスタを取得:', data);
        
        // 画像URLを追加
        return (data.patterns || []).map(pattern => ({
            ...pattern,
            imageUrl: pattern.image_files && pattern.image_files.length > 0
                ? `${WORKER_BASE_URL}/product-image?fileKey=${pattern.image_files[0].fileKey}`
                : null
        }));

    } catch (error) {
        console.error('商品パターンマスタの取得に失敗しました:', error);
        return [];
    }
}

/**
 * 商品パターン詳細を取得
 * @param {string} productPatternId 商品パターンID
 * @returns {Promise<Object>} 商品パターン詳細
 */
async function fetchPatternDetail(productPatternId) {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/product-pattern-detail?productPatternId=${productPatternId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Workers API エラー: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('商品パターン詳細を取得:', data);
        return data;

    } catch (error) {
        console.error('商品パターン詳細の取得に失敗しました:', error);
        throw error;
    }
}

/**
 * 商品マスタを取得
 * @returns {Promise<Array>} 商品データの配列
 */
async function fetchProductMaster() {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/product-master`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Workers API エラー: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('商品マスタを取得:', data);
        
        // 商品マスタのデータを変換
        return (data.products || []).map((product, index) => ({
            id: index + 1,
            productCategory: product.product_category || '',
            productAttribute: product.product_attribute || '',
            productId: product.product_id || '',
            productName: product.product_name || '',
            price: parseInt(product.price_tax_included || '0'),
            taxRate: product.tax_rate || '10',
            imageUrl: product.image_files && product.image_files.length > 0 
                ? `${WORKER_BASE_URL}/product-image?fileKey=${product.image_files[0].fileKey}` 
                : null
        }));

    } catch (error) {
        console.error('商品マスタの取得に失敗しました:', error);
        return [];
    }
}

/**
 * 見積データをkintoneに保存
 * @param {string} conductId 施工ID
 * @param {string} patternId 商品パターンID
 * @param {string} patternName 商品パターン名
 * @param {Array} items 商品配列
 * @returns {Promise<Object>} 保存結果
 */
async function saveQuoteToKintone(conductId, patternId, patternName, items) {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/save-quote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conductId: conductId,
                patternId: patternId,
                patternName: patternName,
                items: items
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `保存エラー: ${response.status}`);
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
        fetchConductInfo,
        fetchPatternMaster,
        fetchPatternDetail,
        fetchProductMaster,
        saveQuoteToKintone
    };
}
