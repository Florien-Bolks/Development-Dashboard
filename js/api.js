
window.DashboardAPI = (() => {
    const WORKER_URL =
      "https://development-dashboard-api.florien.workers.dev";
  
    let activities = [];
    let connected = false;
  
    async function sync(password) {
      let response;
  
      try {
        response = await fetch(WORKER_URL, {
          method: "GET",
          headers: {
            "X-Dashboard-Password": password,
            "Accept": "application/json"
          },
          cache: "no-store"
        });
      } catch (error) {
        connected = false;
  
        throw new Error(
          "Kan geen verbinding maken met de Worker. " +
          "Controleer de Worker-URL, CORS-instellingen en netwerkverbinding."
        );
      }
  
      let data;
  
      try {
        data = await response.json();
      } catch {
        connected = false;
        throw new Error(
          `De Worker stuurde geen geldige JSON terug (HTTP ${response.status}).`
        );
      }
  
      if (!response.ok) {
        connected = false;
  
        if (response.status === 401 || response.status === 403) {
          throw new Error("Wachtwoord onjuist of geen toegang.");
        }
  
        throw new Error(
          `API-fout (${response.status}). ${data?.error || data?.message || ""}`
        );
      }
  
      if (data?.success !== true || !Array.isArray(data.activities)) {
        connected = false;
  
        throw new Error(
          "Onverwacht API-formaat. Controleer de Worker-response."
        );
      }
  
      activities = data.activities;
      connected = true;
  
      return {
        activities,
        days: data.days ?? null,
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
  