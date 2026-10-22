
window.DashboardAPI = (() => {
    const WORKER_URL =
      "https://development-dashboard-api.florien.workers.dev";
  
    let activities = [];
    let connected = false;
  
    async function sync(password) {
      const response = await fetch(
        `${WORKER_URL}/api/activities?days=180`,
        {
          method: "GET",
          headers: {
            "X-Dashboard-Password": password
          }
        }
      );
  
      let data;
  
      try {
        data = await response.json();
      } catch {
        throw new Error("De Worker stuurde geen geldige JSON terug.");
      }
  
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Wachtwoord onjuist of geen toegang.");
        }
  
        throw new Error(
          `API-fout (${response.status}). ${data?.error || ""}`
        );
      }
  
      if (
        data?.success !== true ||
        !Array.isArray(data.activities)
      ) {
        throw new Error(
          "Onverwacht API-formaat. Controleer de Worker-response."
        );
      }
  
      activities = data.activities;
      connected = true;
  
      return {
        activities,
        days: data.days ?? 180,
        count: data.count ?? activities.length
      };
    }
  
    return {
      workerUrl: WORKER_URL,
      get activities() {
        return activities;
      },
      get connected() {
        return connected;
      },
      sync
    };
  })();
  