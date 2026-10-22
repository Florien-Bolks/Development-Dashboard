
(() => {
    const $ = id => document.getElementById(id);
  
    const pageMeta = {
      overview: [
        "Overzicht",
        "Training, prestaties en herstel op één plek."
      ],
      efforts: [
        "Best efforts",
        "Je vermogenscurve en ontwikkeling door het seizoen."
      ],
      races: [
        "Koersen",
        "Sprintprestaties en inspanningen tijdens wedstrijden."
      ],
      fatigue: [
        "Sprint & vermoeidheid",
        "Hoe voorafgaande arbeid samenhangt met sprintvermogen."
      ],
      recovery: [
        "Belasting & herstel",
        "Trainingsbelasting en herstel in de dagen erna."
      ]
    };
  
    function refreshIcons() {
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  
    function setStatus(message, type = "info") {
      const banner = $("statusBanner");
  
      const icon = type === "error"
        ? "alert-circle"
        : type === "success"
          ? "check-circle-2"
          : "info";
  
      banner.className = `notice notice-${type}`;
  
      const iconElement = document.createElement("i");
      iconElement.setAttribute("data-lucide", icon);
  
      const textElement = document.createElement("span");
      textElement.textContent = message;
  
      banner.replaceChildren(iconElement, textElement);
      refreshIcons();
    }
  
    function showPage(page) {
      if (!pageMeta[page]) return;
  
      document.querySelectorAll(".page-view").forEach(element => {
        element.classList.toggle(
          "active",
          element.id === `page-${page}`
        );
      });
  
      document.querySelectorAll("[data-page]").forEach(element => {
        element.classList.toggle(
          "active",
          element.dataset.page === page
        );
      });
  
      $("pageTitle").textContent = pageMeta[page][0];
      $("pageSubtitle").textContent = pageMeta[page][1];
  
      $("sidebar").classList.remove("open");
  
      if (window.DashboardAPI.connected) {
        window.Dashboard.render();
      }
    }
  
    async function synchronize(password) {
      const syncButton = $("syncButton");
      const loginButton = $("loginSubmit");
  
      syncButton.disabled = true;
      loginButton.disabled = true;
  
      setStatus("Gegevens ophalen uit Intervals.icu…");
  
      try {
        const result = await window.DashboardAPI.sync(password);
  
        window.Dashboard.populateYears(result.activities);
        window.Dashboard.render();
  
        $("connectionLabel").textContent = "Verbonden";
        $("footerStatus").textContent = "Verbonden";
  
        $("lastUpdated").textContent =
          "Bijgewerkt " +
          new Date().toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit"
          });
  
        setStatus(
          `${result.activities.length} activiteiten geladen (${result.days} dagen).`,
          "success"
        );
  
        $("loginDialog").close();
        $("passwordInput").value = "";
      } catch (error) {
        setStatus(
          `Synchronisatie mislukt: ${error.message}`,
          "error"
        );
  
        $("loginError").textContent = error.message;
        $("loginError").hidden = false;
  
        throw error;
      } finally {
        syncButton.disabled = false;
        loginButton.disabled = false;
      }
    }
  
    function openLogin() {
      $("loginError").hidden = true;
  
      if (!$("loginDialog").open) {
        $("loginDialog").showModal();
      }
  
      $("passwordInput").focus();
    }
  
    document.querySelectorAll("[data-page]").forEach(button => {
      button.addEventListener("click", () => {
        showPage(button.dataset.page);
      });
    });
  
    document.querySelectorAll("[data-go-page]").forEach(button => {
      button.addEventListener("click", () => {
        showPage(button.dataset.goPage);
      });
    });
  
    $("openLogin").addEventListener("click", openLogin);
    $("topLogin").addEventListener("click", openLogin);
  
    $("loginForm").addEventListener("submit", async event => {
      event.preventDefault();
  
      $("loginError").hidden = true;
  
      const password = $("passwordInput").value;
  
      if (!password) return;
  
      try {
        await synchronize(password);
      } catch {
        // De foutmelding staat in het dashboard.
      }
    });
  
    $("syncButton").addEventListener("click", () => {
      if (window.DashboardAPI.connected) {
        openLogin();
      } else {
        openLogin();
      }
    });
  
    $("yearFilter").addEventListener("change", () => {
      window.Dashboard.render();
    });
  
    $("blockFilter").addEventListener("change", () => {
      const block = $("blockFilter").value;
  
      if (["base", "build", "recovery"].includes(block)) {
        setStatus(
          "Dit trainingsblok is nog niet geconfigureerd. Stel eerst de begin- en einddatums van je trainingsblokken in."
        );
      } else {
        setStatus(
          "De activiteitenfilter is bijgewerkt."
        );
      }
  
      window.Dashboard.render();
    });
  
    $("themeToggle").addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
  
      const dark = document.body.classList.contains("dark-theme");
  
      $("themeToggle").innerHTML = `
        <i data-lucide="${dark ? "sun" : "moon"}"></i>
        <span>${dark ? "Lichte modus" : "Donkere modus"}</span>
      `;
  
      try {
        localStorage.setItem(
          "dashboard-theme",
          dark ? "dark" : "light"
        );
      } catch {
        // Het dashboard blijft werken als opslag niet beschikbaar is.
      }
  
      refreshIcons();
  
      if (window.DashboardAPI.connected) {
        window.Dashboard.render();
      }
    });
  
    $("mobileMenu").addEventListener("click", () => {
      $("sidebar").classList.toggle("open");
    });
  
    try {
      if (localStorage.getItem("dashboard-theme") === "dark") {
        document.body.classList.add("dark-theme");
  
        $("themeToggle").innerHTML =
          '<i data-lucide="sun"></i><span>Lichte modus</span>';
      }
    } catch {
      // Lightmode blijft de standaard.
    }
  
    refreshIcons();
  })();
  