window.jsPDF = window.jspdf?.jsPDF;

function closePopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "none";
}

function showNotification(title, message, type = "info", duration = 5000) {
  const notification = document.getElementById("notification");
  document.getElementById("notification-title").textContent = title;
  document.getElementById("notification-message").textContent = message;

  notification.className = "notification";
  notification.classList.add("show");
  setTimeout(() => notification.classList.remove("show"), duration);
}

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const spinner = document.getElementById("spinner");
const resultsContainer = document.getElementById("resultsContainer");
const resultsList = document.getElementById("resultsList");

searchBtn.addEventListener("click", async () => {
  const number = searchInput.value.trim();
  if (!number) {
    showNotification("Error", "Please enter a valid number", "error");
    return;
  }

  resultsList.innerHTML = "";
  resultsContainer.classList.add("hidden");
  spinner.style.display = "block";

  const paid_api_key = "49d32e2308c704f3fa";
  const free_api_key = "free_key@maher_apis";
  let query = number.startsWith("0") ? number.substring(1) : number;

  try {
    let res = await fetch(`https://api.nexoracle.com/details/pak-sim-database?apikey=${paid_api_key}&q=${query}`);
    let data = await res.json();

    if (res.status === 402 || data.result === "Access Not Allowed. Please Contact Owner.") {
      showNotification("Info", "Using Free API as Paid API is not accessible");
      res = await fetch(`https://api.nexoracle.com/details/pak-sim-database-free?apikey=${free_api_key}&q=${query}`);
      data = await res.json();
    }

    spinner.style.display = "none";

    if (!data.result || data.result === "No SIM data found.") {
      resultsList.innerHTML = "<p>❌ No records found for this number.</p>";
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
          </tr>
        `;
      });
      table += "</tbody></table>";
      resultsList.innerHTML = table;
    }

    resultsContainer.classList.remove("hidden");
  } catch (e) {
    spinner.style.display = "none";
    showNotification("Error", "Network Error! Please try again later.", "error");
  }
});

function copyRow(user) {
  const text = `Name: ${user.name}\nNumber: ${user.number}\nCNIC: ${user.cnic}\nOperator: ${user.operator}\nAddress: ${user.address}`;
  navigator.clipboard.writeText(text);
  showNotification("Copied", "Details copied to clipboard", "success");
    }
