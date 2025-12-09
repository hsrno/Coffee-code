// Toggle  class active
const navbarNav = document.querySelector(".navbar-nav");
//when Coffee menu get clicked
document.querySelector("#coffee-menu").onclick = () => {
  navbarNav.classList.toggle("active");
};

// Toggle class active untuk search form
const searchForm = document.querySelector(".search-form");
const searchBox = document.querySelector("#search-box");
const searchButton = document.querySelector("#search-button");
document.querySelector("#search-button").onclick = (e) => {
  searchForm.classList.toggle("active"); // fungsi toggle adalah utk menambahkan kelas aktiv ketika belum ada, atau jika sudah ada ketika di click maka kelas activenya akan hilang
  searchBox.focus();
  e.preventDefault();
};

const search = document.querySelector("#search-Box");

document.addEventListener("click", function (e) {
  if (!searchButton.contains(e.target) && !searchForm.contains(e.target)) {
    searchForm.classList.remove("active");
  }
});

//when outsidebar get clik navbar menu out
const Coffee = document.querySelector("#coffee-menu");

document.addEventListener("click", function (e) {
  if (!Coffee.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
});
