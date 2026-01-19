async function loadRecord() {
  const params = new URLSearchParams(location.search);
  const conductId = params.get("id");

  const res = await fetch("https://ceremonyheart.kkumagai.workers.dev/");
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conductId })
  });

  const kintoneData = await res.json();

  // HTML に表示
  document.querySelector("#deceased_name").textContent = kintoneData.record.故人名前.value;
  document.querySelector("#deceased_furigana").textContent = kintoneData.record.故人ふりがな.value;
}
loadRecord();

