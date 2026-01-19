// ロード時のレコード取得
async function loadRecord() {
  const params = new URLSearchParams(location.search);
  const conductId = params.get("id");

  const res = await fetch("https://ceremonyheart.kkumagai.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conductId })
  });

  const data = await res.json();

  // HTML に表示
  document.querySelector("#deceased_name").value = data.deceased_name;
  document.querySelector("#deceased_furigana").value = data.deceased_furigana;
}
loadRecord();

// 保存時のレコード更新
async function saveRecord() {
  const params = new URLSearchParams(location.search);
  const conductId = params.get("id");

  const payload = {
    conductId,
    deceased_name: document.querySelector("#deceased_name").value,
    deceased_furigana: document.querySelector("#deceased_furigana").value
  };

  const res = await fetch("https://ceremonyheart.kkumagai.workers.dev/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("update result:", data);

  alert("保存しました");
}
