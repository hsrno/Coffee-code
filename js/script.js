// Toggle  class active
const navbarNav = document.querySelector(".navbar-nav");
//when Coffee menu get clicked
document.querySelector("#coffee-menu").onclick = () => {
  navbarNav.classList.toggle("active");
};

//when outsidebar get clik navbar menu out
const Coffee = document.querySelector("#coffee-menu");

document.addEventListener("click", function (e) {
  if (!Coffee.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
});
