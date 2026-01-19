async function testWorkers() {
  const res = await fetch("https://ceremonyheart.kkumagai.workers.dev/");
  const text = await res.text();
  console.log("Workers response:", text);
}
testWorkers();