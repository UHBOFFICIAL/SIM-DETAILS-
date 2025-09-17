// Popup functionality
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");

// Show popup after delay
setTimeout(() => {
  popup.style.display = "block";
}, 5000);

// Close popup
closePopup.addEventListener("click", () => {
  popup.style.display = "none";
});

// Close popup if clicked outside
window.addEventListener("click", (event) => {
  if (event.target === popup) {
    popup.style.display = "none";
  }
});
