
window.RecoveryPage = {
    settings: {
      heavyLoadThreshold: 180,
      baselineDays: 14,
      daysBefore: 3,
      daysAfter: 5
    },
  
    render() {
      // De dagelijkse trainingsbelasting wordt al berekend
      // in dashboard.js.
      //
      // Voor een volledige herstelanalyse zijn extra gegevens
      // nodig:
      // - dagelijkse HRV;
      // - dagelijkse rusthartslag;
      // - bij voorkeur slaap- en herstelmetingen;
      // - eventueel subjectieve vermoeidheid.
      //
      // Vergelijk deze waarden met een persoonlijke baseline.
      // Bereken geen herstelconclusies zolang de data ontbreekt.
    }
  };
  