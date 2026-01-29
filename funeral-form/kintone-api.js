// ロード時のレコード取得
async function loadRecord() {
  const params = new URLSearchParams(location.search);
  const conductId = params.get("id");

  // id が無ければ処理しない
  if (!conductId) {
    console.warn("conductId がありません。loadRecord を中断します。");
    return;
  }

  const res = await fetch("https://ceremonyheart.kkumagai.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conductId })
  });

  const data = await res.json();

  // 当社を知ったきっかけ・ご依頼理由
  setCheckboxValues("trigger", data.trigger);
  if (data.referrer_name) document.querySelector("#referrer").value = data.referrer_name;
  
  // 故人情報
  if (data.deceased_name) document.querySelector("#deceased_name").value = data.deceased_name;
  if (data.deceased_furigana) document.querySelector("#deceased_furigana").value = data.deceased_furigana;
  setRadioValue("deceased_gender", data.deceased_gender);
  if (data.deceased_birth_era) document.querySelector("#deceased_birth_era").value = data.deceased_birth_era;
  if (data.deceased_birth_year) document.querySelector("#deceased_birth_year").value = data.deceased_birth_year;
  if (data.deceased_birth_month) document.querySelector("#deceased_birth_month").value = data.deceased_birth_month;
  if (data.deceased_birth_day) document.querySelector("#deceased_birth_day").value = data.deceased_birth_day;
  if (data.deceased_age) document.querySelector("#deceased_age").value = data.deceased_age;
  if (data.deceased_death_year) document.querySelector("#deceased_death_year").value = data.deceased_death_year;
  if (data.deceased_death_month) document.querySelector("#deceased_death_month").value = data.deceased_death_month;
  if (data.deceased_death_day) document.querySelector("#deceased_death_day").value = data.deceased_death_day;
  
  // 逝去時刻（"HH:MM"形式から時と分に分解）
  if (data.deceased_death_time) {
    const [hour, minute] = data.deceased_death_time.split(':');
    if (hour) document.querySelector("#deceased_death_hour").value = hour;
    if (minute) document.querySelector("#deceased_death_minute").value = minute;
  }
  
  if (data.deceased_postal) document.querySelector("#deceased_postal").value = data.deceased_postal;
  if (data.deceased_address) document.querySelector("#deceased_address").value = data.deceased_address;
  setRadioValue("pacemaker", data.pacemaker);
  setRadioValue("implant", data.implant);
  setRadioValue("welfare", data.welfare);
  if (data.deceased_hobby) document.querySelector("#deceased_hobby").value = data.deceased_hobby;
  if (data.deceased_color) document.querySelector("#deceased_color").value = data.deceased_color;
  
  // 喪主情報
  if (data.mourner_name) document.querySelector("#mourner_name").value = data.mourner_name;
  if (data.mourner_furigana) document.querySelector("#mourner_furigana").value = data.mourner_furigana;
  if (data.mourner_relation) document.querySelector("#mourner_relation").value = data.mourner_relation;
  if (data.mourner_relation_other) document.querySelector("#mourner_relation_other").value = data.mourner_relation_other;
  if (data.mourner_birth_era) document.querySelector("#mourner_birth_era").value = data.mourner_birth_era;
  if (data.mourner_birth_year) document.querySelector("#mourner_birth_year").value = data.mourner_birth_year;
  if (data.mourner_birth_month) document.querySelector("#mourner_birth_month").value = data.mourner_birth_month;
  if (data.mourner_birth_day) document.querySelector("#mourner_birth_day").value = data.mourner_birth_day;
  if (data.mourner_age) document.querySelector("#mourner_age").value = data.mourner_age;
  if (data.mourner_postal) document.querySelector("#mourner_postal").value = data.mourner_postal;
  if (data.mourner_address) document.querySelector("#mourner_address").value = data.mourner_address;
  if (data.mourner_mobile) document.querySelector("#mourner_mobile").value = data.mourner_mobile;
  if (data.mourner_home) document.querySelector("#mourner_home").value = data.mourner_home;
  
  // 施主・請求先情報
  if (data.same_as_mourner !== undefined) document.querySelector("#same_as_mourner").checked = data.same_as_mourner;
  setRadioValue("payment_method", data.payment_method);
  if (data.billing_name) document.querySelector("#billing_name").value = data.billing_name;
  if (data.billing_furigana) document.querySelector("#billing_furigana").value = data.billing_furigana;
  if (data.billing_relation) document.querySelector("#billing_relation").value = data.billing_relation;
  if (data.billing_relation_other) document.querySelector("#billing_relation_other").value = data.billing_relation_other;
  if (data.billing_birth_era) document.querySelector("#billing_birth_era").value = data.billing_birth_era;
  if (data.billing_birth_year) document.querySelector("#billing_birth_year").value = data.billing_birth_year;
  if (data.billing_birth_month) document.querySelector("#billing_birth_month").value = data.billing_birth_month;
  if (data.billing_birth_day) document.querySelector("#billing_birth_day").value = data.billing_birth_day;
  if (data.billing_age) document.querySelector("#billing_age").value = data.billing_age;
  if (data.billing_postal) document.querySelector("#billing_postal").value = data.billing_postal;
  if (data.billing_address) document.querySelector("#billing_address").value = data.billing_address;
  if (data.billing_mobile) document.querySelector("#billing_mobile").value = data.billing_mobile;
  if (data.billing_home) document.querySelector("#billing_home").value = data.billing_home;
  
  // 宗旨・宗派
  setRadioValue("religion", data.religion);
  if (data.religion_sect_shu) document.querySelector("#religion_sect_shu").value = data.religion_sect_shu;
  if (data.religion_sect_ha) document.querySelector("#religion_sect_ha").value = data.religion_sect_ha;
  if (data.religion_other_text) document.querySelector("#religion_other_text").value = data.religion_other_text;
  
  // 寺院
  setRadioValue("temple", data.temple);
  if (data.temple_name) document.querySelector("#temple_name").value = data.temple_name;
  
  // 納骨先
  setRadioValue("burial", data.burial);
  if (data.burial_place) document.querySelector("#burial_place").value = data.burial_place;
  
  // 仏壇
  setRadioValue("altar", data.altar);
  
  // こだわり
  setCheckboxValues("preferences", data.preferences);
  if (data.preferences_other) document.querySelector("#preferences_other").value = data.preferences_other;
  
  // ========================================
  // データロード後の条件付き表示制御
  // script.jsの関数を再実行して状態を反映
  // ========================================
  if (typeof window.applyConditionalDisplays === 'function') {
    // script.jsが読み込まれている場合
    setTimeout(() => {
      window.applyConditionalDisplays();
    }, 100);
  }
}

// チェックボックスの値を設定するヘルパー関数
function setCheckboxValues(name, values) {
  if (!values) return;
  // 配列として受け取る（kintoneから来るデータは配列）
  const valuesArray = Array.isArray(values) ? values : [];
  document.querySelectorAll(`input[name="${name}"]`).forEach(checkbox => {
    checkbox.checked = valuesArray.includes(checkbox.value);
  });
}

// ラジオボタンの値を設定するヘルパー関数
function setRadioValue(name, value) {
  if (!value) return;
  const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
}

// 保存時のレコード更新
async function saveRecord() {
  const params = new URLSearchParams(location.search);
  const conductId = params.get("id");

  // id が無ければ処理しない
  if (!conductId) {
    alert("ID が無いため保存できません");
    return;
  }

  // 半角スペースを全角スペースに変換する関数
  function spaceToFullWidth(str) {
    if (!str) return str;
    return str.replace(/ /g, '　'); // 半角スペースを全角スペースに
  }

  // チェックボックスの値を取得するヘルパー関数(配列で返す)
  function getCheckboxValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
      .map(cb => cb.value);
  }

  // ラジオボタンの値を取得するヘルパー関数
  function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
  }

  const payload = {
    conductId,
    
    // 当社を知ったきっかけ・ご依頼理由
    trigger: getCheckboxValues("trigger"),
    referrer_name: document.querySelector("#referrer")?.value || '',
    
    // 故人情報
    deceased_name: spaceToFullWidth(document.querySelector("#deceased_name")?.value || ''),
    deceased_furigana: spaceToFullWidth(document.querySelector("#deceased_furigana")?.value || ''),
    deceased_gender: getRadioValue("deceased_gender"),
    deceased_birth_era: document.querySelector("#deceased_birth_era")?.value || '',
    deceased_birth_year: document.querySelector("#deceased_birth_year")?.value || '',
    deceased_birth_month: document.querySelector("#deceased_birth_month")?.value || '',
    deceased_birth_day: document.querySelector("#deceased_birth_day")?.value || '',
    deceased_age: document.querySelector("#deceased_age")?.value || '',
    deceased_death_year: document.querySelector("#deceased_death_year")?.value || '',
    deceased_death_month: document.querySelector("#deceased_death_month")?.value || '',
    deceased_death_day: document.querySelector("#deceased_death_day")?.value || '',
    
    // 逝去時刻（時と分を"HH:MM"形式に変換）
    deceased_death_time: (() => {
      const hour = document.querySelector("#deceased_death_hour")?.value || '';
      const minute = document.querySelector("#deceased_death_minute")?.value || '';
      if (hour && minute) {
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
      }
      return '';
    })(),
    
    deceased_postal: document.querySelector("#deceased_postal")?.value || '',
    deceased_address: document.querySelector("#deceased_address")?.value || '',
    pacemaker: getRadioValue("pacemaker"),
    implant: getRadioValue("implant"),
    welfare: getRadioValue("welfare"),
    deceased_hobby: document.querySelector("#deceased_hobby")?.value || '',
    deceased_color: document.querySelector("#deceased_color")?.value || '',
    
    // 喪主情報
    mourner_name: spaceToFullWidth(document.querySelector("#mourner_name")?.value || ''),
    mourner_furigana: spaceToFullWidth(document.querySelector("#mourner_furigana")?.value || ''),
    mourner_relation: document.querySelector("#mourner_relation")?.value || '',
    mourner_relation_other: document.querySelector("#mourner_relation_other")?.value || '',
    mourner_birth_era: document.querySelector("#mourner_birth_era")?.value || '',
    mourner_birth_year: document.querySelector("#mourner_birth_year")?.value || '',
    mourner_birth_month: document.querySelector("#mourner_birth_month")?.value || '',
    mourner_birth_day: document.querySelector("#mourner_birth_day")?.value || '',
    mourner_age: document.querySelector("#mourner_age")?.value || '',
    mourner_postal: document.querySelector("#mourner_postal")?.value || '',
    mourner_address: document.querySelector("#mourner_address")?.value || '',
    mourner_mobile: document.querySelector("#mourner_mobile")?.value || '',
    mourner_home: document.querySelector("#mourner_home")?.value || '',
    
    // 施主・請求先情報
    same_as_mourner: document.querySelector("#same_as_mourner")?.checked || false,
    payment_method: getRadioValue("payment_method"),
    billing_name: spaceToFullWidth(document.querySelector("#billing_name")?.value || ''),
    billing_furigana: spaceToFullWidth(document.querySelector("#billing_furigana")?.value || ''),
    billing_relation: document.querySelector("#billing_relation")?.value || '',
    billing_relation_other: document.querySelector("#billing_relation_other")?.value || '',
    billing_birth_era: document.querySelector("#billing_birth_era")?.value || '',
    billing_birth_year: document.querySelector("#billing_birth_year")?.value || '',
    billing_birth_month: document.querySelector("#billing_birth_month")?.value || '',
    billing_birth_day: document.querySelector("#billing_birth_day")?.value || '',
    billing_age: document.querySelector("#billing_age")?.value || '',
    billing_postal: document.querySelector("#billing_postal")?.value || '',
    billing_address: document.querySelector("#billing_address")?.value || '',
    billing_mobile: document.querySelector("#billing_mobile")?.value || '',
    billing_home: document.querySelector("#billing_home")?.value || '',
    
    // 宗旨・宗派
    religion: getRadioValue("religion"),
    religion_sect_shu: document.querySelector("#religion_sect_shu")?.value || '',
    religion_sect_ha: document.querySelector("#religion_sect_ha")?.value || '',
    religion_other_text: document.querySelector("#religion_other_text")?.value || '',
    
    // 寺院
    temple: getRadioValue("temple"),
    temple_name: document.querySelector("#temple_name")?.value || '',
    
    // 納骨先
    burial: getRadioValue("burial"),
    burial_place: document.querySelector("#burial_place")?.value || '',
    
    // 仏壇
    altar: getRadioValue("altar"),
    
    // こだわり
    preferences: getCheckboxValues("preferences"),
    preferences_other: document.querySelector("#preferences_other")?.value || ''
  };

  // デバッグ: 送信するデータを確認
  console.log('kintoneに送信するpayload:', payload);

  const res = await fetch("https://ceremonyheart.kkumagai.workers.dev/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("update result:", data);

  alert("保存しました");
}

// グローバルに公開
window.saveRecord = saveRecord;

// ページ読み込み時に実行
loadRecord();
