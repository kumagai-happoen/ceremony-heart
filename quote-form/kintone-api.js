/**
 * kintone API連携モジュール（新仕様対応版）
 * 複数見積管理・カテゴリ別サブテーブル対応
 */

// Cloudflare Worker設定
const WORKER_BASE_URL = 'https://quote-worker.kkumagai.workers.dev';

/**
 * 施工情報を取得
 * @param {string} conductId 施工ID
 * @returns {Promise<Object>} 施工情報
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
        console.log('施工情報を取得:', data);
        return data;

    } catch (error) {
        console.error('施工情報の取得に失敗:', error);
        return { 
            conduct_id: '',
            deceased_name: '',
            mourner_name: ''
        };
    }
}

/**
 * 見積一覧を取得
 * @param {string} conductId 施工ID
 * @returns {Promise<Array>} 見積の配列
 */
async function fetchQuotes(conductId) {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/quotes?conductId=${conductId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Workers API エラー: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('見積一覧を取得:', data);
        return data.quotes || [];

    } catch (error) {
        console.error('見積一覧の取得に失敗:', error);
        return [];
    }
}

/**
 * 新規見積を作成
 * @param {string} conductId 施工ID
 * @param {string} patternId 商品パターンID
 * @param {string} patternName 商品パターン名
 * @param {Array} planItems プラン商品配列
 * @param {Array} foodItems 料理商品配列
 * @param {Array} giftItems 返礼品商品配列
 * @returns {Promise<Object>} 作成結果
 */
async function createQuote(conductId, patternId, patternName, planItems, foodItems, giftItems) {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/quotes/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conductId: conductId,
                patternId: patternId || '',
                patternName: patternName || '',
                planItems: planItems || [],
                foodItems: foodItems || [],
                giftItems: giftItems || []
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `作成エラー: ${response.status}`);
        }

        const result = await response.json();
        console.log('見積を作成しました:', result);
        return result;

    } catch (error) {
        console.error('見積の作成に失敗しました:', error);
        throw error;
    }
}

/**
 * 見積を更新
 * @param {string} quoteId 見積ID
 * @param {string} patternId 商品パターンID
 * @param {string} patternName 商品パターン名
 * @param {Array} planItems プラン商品配列
 * @param {Array} foodItems 料理商品配列
 * @param {Array} giftItems 返礼品商品配列
 * @returns {Promise<Object>} 更新結果
 */
async function updateQuote(quoteId, patternId, patternName, planItems, foodItems, giftItems) {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/quotes/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quoteId: quoteId,
                patternId: patternId || '',
                patternName: patternName || '',
                planItems: planItems || [],
                foodItems: foodItems || [],
                giftItems: giftItems || []
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `更新エラー: ${response.status}`);
        }

        const result = await response.json();
        console.log('見積を更新しました:', result);
        return result;

    } catch (error) {
        console.error('見積の更新に失敗しました:', error);
        throw error;
    }
}

/**
 * 見積を削除
 * @param {string} quoteId 見積ID
 * @returns {Promise<Object>} 削除結果
 */
async function deleteQuote(quoteId) {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/quotes/delete?quoteId=${quoteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `削除エラー: ${response.status}`);
        }

        const result = await response.json();
        console.log('見積を削除しました:', result);
        return result;

    } catch (error) {
        console.error('見積の削除に失敗しました:', error);
        throw error;
    }
}

/**
 * 見積を確定して施工管理アプリに保存
 * @param {string} conductId 施工ID
 * @param {string} quoteId 見積ID
 * @returns {Promise<Object>} 確定結果
 */
async function finalizeQuote(conductId, quoteId) {
    try {
        const response = await fetch(`${WORKER_BASE_URL}/quotes/finalize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conductId: conductId,
                quoteId: quoteId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `確定エラー: ${response.status}`);
        }

        const result = await response.json();
        console.log('見積を確定しました:', result);
        return result;

    } catch (error) {
        console.error('見積の確定に失敗しました:', error);
        throw error;
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
 * @param {string} category 商品カテゴリ（オプション: 'プラン', '料理', '返礼品'）
 * @returns {Promise<Array>} 商品データの配列
 */
async function fetchProductMaster(category = null) {
    try {
        let url = `${WORKER_BASE_URL}/product-master`;
        if (category) {
            url += `?category=${encodeURIComponent(category)}`;
        }
        
        const response = await fetch(url, {
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
            productType: product.product_type || '', // 新規追加
            unit: product.unit || '',
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

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchConductInfo,
        fetchQuotes,
        createQuote,
        updateQuote,
        deleteQuote,
        finalizeQuote,
        fetchPatternMaster,
        fetchPatternDetail,
        fetchProductMaster
    };
}
