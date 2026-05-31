(function () {
  try {
    var t = localStorage.getItem("theme");
    var theme = t === "light" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    var l = localStorage.getItem("i18nextLng");
    if (l) {
      var lang = l.toLowerCase().split("-")[0];
      document.documentElement.lang = lang === "de" ? "de" : "en";
    }
  } catch (e) {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();
