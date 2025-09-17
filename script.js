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

  let isCnic = number.length === 13 && !isNaN(number);
  if (isCnic) {
    spinner.style.display = "none";
    resultsList.innerHTML = `
      <div style="text-align:center;">
        <h3 style="color:#00fff7;">CNIC Search</h3>
        <p>You can place your custom CNIC message here. For example: "Contact Admin for CNIC details".</p>
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

    if (res.status === 402 || data.result === "Access Not Allowed. Please Contact Owner.") {
      res = await fetch(`https://api.nexoracle.com/details/pak-sim-database-free?apikey=${free_api_key}&q=${query}`);
      data = await res.json();
    }

    spinner.style.display = "none";

    if (!data.result || data.result === "No SIM data found.") {
      resultsList.innerHTML = `
        <div style="text-align:center;">
          <h3 style="color:#00fff7;">No Record Found</h3>
          <p>This number is not available in database. You can show a custom message or link here.</p>
        </div>`;
    } else {
      let table = `
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Number</th><th>CNIC</th><th>Operator</th><th>Address</th><th>Copy</th>
            </tr>
          </thead><tbody>
      `;
      (Array.isArray(data.result) ? data.result : [data.result]).forEach(user => {
        table += `
          <tr>
            <td>${user.name || "N/A"}</td>
            <td>${user.number || "N/A"}</td>
            <td>${user.cnic || "N/A"}</td>
            <td>${user.operator || "N/A"}</td>
            <td>${user.address || "N/A"}</td>
            <td><button class="copy-btn" onclick='copyRow(${JSON.stringify(user)})'>Copy</button></td>
          </tr>`;
      });
      table += "</tbody></table>";
      resultsList.innerHTML = table;
    }

    resultsContainer.classList.remove("hidden");
  } catch (e) {
    spinner.style.display = "none";
    resultsList.innerHTML = `<p style="color:red;text-align:center;">Network error. Please try again later.</p>`;
    resultsContainer.classList.remove("hidden");
  }
});

function copyRow(user) {
  const text = `Name: ${user.name}\nNumber: ${user.number}\nCNIC: ${user.cnic}\nOperator: ${user.operator}\nAddress: ${user.address}`;
  navigator.clipboard.writeText(text);
  alert("Copied:\n" + text);
}

// Popup functionality
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");

setTimeout(() => {
  popup.style.display = "block";
}, 5000);

closePopup.addEventListener("click", () => {
  popup.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === popup) {
    popup.style.display = "none";
  }
});
