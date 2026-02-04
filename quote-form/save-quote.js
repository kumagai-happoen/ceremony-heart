export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { conductId, patternId, patternName, items } = await request.json();

      if (!conductId) {
        return new Response(JSON.stringify({ error: "conductId is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return new Response(JSON.stringify({ error: "items are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 施工IDでレコードを検索
      const query = encodeURIComponent(`施工ID = "${conductId}"`);
      const searchUrl = `https://ceremony-heart.cybozu.com/k/v1/records.json?app=${env.APP_CONDUCT_MANAGE}&query=${query}`;

      const searchRes = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "X-Cybozu-API-Token": `${env.KINTONE_TOKEN_CONDUCT_MANAGE},${env.KINTONE_TOKEN_PRODUCT_PATTERN_MASTER}`
        }
      });

      if (!searchRes.ok) {
        throw new Error(`Kintone search error: ${searchRes.status}`);
      }

      const searchData = await searchRes.json();

      if (!searchData.records || searchData.records.length === 0) {
        return new Response(JSON.stringify({ error: "Record not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const recordId = searchData.records[0].$id.value;

      // 商品テーブルのデータを作成
      const tableData = items.map(item => ({
        value: {
          商品区分: { 
            type: "SINGLE_LINE_TEXT",
            value: item.productCategory || ''
          },
          商品属性: { 
            type: "SINGLE_LINE_TEXT",
            value: item.productAttribute || ''
          },
          商品ID: { 
            type: "SINGLE_LINE_TEXT",
            value: item.productId || ''
          },
          商品名: { 
            type: "SINGLE_LINE_TEXT",
            value: item.productName || ''
          },
          単価_税込: { 
            type: "NUMBER",
            value: item.price.toString()
          },
          数量: { 
            type: "NUMBER",
            value: item.quantity.toString()
          },
          税率: { 
            type: "NUMBER",
            value: item.taxRate || '10'
          }
          // 小計は計算フィールドなので指定不要
        }
      }));

      // レコードを更新
      const updateUrl = `https://ceremony-heart.cybozu.com/k/v1/record.json`;
      const updateData = {
        app: env.APP_CONDUCT_MANAGE,
        id: recordId,
        record: {
          商品パターンID: {
            type: "SINGLE_LINE_TEXT",
            value: patternId || ''
          },
          商品パターン名: {
            type: "SINGLE_LINE_TEXT",
            value: patternName || ''
          },
          商品テーブル: {
            value: tableData
          }
        }
      };

      const updateRes = await fetch(updateUrl, {
        method: "PUT",
        headers: {
          "X-Cybozu-API-Token": `${env.KINTONE_TOKEN_CONDUCT_MANAGE},${env.KINTONE_TOKEN_PRODUCT_PATTERN_MASTER}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      });

      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        throw new Error(`Kintone update error: ${updateRes.status} - ${errorText}`);
      }

      const result = await updateRes.json();

      return new Response(JSON.stringify({ 
        success: true,
        recordId: recordId,
        revision: result.revision
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (error) {
      console.error('Error saving quote:', error);
      return new Response(JSON.stringify({ 
        error: "Failed to save quote", 
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
