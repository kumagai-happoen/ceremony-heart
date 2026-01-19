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
