document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");
  const spinner = document.getElementById("spinner");
  const resultsContainer = document.getElementById("resultsContainer");
  const resultsList = document.getElementById("resultsList");

  searchBtn.addEventListener("click", async () => {
    const number = searchInput.value.trim();
    resultsList.innerHTML = "";
    resultsContainer.classList.add("hidden");
    spinner.style.display = "block";

    if (!number) {
      spinner.style.display = "none";
      resultsList.innerHTML = `<p style="color:#ff6666;text-align:center;">Please enter a number.</p>`;
      resultsContainer.classList.remove("hidden");
      return;
    }

    // CNIC check
    let isCnic = number.length === 13 && !isNaN(number);
    if (isCnic) {
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

      // fallback to free API
      if (res.status === 402 || (data && data.result === "Access Not Allowed. Please Contact Owner.")) {
        res = await fetch(`https://api.nexoracle.com/details/pak-sim-database-free?apikey=${free_api_key}&q=${query}`);
        data = await res.json();
      }

      spinner.style.display = "none";

      // ==== No Data Check ====
      if (
        !data ||
        !data.result ||
        data.result === "No SIM data found." ||
        (Array.isArray(data.result) && data.result.length === 0)
      ) {
        resultsList.innerHTML = `
          <div style="text-align:center; padding:18px;">
            <h3 style="color:#ffb86b;">No Record Found</h3>
            <p style="color:#ddd;">This number is not available in our database. Please try another number.</p>
          </div>`;
        resultsContainer.classList.remove("hidden");
        return; // IMPORTANT: Stop here, do not build table
      }

      // ==== Valid Data => Show Table ====
      let table = `
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Number</th><th>CNIC</th><th>Operator</th><th>Address</th><th>Copy</th>
            </tr>
          </thead><tbody>
      `;

      const resultsArray = Array.isArray(data.result) ? data.result : [data.result];
      resultsArray.forEach(user => {
        // only add rows if at least one field has real value
        if (user.name || user.number || user.cnic || user.operator || user.address) {
          table += `
            <tr>
              <td>${user.name || "N/A"}</td>
              <td>${user.number || "N/A"}</td>
              <td>${user.cnic || "N/A"}</td>
              <td>${user.operator || "N/A"}</td>
              <td>${user.address || "N/A"}</td>
              <td><button class="copy-btn" onclick='copyRow(${JSON.stringify(user)})'>Copy</button></td>
            </tr>`;
        }
      });

      table += "</tbody></table>";
      resultsList.innerHTML = table;
      resultsContainer.classList.remove("hidden");

    } catch (e) {
      spinner.style.display = "none";
      resultsList.innerHTML = `<p style="color:red;text-align:center;">Network error. Please try again later.</p>`;
      resultsContainer.classList.remove("hidden");
    }
  });

  // Copy Function
  window.copyRow = function(user) {
    const text = `Name: ${user.name}\nNumber: ${user.number}\nCNIC: ${user.cnic}\nOperator: ${user.operator}\nAddress: ${user.address}`;
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied:\n" + text);
    });
  };

  /* ----------------- Popup logic ----------------- */
  const popup = document.getElementById("popup");
  const popupClose = document.getElementById("popupClose");
  const popupSkip = document.getElementById("popupSkip");
  const siteContent = document.getElementById("site-content");

  function showPopup() {
    popup.style.display = "flex";
    siteContent.classList.add("blurred");
  }

  function hidePopup() {
    popup.style.display = "none";
    siteContent.classList.remove("blurred");
  }

  // show popup on load
  showPopup();

  popupClose?.addEventListener("click", hidePopup);
  popupSkip?.addEventListener("click", hidePopup);
  popup.addEventListener("click", e => {
    if (e.target === popup) hidePopup();
  });
});
