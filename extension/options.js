const input = document.getElementById("appUrl");
const status = document.getElementById("status");

chrome.storage.sync.get({ appUrl: "http://localhost:3000" }, ({ appUrl }) => {
  input.value = appUrl;
});

document.getElementById("save").addEventListener("click", () => {
  const value = input.value.trim().replace(/\/+$/, "") || "http://localhost:3000";
  chrome.storage.sync.set({ appUrl: value }, () => {
    status.textContent = "Gespeichert ✓";
    setTimeout(() => (status.textContent = ""), 2000);
  });
});
