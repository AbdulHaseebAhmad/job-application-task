document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const value = event.target.value;
      toggleScreen(value);
    });
  });
});

/**
 * @param {string} screename
 *
 */
let prev;
function toggleScreen(screename) {
  if (screename == "main") {
    document.getElementById(`${prev}`).style.display = "none";
    document.getElementById("btn-back").style.display = "none";
    document.getElementById("nav-container").style.display = "block";
    prev = screename;
  } else {
    document.getElementById(`${screename}`).style.display = "block";
    document.getElementById("nav-container").style.display = "none";
    document.getElementById("btn-back").style.display = "block";
    prev = screename;
  }
}
