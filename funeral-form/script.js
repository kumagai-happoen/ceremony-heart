/**
 * 葬儀ヒアリングシート - JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // 要素の取得
  const form = document.getElementById('hearingForm');
  const sameAsMournerCheckbox = document.getElementById('same_as_mourner');
  const billingDetails = document.getElementById('billing_details');
  const btnSaveDraft = document.getElementById('btnSaveDraft');
  const trigger9 = document.getElementById('trigger9');
  const referrerRow = document.getElementById('referrer_row');

  // ローカルストレージキー
  const STORAGE_KEY = 'funeral_hearing_draft';

  /**
   * 「喪主に同じ」チェックボックスの処理
   */
  function handleSameAsMourner() {
    if (sameAsMournerCheckbox.checked) {
      billingDetails.classList.add('disabled');
      // 施主の入力フィールドをすべてクリア
      clearBillingFields();
      // 施主フィールドの必須属性を無効化
      toggleBillingRequiredFields(false);
    } else {
      billingDetails.classList.remove('disabled');
      // 施主フィールドの必須属性を有効化
      toggleBillingRequiredFields(true);
    }
  }

  /**
   * 施主フィールドをクリア
   */
  function clearBillingFields() {
    // テキスト入力フィールド
    const textFields = [
      'billing_furigana',
      'billing_name',
      'billing_age',
      'billing_birth_year',
      'billing_birth_month',
      'billing_birth_day',
      'billing_postal',
      'billing_address',
      'billing_mobile',
      'billing_home',
      'billing_relation_other'
    ];
    
    textFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = '';
      }
    });
    
    // セレクトボックス（元号と続柄）
    const eraSelect = document.getElementById('billing_birth_era');
    if (eraSelect) {
      eraSelect.value = '';
    }
    
    const relationSelect = document.getElementById('billing_relation');
    if (relationSelect) {
      relationSelect.value = '';
    }
    
    // その他の続柄フィールドを非表示
    const relationOtherField = document.getElementById('billing_relation_other_field');
    if (relationOtherField) {
      relationOtherField.style.display = 'none';
    }
  }

  /**
   * 施主フィールドの必須属性を制御
   */
  function toggleBillingRequiredFields(isRequired) {
    const billingFields = [
      'billing_name',
      'billing_furigana',
      'billing_relation',
      'billing_birth_era',
      'billing_birth_year',
      'billing_birth_month',
      'billing_birth_day',
      'billing_age',
      'billing_address'
    ];
    
    billingFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.required = isRequired;
      }
    });
    
    // その他の続柄フィールドは別途制御されるのでここでは触らない
  }

  sameAsMournerCheckbox.addEventListener('change', handleSameAsMourner);

  /**
   * 「紹介」チェックボックスの処理
   */
  function handleReferralTrigger() {
    if (trigger9 && referrerRow) {
      if (trigger9.checked) {
        referrerRow.style.display = '';
      } else {
        referrerRow.style.display = 'none';
        // チェックを外したら紹介者名もクリア
        const referrerInput = document.getElementById('referrer');
        if (referrerInput) {
          referrerInput.value = '';
        }
      }
    }
  }

  // 紹介チェックボックスのイベントリスナー
  if (trigger9) {
    trigger9.addEventListener('change', handleReferralTrigger);
  }

  /**
   * 宗旨・宗派の選択に応じてフィールドを切り替え
   */
  function handleReligionChange() {
    const religionRadios = document.querySelectorAll('input[name="religion"]');
    const sectFields = document.getElementById('religion_sect_fields');
    const otherField = document.getElementById('religion_other_field');
    
    // 現在の状態を確認して表示を更新
    const checkedRadio = document.querySelector('input[name="religion"]:checked');
    if (checkedRadio && sectFields && otherField) {
      if (checkedRadio.value === '仏式') {
        sectFields.style.display = 'flex';
        otherField.style.display = 'none';
      } else if (checkedRadio.value === 'その他') {
        sectFields.style.display = 'none';
        otherField.style.display = '';
      } else {
        sectFields.style.display = 'none';
        otherField.style.display = 'none';
      }
    }
    
    // イベントリスナーも登録
    religionRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.value === '仏式' && this.checked) {
          // 仏式の場合：宗と派の個別フィールドを表示
          sectFields.style.display = 'flex';
          otherField.style.display = 'none';
          // その他フィールドをクリア
          document.getElementById('religion_other_text').value = '';
        } else if (this.value === 'その他' && this.checked) {
          // その他の場合：自由入力フィールドを表示
          sectFields.style.display = 'none';
          otherField.style.display = '';
          // 宗と派のフィールドをクリア
          document.getElementById('religion_sect_shu').value = '';
          document.getElementById('religion_sect_ha').value = '';
        } else if (this.checked) {
          // 神式、キリスト、無宗教式の場合：すべて非表示
          sectFields.style.display = 'none';
          otherField.style.display = 'none';
          // すべてのフィールドをクリア
          document.getElementById('religion_sect_shu').value = '';
          document.getElementById('religion_sect_ha').value = '';
          document.getElementById('religion_other_text').value = '';
        }
      });
    });
  }

  /**
   * 寺院の選択に応じてフィールドを切り替え
   */
  function handleTempleChange() {
    const templeRadios = document.querySelectorAll('input[name="temple"]');
    const templeNameField = document.getElementById('temple_name_field');
    
    templeRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.value === '菩提寺あり' && this.checked) {
          // 菩提寺ありの場合：寺院名フィールドを表示
          templeNameField.style.display = '';
        } else if (this.checked) {
          // 菩提寺なしの場合：寺院名フィールドを非表示＆クリア
          templeNameField.style.display = 'none';
          document.getElementById('temple_name').value = '';
        }
      });
    });
  }

  /**
   * 納骨先の選択に応じてフィールドを切り替え
   */
  function handleBurialChange() {
    const burialRadios = document.querySelectorAll('input[name="burial"]');
    const burialPlaceField = document.getElementById('burial_place_field');
    
    burialRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.value === 'あり' && this.checked) {
          // ありの場合：墓所等の名称フィールドを表示
          burialPlaceField.style.display = '';
        } else if (this.checked) {
          // なしの場合：墓所等の名称フィールドを非表示＆クリア
          burialPlaceField.style.display = 'none';
          document.getElementById('burial_place').value = '';
        }
      });
    });
  }

  /**
   * こだわりの「その他」チェックボックスの処理
   */
  function handlePreferencesOtherChange() {
    const prefOtherCheckbox = document.getElementById('pref_other');
    const preferencesOtherField = document.getElementById('preferences_other_field');
    
    if (prefOtherCheckbox && preferencesOtherField) {
      prefOtherCheckbox.addEventListener('change', function() {
        if (this.checked) {
          preferencesOtherField.style.display = '';
        } else {
          preferencesOtherField.style.display = 'none';
          // チェックを外したらその他のご要望もクリア
          document.getElementById('preferences_other').value = '';
        }
      });
    }
  }

  /**
   * ご案内の「その他」チェックボックスの処理
   */
  function handleGuidanceOtherChange() {
    const guidanceOtherCheckbox = document.getElementById('guidance_other');
    const guidanceOtherField = document.getElementById('guidance_other_field');
    
    if (guidanceOtherCheckbox && guidanceOtherField) {
      guidanceOtherCheckbox.addEventListener('change', function() {
        if (this.checked) {
          guidanceOtherField.style.display = '';
        } else {
          guidanceOtherField.style.display = 'none';
          // チェックを外したら入力内容もクリア
          document.getElementById('guidance_other_text').value = '';
        }
      });
    }
  }

  /**
   * 続柄の「その他」選択時の処理
   */
  function handleRelationChange() {
    // 喪主の続柄
    const mournerRelation = document.getElementById('mourner_relation');
    const mournerRelationOtherField = document.getElementById('mourner_relation_other_field');
    const mournerRelationOtherInput = document.getElementById('mourner_relation_other');
    
    // 初期状態でrequired属性を無効化（非表示のため）
    if (mournerRelationOtherInput) {
      mournerRelationOtherInput.required = false;
    }
    
    if (mournerRelation && mournerRelationOtherField) {
      mournerRelation.addEventListener('change', function() {
        if (this.value === 'その他') {
          mournerRelationOtherField.style.display = 'block';
          mournerRelationOtherInput.required = true;
        } else {
          mournerRelationOtherField.style.display = 'none';
          mournerRelationOtherInput.required = false;
          mournerRelationOtherInput.value = '';
        }
      });
    }

    // 施主の続柄
    const billingRelation = document.getElementById('billing_relation');
    const billingRelationOtherField = document.getElementById('billing_relation_other_field');
    const billingRelationOtherInput = document.getElementById('billing_relation_other');
    
    // 初期状態でrequired属性を無効化（非表示のため）
    if (billingRelationOtherInput) {
      billingRelationOtherInput.required = false;
    }
    
    if (billingRelation && billingRelationOtherField) {
      billingRelation.addEventListener('change', function() {
        if (this.value === 'その他') {
          billingRelationOtherField.style.display = 'block';
          billingRelationOtherInput.required = true;
        } else {
          billingRelationOtherField.style.display = 'none';
          billingRelationOtherInput.required = false;
          billingRelationOtherInput.value = '';
        }
      });
    }
  }

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
    
    // 性別チェックを最初に行う
    const genderSelected = document.querySelector('input[name="deceased_gender"]:checked');
    const firstGenderRadio = document.getElementById('gender_m');
    
    if (!genderSelected) {
      // 性別が未選択の場合
      firstGenderRadio.setCustomValidity('性別を選択してください');
      firstGenderRadio.reportValidity(); // これでツールチップが表示される
      return;
    } else {
      firstGenderRadio.setCustomValidity('');
    }
    
    // 連絡先のバリデーション
    const mournerMobile = document.getElementById('mourner_mobile');
    const mournerHome = document.getElementById('mourner_home');
    const billingMobile = document.getElementById('billing_mobile');
    const billingHome = document.getElementById('billing_home');
    
    // 喪主の連絡先チェック
    if (mournerMobile && mournerHome) {
      if (!mournerMobile.value.trim() && !mournerHome.value.trim()) {
        mournerMobile.setCustomValidity('喪主の携帯または自宅のいずれかを入力してください');
        mournerMobile.reportValidity();
        return;
      } else {
        mournerMobile.setCustomValidity('');
        mournerHome.setCustomValidity('');
      }
    }
    
    // 施主の連絡先チェック（喪主に同じの場合はスキップ）
    const sameAsMourner = document.getElementById('same_as_mourner');
    if (sameAsMourner && !sameAsMourner.checked && billingMobile && billingHome) {
      if (!billingMobile.value.trim() && !billingHome.value.trim()) {
        billingMobile.setCustomValidity('施主の携帯または自宅のいずれかを入力してください');
        billingMobile.reportValidity();
        return;
      } else {
        billingMobile.setCustomValidity('');
        billingHome.setCustomValidity('');
      }
    }
    
    // HTML5バリデーションをチェック
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    const data = getFormData();
    console.log('フォームデータ:', data);
    
    // 確認ダイアログ
    if (confirm('保存しますか？')) {
      // kintoneに保存
      saveRecord();
      showToast('保存しました', 'success');
    }
  }

  /**
   * カスタムバリデーションメッセージの設定
   */
  function setupCustomValidation() {
    // 性別のラジオボタンが選択されたらエラーをクリア
    const genderRadios = document.querySelectorAll('input[name="deceased_gender"]');
    const firstGenderRadio = document.getElementById('gender_m');
    
    genderRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        firstGenderRadio.setCustomValidity('');
      });
    });

    // 連絡先（携帯・自宅）のカスタムバリデーション
    setupContactValidation();
  }

  /**
   * 連絡先のカスタムバリデーション（携帯・自宅のいずれか必須）
   */
  function setupContactValidation() {
    // 喪主の連絡先
    const mournerMobile = document.getElementById('mourner_mobile');
    const mournerHome = document.getElementById('mourner_home');
    
    // 施主の連絡先
    const billingMobile = document.getElementById('billing_mobile');
    const billingHome = document.getElementById('billing_home');
    
    // バリデーション関数
    function validateContacts(mobileField, homeField, personName) {
      const mobileValue = mobileField.value.trim();
      const homeValue = homeField.value.trim();
      
      if (!mobileValue && !homeValue) {
        const message = `${personName}の携帯または自宅のいずれかを入力してください`;
        mobileField.setCustomValidity(message);
        homeField.setCustomValidity(message);
        return false;
      } else {
        mobileField.setCustomValidity('');
        homeField.setCustomValidity('');
        return true;
      }
    }
    
    // 入力時にリアルタイムでバリデーション
    if (mournerMobile && mournerHome) {
      mournerMobile.addEventListener('input', () => validateContacts(mournerMobile, mournerHome, '喪主'));
      mournerHome.addEventListener('input', () => validateContacts(mournerMobile, mournerHome, '喪主'));
    }
    
    if (billingMobile && billingHome) {
      billingMobile.addEventListener('input', () => validateContacts(billingMobile, billingHome, '施主'));
      billingHome.addEventListener('input', () => validateContacts(billingMobile, billingHome, '施主'));
    }
  }

  /**
   * 簡易バリデーション（HTML5バリデーション後の追加チェック用）
   */
  function validateForm(data) {
    // HTML5バリデーションで基本的なチェックは完了しているため
    // ここでは特殊なビジネスロジックのチェックのみ実施
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
  /**
   * 郵便番号から住所を検索
   */
  function setupPostalCodeLookup() {
    // 検索ボタンをすべて取得
    const searchButtons = document.querySelectorAll('.btn-postal-search');
    
    searchButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const postalId = this.getAttribute('data-postal');
        const addressId = this.getAttribute('data-address');
        
        const postalInput = document.getElementById(postalId);
        const addressInput = document.getElementById(addressId);
        
        if (!postalInput || !addressInput) return;
        
        // 郵便番号を取得（ハイフンを除去）
        const code = postalInput.value.replace(/[^0-9]/g, '');
        
        if (code.length !== 7) {
          alert('郵便番号は7桁で入力してください');
          return;
        }
        
        // ボタンを無効化
        button.disabled = true;
        button.textContent = '検索中...';
        
        try {
          // zipcloud APIを使用
          const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
          const data = await response.json();
          
          if (data.status === 200 && data.results) {
            const result = data.results[0];
            // 都道府県 + 市区町村 + 町域
            const address = result.address1 + result.address2 + result.address3;
            addressInput.value = address;
            showToast('住所を自動入力しました');
          } else {
            alert('該当する住所が見つかりませんでした');
          }
        } catch (error) {
          console.error('郵便番号検索エラー:', error);
          alert('住所の取得に失敗しました');
        } finally {
          // ボタンを元に戻す
          button.disabled = false;
          button.textContent = '住所を自動入力';
        }
      });
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
   * 元号と和暦年を西暦年に変換
   */
  function convertToWesternYear(era, japaneseYear) {
    const eraStartYears = {
      '大正': 1912,
      '昭和': 1926,
      '平成': 1989,
      '令和': 2019
    };
    
    if (!era || !japaneseYear || !eraStartYears[era]) {
      return null;
    }
    
    return eraStartYears[era] + parseInt(japaneseYear) - 1;
  }

  /**
   * 年齢を計算（故人の場合は逝去日時点、その他は今日時点）
   */
  function calculateAge(birthEra, birthYear, birthMonth, birthDay, targetType = 'deceased') {
    // 生年月日の入力チェック
    if (!birthEra || !birthYear || !birthMonth || !birthDay) {
      alert('生年月日を正しく入力してください');
      return null;
    }

    // 西暦に変換
    const birthWesternYear = convertToWesternYear(birthEra, birthYear);
    if (!birthWesternYear) {
      alert('元号が正しく選択されていません');
      return null;
    }

    const birthDate = new Date(birthWesternYear, parseInt(birthMonth) - 1, parseInt(birthDay));
    
    // 基準日の設定
    let referenceDate;
    if (targetType === 'deceased') {
      // 故人の場合は逝去日を基準にする
      const deathYear = document.getElementById('deceased_death_year').value;
      const deathMonth = document.getElementById('deceased_death_month').value;
      const deathDay = document.getElementById('deceased_death_day').value;
      
      if (!deathYear || !deathMonth || !deathDay) {
        alert('逝去日を先に入力してください');
        return null;
      }
      
      // 令和の逝去日を西暦に変換
      const deathWesternYear = convertToWesternYear('令和', deathYear);
      referenceDate = new Date(deathWesternYear, parseInt(deathMonth) - 1, parseInt(deathDay));
    } else {
      // その他は今日を基準にする
      referenceDate = new Date();
    }

    // 年齢計算
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * 年齢計算ボタンのイベントハンドラー
   */
  function setupAgeCalculation() {
    // 故人の年齢計算
    const btnCalcDeceasedAge = document.getElementById('btn_calc_deceased_age');
    if (btnCalcDeceasedAge) {
      btnCalcDeceasedAge.addEventListener('click', function() {
        const era = document.getElementById('deceased_birth_era').value;
        const year = document.getElementById('deceased_birth_year').value;
        const month = document.getElementById('deceased_birth_month').value;
        const day = document.getElementById('deceased_birth_day').value;
        
        const age = calculateAge(era, year, month, day, 'deceased');
        if (age !== null) {
          document.getElementById('deceased_age').value = age;
          showToast(`年齢を計算しました: ${age}歳`);
        }
      });
    }

    // 喪主の年齢計算
    const btnCalcMournerAge = document.getElementById('btn_calc_mourner_age');
    if (btnCalcMournerAge) {
      btnCalcMournerAge.addEventListener('click', function() {
        const era = document.getElementById('mourner_birth_era').value;
        const year = document.getElementById('mourner_birth_year').value;
        const month = document.getElementById('mourner_birth_month').value;
        const day = document.getElementById('mourner_birth_day').value;
        
        const age = calculateAge(era, year, month, day, 'mourner');
        if (age !== null) {
          document.getElementById('mourner_age').value = age;
          showToast(`年齢を計算しました: ${age}歳`);
        }
      });
    }

    // 施主の年齢計算
    const btnCalcBillingAge = document.getElementById('btn_calc_billing_age');
    if (btnCalcBillingAge) {
      btnCalcBillingAge.addEventListener('click', function() {
        const era = document.getElementById('billing_birth_era').value;
        const year = document.getElementById('billing_birth_year').value;
        const month = document.getElementById('billing_birth_month').value;
        const day = document.getElementById('billing_birth_day').value;
        
        const age = calculateAge(era, year, month, day, 'billing');
        if (age !== null) {
          document.getElementById('billing_age').value = age;
          showToast(`年齢を計算しました: ${age}歳`);
        }
      });
    }
  }

  /**
   * 初期化
   */
  function init() {
    // カスタムバリデーションメッセージの設定
    setupCustomValidation();
    
    // 施主フィールドの初期状態を設定
    // 「喪主に同じ」がチェックされていなければ必須
    toggleBillingRequiredFields(!sameAsMournerCheckbox.checked);
    
    // 紹介チェックボックスの初期状態を設定
    handleReferralTrigger();
    
    // 宗旨・宗派の切り替え処理
    handleReligionChange();
    
    // 寺院の切り替え処理
    handleTempleChange();
    
    // 納骨先の切り替え処理
    handleBurialChange();
    
    // こだわりの「その他」チェックボックスの処理
    handlePreferencesOtherChange();
    
    // ご案内の「その他」チェックボックスの処理
    handleGuidanceOtherChange();
    
    // 続柄の「その他」選択時の処理
    handleRelationChange();
    
    // 年齢計算ボタンのセットアップ
    setupAgeCalculation();
    
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
  
  // ========================================
  // 外部から呼び出せる関数をwindowオブジェクトに公開
  // ========================================
  window.applyConditionalDisplays = function() {
    // 紹介者欄
    if (trigger9 && trigger9.checked && referrerRow) {
      referrerRow.style.display = '';
    }
    
    // 宗旨・宗派
    const checkedReligion = document.querySelector('input[name="religion"]:checked');
    const sectFields = document.getElementById('religion_sect_fields');
    const otherField = document.getElementById('religion_other_field');
    if (checkedReligion && sectFields && otherField) {
      if (checkedReligion.value === '仏式') {
        sectFields.style.display = 'flex';
        otherField.style.display = 'none';
      } else if (checkedReligion.value === 'その他') {
        sectFields.style.display = 'none';
        otherField.style.display = '';
      } else {
        sectFields.style.display = 'none';
        otherField.style.display = 'none';
      }
    }
    
    // 寺院名
    const checkedTemple = document.querySelector('input[name="temple"]:checked');
    const templeNameField = document.getElementById('temple_name_field');
    if (checkedTemple && templeNameField) {
      if (checkedTemple.value === '菩提寺あり') {
        templeNameField.style.display = '';
      } else {
        templeNameField.style.display = 'none';
      }
    }
    
    // 納骨先
    const checkedBurial = document.querySelector('input[name="burial"]:checked');
    const burialPlaceField = document.getElementById('burial_place_field');
    if (checkedBurial && burialPlaceField) {
      if (checkedBurial.value === 'あり') {
        burialPlaceField.style.display = '';
      } else {
        burialPlaceField.style.display = 'none';
      }
    }
    
    // こだわりの「その他」
    const prefOther = document.getElementById('pref_other');
    const preferencesOtherField = document.getElementById('preferences_other_field');
    if (prefOther && preferencesOtherField) {
      if (prefOther.checked) {
        preferencesOtherField.style.display = '';
      } else {
        preferencesOtherField.style.display = 'none';
      }
    }
    
    // 喪主の続柄「その他」
    const mournerRelation = document.getElementById('mourner_relation');
    const mournerRelationOtherField = document.getElementById('mourner_relation_other_field');
    const mournerRelationOtherInput = document.getElementById('mourner_relation_other');
    if (mournerRelation && mournerRelationOtherField) {
      if (mournerRelation.value === 'その他') {
        mournerRelationOtherField.style.display = 'block';
        if (mournerRelationOtherInput) mournerRelationOtherInput.required = true;
      } else {
        mournerRelationOtherField.style.display = 'none';
        if (mournerRelationOtherInput) {
          mournerRelationOtherInput.required = false;
          mournerRelationOtherInput.value = '';
        }
      }
    }
    
    // 施主の続柄「その他」
    const billingRelation = document.getElementById('billing_relation');
    const billingRelationOtherField = document.getElementById('billing_relation_other_field');
    const billingRelationOtherInput = document.getElementById('billing_relation_other');
    if (billingRelation && billingRelationOtherField) {
      if (billingRelation.value === 'その他') {
        billingRelationOtherField.style.display = 'block';
        if (billingRelationOtherInput) billingRelationOtherInput.required = true;
      } else {
        billingRelationOtherField.style.display = 'none';
        if (billingRelationOtherInput) {
          billingRelationOtherInput.required = false;
          billingRelationOtherInput.value = '';
        }
      }
    }
    
    // 「喪主に同じ」のdisabled制御
    if (sameAsMournerCheckbox && sameAsMournerCheckbox.checked && billingDetails) {
      billingDetails.classList.add('disabled');
      toggleBillingRequiredFields(false);
    } else if (billingDetails) {
      billingDetails.classList.remove('disabled');
      toggleBillingRequiredFields(true);
    }
    
    // ご案内セクションの「その他」チェックボックス
    const guidanceOtherCheckbox = document.getElementById('guidance_other');
    const guidanceOtherField = document.getElementById('guidance_other_field');
    if (guidanceOtherCheckbox && guidanceOtherField) {
      if (guidanceOtherCheckbox.checked) {
        guidanceOtherField.style.display = 'block';
      } else {
        guidanceOtherField.style.display = 'none';
      }
    }
  };
});
