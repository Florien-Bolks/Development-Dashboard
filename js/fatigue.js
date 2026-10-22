
window.FatiguePage = {
    settings: {
      sprintDuration: 10,
      fatigueMeasure: "kj"
    },
  
    render() {
      const duration = document.getElementById("sprintDuration");
      const measure = document.getElementById("fatigueMeasure");
  
      if (duration) {
        this.settings.sprintDuration = Number(duration.value);
      }
  
      if (measure) {
        this.settings.fatigueMeasure = measure.value;
      }
  
      // Later koppelen aan vermogenssamples per seconde.
      // Bereken voorafgaande arbeid in kJ en eventueel kJ/kg.
      // Bereken daarnaast werk boven FTP of critical power.
      // Sluit de sprint zelf uit van de voorafgaande arbeid.
    }
  };
  
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sprintDuration")
      ?.addEventListener("change", () => window.FatiguePage.render());
  
    document.getElementById("fatigueMeasure")
      ?.addEventListener("change", () => window.FatiguePage.render());
  });
  