/**
 * 葬儀ヒアリングシート - JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // 要素の取得
  const form = document.getElementById('hearingForm');
  const sameAsMournerCheckbox = document.getElementById('same_as_mourner');
  const billingDetails = document.getElementById('billing_details');
  const btnSaveDraft = document.getElementById('btnSaveDraft');

  // ローカルストレージキー
  const STORAGE_KEY = 'funeral_hearing_draft';

  /**
   * 「喪主に同じ」チェックボックスの処理
   */
  function handleSameAsMourner() {
    if (sameAsMournerCheckbox.checked) {
      billingDetails.classList.add('disabled');
    } else {
      billingDetails.classList.remove('disabled');
    }
  }

  sameAsMournerCheckbox.addEventListener('change', handleSameAsMourner);

  /**
   * フォームデータをオブジェクトとして取得
   */
  function getFormData() {
    const formData = new FormData(form);
    const data = {};
    
    // 通常のフィールド
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // 同じキーが複数ある場合（チェックボックス）は配列にする
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  /**
   * フォームにデータを復元
   */
  function restoreFormData(data) {
    if (!data) return;

    Object.keys(data).forEach(key => {
      const value = data[key];
      const elements = form.querySelectorAll(`[name="${key}"]`);
      
      elements.forEach(element => {
        if (element.type === 'checkbox') {
          const values = Array.isArray(value) ? value : [value];
          element.checked = values.includes(element.value);
        } else if (element.type === 'radio') {
          element.checked = (element.value === value);
        } else {
          element.value = value;
        }
      });
    });

    // 「喪主に同じ」の状態を反映
    handleSameAsMourner();
  }

  /**
   * 下書き保存
   */
  function saveDraft() {
    const data = getFormData();
    data._savedAt = new Date().toISOString();
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      showToast('下書きを保存しました');
    } catch (e) {
      console.error('保存エラー:', e);
      showToast('保存に失敗しました', 'error');
    }
  }

  /**
   * 下書き読み込み
   */
  function loadDraft() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const savedAt = data._savedAt ? new Date(data._savedAt).toLocaleString('ja-JP') : '';
        
        if (confirm(`${savedAt} に保存された下書きがあります。\n読み込みますか？`)) {
          restoreFormData(data);
          showToast('下書きを読み込みました');
        }
      }
    } catch (e) {
      console.error('読み込みエラー:', e);
    }
  }

  /**
   * トースト通知を表示
   */
  function showToast(message, type = 'success') {
    // 既存のトーストを削除
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // トースト要素を作成
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      padding: 16px 32px;
      background: ${type === 'success' ? '#6B5344' : '#C94A4A'};
      color: #fff;
      border-radius: 8px;
      font-size: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 1000;
      animation: toastFadeIn 0.3s ease;
    `;

    // アニメーション用スタイルを追加
    if (!document.querySelector('#toast-style')) {
      const style = document.createElement('style');
      style.id = 'toast-style';
      style.textContent = `
        @keyframes toastFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes toastFadeOut {
          from { opacity: 1; transform: translateX(-50%) translateY(0); }
          to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // 3秒後にフェードアウト
    setTimeout(() => {
      toast.style.animation = 'toastFadeOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * フォーム送信処理
   */
  function handleSubmit(e) {
    e.preventDefault();
    
    const data = getFormData();
    console.log('フォームデータ:', data);
    
    // バリデーション（必要に応じて拡張）
    if (!validateForm(data)) {
      return;
    }

    // 確認ダイアログ
    if (confirm('保存しますか？')) {
      // ここで実際の送信処理やプレビュー画面への遷移を行う
      saveRecord();
    }
  }

  /**
   * 簡易バリデーション
   */
  function validateForm(data) {
    const errors = [];

    // 故人名は必須
    if (!data.deceased_name || data.deceased_name.trim() === '') {
      errors.push('故人名を入力してください');
    }

    // 喪主名は必須
    if (!data.mourner_name || data.mourner_name.trim() === '') {
      errors.push('喪主名を入力してください');
    }

    if (errors.length > 0) {
      alert('入力エラー:\n\n' + errors.join('\n'));
      return false;
    }

    return true;
  }

  /**
   * 確認画面表示（デモ用）
   */
  function showConfirmation(data) {
    // 本番環境では別画面への遷移やモーダル表示を実装
    const summary = `
【故人情報】
お名前: ${data.deceased_name || '未入力'}
性別: ${data.deceased_gender || '未選択'}
年齢: ${data.deceased_age ? data.deceased_age + '歳' : '未入力'}

【喪主情報】
お名前: ${data.mourner_name || '未入力'}
続柄: ${data.mourner_relation || '未入力'}
連絡先（携帯）: ${data.mourner_mobile || '未入力'}

【精算方法】
${data.payment_method || '未選択'}
    `.trim();

    alert('入力内容（デモ表示）:\n\n' + summary);
    
    // 開発用: コンソールに全データ出力
    console.table(data);
  }

  /**
   * 郵便番号から住所を自動入力（API連携用のスタブ）
   */
  function setupPostalCodeLookup() {
    const postalInputs = [
      { postal: 'deceased_postal', address: 'deceased_address' },
      { postal: 'mourner_postal', address: 'mourner_address' },
      { postal: 'billing_postal', address: 'billing_address' }
    ];

    postalInputs.forEach(({ postal, address }) => {
      const postalInput = form.querySelector(`[name="${postal}"]`);
      const addressInput = form.querySelector(`[name="${address}"]`);
      
      if (postalInput && addressInput) {
        postalInput.addEventListener('blur', function() {
          const code = this.value.replace(/[^0-9]/g, '');
          if (code.length === 7) {
            // 本番環境ではAPIを呼び出して住所を取得
            // fetchAddress(code).then(addr => addressInput.value = addr);
            console.log(`郵便番号 ${code} の住所検索（未実装）`);
          }
        });
      }
    });
  }

  /**
   * 数値入力フィールドの制限
   */
  function setupNumberInputs() {
    const numberInputs = form.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
      input.addEventListener('input', function() {
        // 負の値を防止
        if (this.value < 0) {
          this.value = 0;
        }
      });
    });
  }

  /**
   * 初期化
   */
  function init() {
    // 下書き読み込み
    loadDraft();
    
    // 郵便番号検索セットアップ
    setupPostalCodeLookup();
    
    // 数値入力制限
    setupNumberInputs();
  }

  // イベントリスナー登録
  form.addEventListener('submit', handleSubmit);

  // 初期化実行
  init();
});
