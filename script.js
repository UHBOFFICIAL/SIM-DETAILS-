document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const spinner = document.getElementById("spinner");
  const resultsContainer = document.getElementById("resultsContainer");
  const resultsList = document.getElementById("resultsList");

  // ✅ Center Notification function
  function showNotification(msg) {
    const notification = document.getElementById("notification");
    if (!notification) return;
    notification.innerHTML = msg;
    notification.classList.remove("hidden");
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.classList.add("hidden"), 400);
    }, 4000);
  }

  searchBtn.addEventListener("click", async () => {
    const number = searchInput.value.trim();
    resultsList.innerHTML = "";
    resultsContainer.classList.add("hidden");
    spinner.style.display = "block";

    if (!number) {
      spinner.style.display = "none";
      showNotification("Please enter a number.");
      return;
    }

    // CNIC check
    if (number.length === 13 && !isNaN(number)) {
      spinner.style.display = "none";
      resultsList.innerHTML = `
        <div style="text-align:center; padding:15px;">
          <h3 style="color:#00fff7;">CNIC Search</h3>
          <p>Contact admin for CNIC details.</p>
        </div>`;
      resultsContainer.classList.remove("hidden");
      return;
    }

    const paid_api_key = "49d32e2308c704f3fa";
    const free_api_key = "free_key@maher_apis";
    let query = number.startsWith("0") ? number.substring(1) : number;

    try {
      let res = await fetch(`https://api.nexoracle.com/details/pak-sim-database?apikey=${paid_api_key}&q=${query}`);
      let data = await res.json();

      // fallback
      if (res.status === 402 || (data && data.result === "Access Not Allowed. Please Contact Owner.")) {
        res = await fetch(`https://api.nexoracle.com/details/pak-sim-database-free?apikey=${free_api_key}&q=${query}`);
        data = await res.json();
      }

      spinner.style.display = "none";

      // ✅ No Data => Center Notification
      if (!data || !data.result || data.result === "No SIM data found." || (Array.isArray(data.result) && data.result.length === 0)) {
        showNotification("اس نمبر کا ڈیٹا موجود نہیں ہے ۔<br>Paid Services کیلئے Admin سے رابطہ کریں");
        return;
      }

      // ✅ Show Table if Data Exists
      let table = `
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Number</th><th>CNIC</th><th>Operator</th><th>Address</th><th>Copy</th>
            </tr>
          </thead><tbody>
      `;
      const resultsArray = Array.isArray(data.result) ? data.result : [data.result];

      let validDataFound = false;

      resultsArray.forEach(user => {
        // normalize fields to strings
        const name = (user && user.name) ? String(user.name) : "";
        const numberField = (user && user.number) ? String(user.number) : "";
        const cnic = (user && user.cnic) ? String(user.cnic) : "";
        const operator = (user && user.operator) ? String(user.operator) : "";
        const address = (user && user.address) ? String(user.address) : "";

        // Trimmed values for checks
        const vals = [name, numberField, cnic, operator, address].map(v => v.trim());

        // Consider invalid if empty/whitespace or common placeholders like "-" or "----" or "____"
        const allInvalid = vals.every(val =>
          val === "" || val === "-" || val === "----" || val === "____"
        );

        if (!allInvalid) {
          validDataFound = true;
          table += `
            <tr>
              <td>${name || "-"}</td>
              <td>${numberField || "-"}</td>
              <td>${cnic || "-"}</td>
              <td>${operator || "-"}</td>
              <td>${address || "-"}</td>
              <td><button class="copy-btn" onclick='copyRow(${JSON.stringify(user)})'>Copy</button></td>
            </tr>`;
        }
      });

      table += "</tbody></table>";

      // ✅ Agar saara data invalid tha → notification dikhado
      if (!validDataFound) {
        showNotification("اس نمبر کا ڈیٹا موجود نہیں ہے ۔<br>Paid Services کیلئے Admin سے رابطہ کریں");
        return;
      }

      resultsList.innerHTML = table;
      resultsContainer.classList.remove("hidden");
    } catch (e) {
      spinner.style.display = "none";
      showNotification("Network error. Please try again later.");
    }
  });

  // Copy function
  window.copyRow = function(user) {
    const text = `Name: ${user.name}\nNumber: ${user.number}\nCNIC: ${user.cnic}\nOperator: ${user.operator}\nAddress: ${user.address}`;
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied:\n" + text);
    }).catch(() => {
      alert("Could not copy to clipboard.");
    });
  };

  /* ----------------- Popup logic ----------------- */
  const popup = document.getElementById("popup");
  const popupClose = document.getElementById("popupClose");

  function showPopup() {
    if (!popup) return;
    popup.style.display = "flex";
  }
  function hidePopup() {
    if (!popup) return;
    popup.style.display = "none";
  }
  showPopup();
  popupClose?.addEventListener("click", hidePopup);
  popup.addEventListener("click", e => { if (e.target === popup) hidePopup(); });
});
