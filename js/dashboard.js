
window.Dashboard = (() => {
    const $ = id => document.getElementById(id);
    const charts = {};
  
    const number = (value, decimals = 0) => {
      if (value === null || value === undefined || value === "") {
        return "—";
      }
  
      const n = Number(value);
  
      return Number.isFinite(n)
        ? n.toLocaleString("nl-NL", {
            maximumFractionDigits: decimals
          })
        : "—";
    };
  
    function first(activity, keys) {
      for (const key of keys) {
        const value = activity?.[key];
  
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          Number.isFinite(Number(value))
        ) {
          return Number(value);
        }
      }
  
      return null;
    }
  
    const dateOf = a =>
      String(a.start_date_local || a.start_date || "").slice(0, 10);
  
    const duration = a =>
      first(a, ["moving_time", "elapsed_time", "icu_moving_time"]) || 0;
  
    const power = a =>
      first(a, [
        "average_watts",
        "icu_average_watts",
        "average_power",
        "avg_power"
      ]);
  
    const heartRate = a =>
      first(a, ["average_heartrate", "average_hr", "avg_hr"]);
  
    const load = a =>
      first(a, ["icu_training_load", "training_load", "tss"]);
  
    const distance = a =>
      first(a, ["distance", "icu_distance"]);
  
    function escapeHTML(value) {
      return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
    }
  
    function isRace(activity) {
      const text = [
        activity.type,
        activity.name,
        activity.sub_type
      ].filter(Boolean).join(" ").toLowerCase();
  
      return /race|koers|wedstrijd|criterium|road.?race|cycling.?race/.test(text);
    }
  
    function getSelectedActivities() {
      const year = $("yearFilter").value;
      const block = $("blockFilter").value;
  
      return window.DashboardAPI.activities.filter(activity => {
        const date = dateOf(activity);
  
        if (year !== "all" && date.slice(0, 4) !== year) {
          return false;
        }
  
        // Alleen de wedstrijdfilter heeft momenteel een
        // bruikbare automatische classificatie.
        // De overige blokken zijn nog niet geconfigureerd.
        if (block === "race" && !isRace(activity)) return false;
        if (["base", "build", "recovery"].includes(block)) return false;
  
        return true;
      });
    }
  
    function populateYears(activities) {
      const select = $("yearFilter");
      const previous = select.value;
  
      const years = [
        ...new Set(
          activities
            .map(dateOf)
            .filter(Boolean)
            .map(date => date.slice(0, 4))
        )
      ].sort().reverse();
  
      select.innerHTML =
        '<option value="all">Alle beschikbare jaren</option>' +
        years.map(year =>
          `<option value="${escapeHTML(year)}">${escapeHTML(year)}</option>`
        ).join("");
  
      if (years.includes(previous)) {
        select.value = previous;
      }
    }
  
    function drawChart(id, labels, values, color) {
      const canvas = $(id);
  
      if (!canvas || !window.Chart) return;
  
      if (charts[id]) charts[id].destroy();
  
      const dark = document.body.classList.contains("dark-theme");
      const gridColor = dark ? "#26344d" : "#edf0f5";
      const textColor = dark ? "#98a6bf" : "#8791a4";
  
      charts[id] = new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: color,
            borderRadius: 4,
            maxBarThickness: 22
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: textColor,
                maxTicksLimit: 7,
                font: { size: 10 }
              }
            },
            y: {
              beginAtZero: true,
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                maxTicksLimit: 5,
                font: { size: 10 }
              }
            }
          }
        }
      });
    }
  
    function renderActivitiesTable(activities) {
      const rows = [...activities]
        .sort((a, b) => dateOf(b).localeCompare(dateOf(a)))
        .slice(0, 30);
  
      $("activitiesTable").innerHTML = rows.map(activity => {
        const p = power(activity);
        const hr = heartRate(activity);
        const dist = distance(activity);
        const tss = load(activity);
  
        return `
          <tr>
            <td>${escapeHTML(dateOf(activity) || "—")}</td>
            <td>${escapeHTML(activity.name || activity.type || "Activiteit")}</td>
            <td>${number(duration(activity) / 60)} min</td>
            <td>${dist === null ? "—" : number(dist / 1000, 1) + " km"}</td>
            <td>${p === null ? "—" : number(p) + " W"}</td>
            <td>${hr === null ? "—" : number(hr) + " bpm"}</td>
            <td>${tss === null ? "—" : number(tss)}</td>
          </tr>
        `;
      }).join("") || `
        <tr><td colspan="7" class="empty-cell">
          Geen activiteiten gevonden.
        </td></tr>
      `;
    }
  
    function renderRaces(activities) {
      const races = activities.filter(isRace);
  
      $("raceCount").textContent = number(races.length);
  
      $("raceHours").textContent = number(
        races.reduce((sum, a) => sum + duration(a), 0) / 3600,
        1
      );
  
      const powers = races.map(power).filter(v => v !== null);
  
      $("racePower").textContent = powers.length
        ? number(powers.reduce((sum, v) => sum + v, 0) / powers.length) + " W"
        : "—";
  
      $("racesTable").innerHTML = [...races]
        .sort((a, b) => dateOf(b).localeCompare(dateOf(a)))
        .map(a => {
          const p = power(a);
          const hr = heartRate(a);
          const dist = distance(a);
  
          return `
            <tr>
              <td>${escapeHTML(dateOf(a) || "—")}</td>
              <td>${escapeHTML(a.name || a.type || "Koers")}</td>
              <td>${number(duration(a) / 60)} min</td>
              <td>${dist === null ? "—" : number(dist / 1000, 1) + " km"}</td>
              <td>${p === null ? "—" : number(p) + " W"}</td>
              <td>${hr === null ? "—" : number(hr) + " bpm"}</td>
            </tr>
          `;
        }).join("") || `
          <tr><td colspan="6" class="empty-cell">
            Geen als koers herkende activiteiten.
          </td></tr>
        `;
    }
  
    function renderRecovery(activities) {
      const dailyLoad = {};
  
      activities.forEach(activity => {
        const date = dateOf(activity);
        if (!date) return;
  
        dailyLoad[date] ??= 0;
        dailyLoad[date] += load(activity) || 0;
      });
  
      const dates = Object.keys(dailyLoad).sort();
      const heavyDays = dates.filter(date => dailyLoad[date] >= 180);
  
      $("heavyDays").textContent = number(heavyDays.length);
  
      $("meanLoad").textContent = dates.length
        ? number(
            dates.reduce((sum, date) => sum + dailyLoad[date], 0) / dates.length
          )
        : "—";
  
      const recentDates = dates.slice(-42);
  
      drawChart(
        "recoveryLoadChart",
        recentDates.map(date => date.slice(5)),
        recentDates.map(date => dailyLoad[date]),
        recentDates.map(date =>
          dailyLoad[date] >= 180 ? "#e99549" : "#7898ff"
        )
      );
    }
  
    function render() {
      const activities = getSelectedActivities();
  
      $("metricActivities").textContent = number(activities.length);
  
      $("metricHours").textContent = number(
        activities.reduce((sum, a) => sum + duration(a), 0) / 3600,
        1
      );
  
      const powers = activities.map(power).filter(v => v !== null);
      const hrs = activities.map(heartRate).filter(v => v !== null);
  
      $("metricPower").textContent = powers.length
        ? number(powers.reduce((sum, v) => sum + v, 0) / powers.length) + " W"
        : "—";
  
      $("metricHr").textContent = hrs.length
        ? number(hrs.reduce((sum, v) => sum + v, 0) / hrs.length) + " bpm"
        : "—";
  
      const byDay = {};
  
      activities.forEach(activity => {
        const date = dateOf(activity);
        if (!date) return;
  
        byDay[date] ??= { seconds: 0, load: 0 };
        byDay[date].seconds += duration(activity);
        byDay[date].load += load(activity) || 0;
      });
  
      const days = Object.keys(byDay).sort().slice(-42);
  
      drawChart(
        "durationChart",
        days.map(date => date.slice(5)),
        days.map(date => +(byDay[date].seconds / 3600).toFixed(2)),
        "#6f91ff"
      );
  
      drawChart(
        "loadChart",
        days.map(date => date.slice(5)),
        days.map(date => byDay[date].load),
        "#65bd91"
      );
  
      renderActivitiesTable(activities);
      renderRaces(activities);
      renderRecovery(activities);
  
      $("activityCountTag").textContent =
        `${number(activities.length)} activiteiten`;
    }
  
    return {
      render,
      populateYears,
      getSelectedActivities,
      number,
      dateOf,
      duration,
      power,
      heartRate,
      load,
      distance,
      isRace
    };
  })();
  