import type { Driver, Vehicle } from "@/types/ontology";

/**
 * Synthetic Ontology-aligned `Driver` + `Vehicle` pairs for AIP matchmaking,
 * demos, and local mock stores. Each `driver.vehicleId` matches `vehicle.id`.
 */
export interface SyntheticDriverVehicle {
  driver: Driver;
  vehicle: Vehicle;
}

export const SYNTHETIC_MATCHMAKING_SEED: SyntheticDriverVehicle[] = [
  {
    vehicle: {
      id: "veh-syn-001",
      make: "Toyota",
      model: "GR Supra 3.0",
      year: 2023,
      horsepower: 382,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-001",
      username: "2JZWhisperer",
      vehicleId: "veh-syn-001",
      eloRating: 1642,
    },
  },
  {
    vehicle: {
      id: "veh-syn-002",
      make: "Nissan",
      model: "GT-R Nismo",
      year: 2021,
      horsepower: 600,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-002",
      username: "GodzillaGrip",
      vehicleId: "veh-syn-002",
      eloRating: 1987,
    },
  },
  {
    vehicle: {
      id: "veh-syn-003",
      make: "Honda",
      model: "Civic Type R",
      year: 2023,
      horsepower: 315,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-003",
      username: "VtecSociety",
      vehicleId: "veh-syn-003",
      eloRating: 1420,
    },
  },
  {
    vehicle: {
      id: "veh-syn-004",
      make: "Mazda",
      model: "RX-7 Spirit R",
      year: 2002,
      horsepower: 276,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-004",
      username: "RotaryKing",
      vehicleId: "veh-syn-004",
      eloRating: 1588,
    },
  },
  {
    vehicle: {
      id: "veh-syn-005",
      make: "Subaru",
      model: "WRX STI",
      year: 2019,
      horsepower: 310,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-005",
      username: "BoostedBoxer",
      vehicleId: "veh-syn-005",
      eloRating: 1311,
    },
  },
  {
    vehicle: {
      id: "veh-syn-006",
      make: "Mitsubishi",
      model: "Lancer Evolution X",
      year: 2015,
      horsepower: 291,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-006",
      username: "EvoTrackRat",
      vehicleId: "veh-syn-006",
      eloRating: 1495,
    },
  },
  {
    vehicle: {
      id: "veh-syn-007",
      make: "Lexus",
      model: "RC F",
      year: 2020,
      horsepower: 472,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-007",
      username: "V8Touge",
      vehicleId: "veh-syn-007",
      eloRating: 1366,
    },
  },
  {
    vehicle: {
      id: "veh-syn-008",
      make: "Acura",
      model: "NSX",
      year: 2019,
      horsepower: 573,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-008",
      username: "HybridHunter",
      vehicleId: "veh-syn-008",
      eloRating: 2012,
    },
  },
  {
    vehicle: {
      id: "veh-syn-009",
      make: "Toyota",
      model: "GR Corolla Circuit",
      year: 2024,
      horsepower: 300,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-009",
      username: "ThreeCylinderTerror",
      vehicleId: "veh-syn-009",
      eloRating: 1274,
    },
  },
  {
    vehicle: {
      id: "veh-syn-010",
      make: "Nissan",
      model: "Z Performance",
      year: 2023,
      horsepower: 400,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-010",
      username: "FairladyFlyby",
      vehicleId: "veh-syn-010",
      eloRating: 1398,
    },
  },
  {
    vehicle: {
      id: "veh-syn-011",
      make: "Honda",
      model: "S2000",
      year: 2008,
      horsepower: 237,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-011",
      username: "ApexHunter",
      vehicleId: "veh-syn-011",
      eloRating: 1723,
    },
  },
  {
    vehicle: {
      id: "veh-syn-012",
      make: "Mazda",
      model: "MX-5 Miata",
      year: 2022,
      horsepower: 205,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-012",
      username: "MiataIsAlwaysAnswer",
      vehicleId: "veh-syn-012",
      eloRating: 1129,
    },
  },
  {
    vehicle: {
      id: "veh-syn-013",
      make: "Subaru",
      model: "BRZ tS",
      year: 2024,
      horsepower: 228,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-013",
      username: "DriftPanda",
      vehicleId: "veh-syn-013",
      eloRating: 1044,
    },
  },
  {
    vehicle: {
      id: "veh-syn-014",
      make: "Infiniti",
      model: "Q60 Red Sport 400",
      year: 2022,
      horsepower: 400,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-014",
      username: "TwinTurboTea",
      vehicleId: "veh-syn-014",
      eloRating: 1188,
    },
  },
  {
    vehicle: {
      id: "veh-syn-015",
      make: "Lexus",
      model: "IS 500 F Sport",
      year: 2023,
      horsepower: 472,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-015",
      username: "NaturallyAspirated",
      vehicleId: "veh-syn-015",
      eloRating: 1247,
    },
  },
  {
    vehicle: {
      id: "veh-syn-016",
      make: "Toyota",
      model: "GR86 Premium",
      year: 2023,
      horsepower: 228,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-016",
      username: "TougePhantom",
      vehicleId: "veh-syn-016",
      eloRating: 1456,
    },
  },
  {
    vehicle: {
      id: "veh-syn-017",
      make: "Mitsubishi",
      model: "3000GT VR-4",
      year: 1999,
      horsepower: 320,
      class: "JDM",
    },
    driver: {
      id: "drv-syn-017",
      username: "ActiveAeroAndy",
      vehicleId: "veh-syn-017",
      eloRating: 987,
    },
  },
  {
    vehicle: {
      id: "veh-syn-018",
      make: "BMW",
      model: "M3 Competition",
      year: 2023,
      horsepower: 503,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-018",
      username: "RingRat",
      vehicleId: "veh-syn-018",
      eloRating: 1884,
    },
  },
  {
    vehicle: {
      id: "veh-syn-019",
      make: "BMW",
      model: "M4 CSL",
      year: 2023,
      horsepower: 543,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-019",
      username: "CarbonCreep",
      vehicleId: "veh-syn-019",
      eloRating: 2120,
    },
  },
  {
    vehicle: {
      id: "veh-syn-020",
      make: "Porsche",
      model: "911 GT3 RS",
      year: 2023,
      horsepower: 518,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-020",
      username: "WingThing",
      vehicleId: "veh-syn-020",
      eloRating: 2341,
    },
  },
  {
    vehicle: {
      id: "veh-syn-021",
      make: "Porsche",
      model: "718 Cayman GT4 RS",
      year: 2022,
      horsepower: 493,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-021",
      username: "MidEngineMenace",
      vehicleId: "veh-syn-021",
      eloRating: 2198,
    },
  },
  {
    vehicle: {
      id: "veh-syn-022",
      make: "Audi",
      model: "RS3",
      year: 2023,
      horsepower: 401,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-022",
      username: "FiveCylinderFiend",
      vehicleId: "veh-syn-022",
      eloRating: 1566,
    },
  },
  {
    vehicle: {
      id: "veh-syn-023",
      make: "Audi",
      model: "R8 V10 Performance",
      year: 2022,
      horsepower: 602,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-023",
      username: "QuattroQueen",
      vehicleId: "veh-syn-023",
      eloRating: 2066,
    },
  },
  {
    vehicle: {
      id: "veh-syn-024",
      make: "Mercedes-Benz",
      model: "AMG C63 S",
      year: 2020,
      horsepower: 503,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-024",
      username: "BiturboBaron",
      vehicleId: "veh-syn-024",
      eloRating: 1677,
    },
  },
  {
    vehicle: {
      id: "veh-syn-025",
      make: "Mercedes-Benz",
      model: "AMG GT 63 S",
      year: 2022,
      horsepower: 630,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-025",
      username: "Panamericana",
      vehicleId: "veh-syn-025",
      eloRating: 1923,
    },
  },
  {
    vehicle: {
      id: "veh-syn-026",
      make: "Volkswagen",
      model: "Golf R",
      year: 2023,
      horsepower: 315,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-026",
      username: "HatchbackHooligan",
      vehicleId: "veh-syn-026",
      eloRating: 1289,
    },
  },
  {
    vehicle: {
      id: "veh-syn-027",
      make: "BMW",
      model: "M2 Competition",
      year: 2020,
      horsepower: 405,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-027",
      username: "ShortWheelbase",
      vehicleId: "veh-syn-027",
      eloRating: 1744,
    },
  },
  {
    vehicle: {
      id: "veh-syn-028",
      make: "Audi",
      model: "RS6 Avant",
      year: 2023,
      horsepower: 591,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-028",
      username: "WagonWednesday",
      vehicleId: "veh-syn-028",
      eloRating: 1811,
    },
  },
  {
    vehicle: {
      id: "veh-syn-029",
      make: "Mercedes-Benz",
      model: "E63 S AMG",
      year: 2021,
      horsepower: 603,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-029",
      username: "SleeperEstate",
      vehicleId: "veh-syn-029",
      eloRating: 1699,
    },
  },
  {
    vehicle: {
      id: "veh-syn-030",
      make: "Porsche",
      model: "Taycan Turbo S",
      year: 2023,
      horsepower: 750,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-030",
      username: "SilentLaunch",
      vehicleId: "veh-syn-030",
      eloRating: 1988,
    },
  },
  {
    vehicle: {
      id: "veh-syn-031",
      make: "Alfa Romeo",
      model: "Giulia Quadrifoglio",
      year: 2022,
      horsepower: 505,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-031",
      username: "ItalianStallion",
      vehicleId: "veh-syn-031",
      eloRating: 1522,
    },
  },
  {
    vehicle: {
      id: "veh-syn-032",
      make: "Lotus",
      model: "Emira V6 First Edition",
      year: 2023,
      horsepower: 400,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-032",
      username: "LightIsRight",
      vehicleId: "veh-syn-032",
      eloRating: 1788,
    },
  },
  {
    vehicle: {
      id: "veh-syn-033",
      make: "Aston Martin",
      model: "Vantage",
      year: 2021,
      horsepower: 503,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-033",
      username: "BondNotIncluded",
      vehicleId: "veh-syn-033",
      eloRating: 1855,
    },
  },
  {
    vehicle: {
      id: "veh-syn-034",
      make: "BMW",
      model: "i4 M50",
      year: 2023,
      horsepower: 536,
      class: "Euro",
    },
    driver: {
      id: "drv-syn-034",
      username: "TorqueVectorTom",
      vehicleId: "veh-syn-034",
      eloRating: 1411,
    },
  },
  {
    vehicle: {
      id: "veh-syn-035",
      make: "Ford",
      model: "Mustang GT",
      year: 2022,
      horsepower: 450,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-035",
      username: "CoyoteHowl",
      vehicleId: "veh-syn-035",
      eloRating: 1333,
    },
  },
  {
    vehicle: {
      id: "veh-syn-036",
      make: "Ford",
      model: "Mustang Shelby GT500",
      year: 2022,
      horsepower: 760,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-036",
      username: "BoostedV8",
      vehicleId: "veh-syn-036",
      eloRating: 2089,
    },
  },
  {
    vehicle: {
      id: "veh-syn-037",
      make: "Dodge",
      model: "Challenger SRT Hellcat",
      year: 2021,
      horsepower: 717,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-037",
      username: "WidebodyWednesday",
      vehicleId: "veh-syn-037",
      eloRating: 1655,
    },
  },
  {
    vehicle: {
      id: "veh-syn-038",
      make: "Dodge",
      model: "Charger Scat Pack Widebody",
      year: 2023,
      horsepower: 485,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-038",
      username: "FourDoorFury",
      vehicleId: "veh-syn-038",
      eloRating: 1220,
    },
  },
  {
    vehicle: {
      id: "veh-syn-039",
      make: "Chevrolet",
      model: "Camaro SS 1LE",
      year: 2020,
      horsepower: 455,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-039",
      username: "LSswapLater",
      vehicleId: "veh-syn-039",
      eloRating: 1388,
    },
  },
  {
    vehicle: {
      id: "veh-syn-040",
      make: "Chevrolet",
      model: "Camaro ZL1",
      year: 2022,
      horsepower: 650,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-040",
      username: "SuperchargedSam",
      vehicleId: "veh-syn-040",
      eloRating: 1892,
    },
  },
  {
    vehicle: {
      id: "veh-syn-041",
      make: "Chevrolet",
      model: "Corvette Stingray",
      year: 2023,
      horsepower: 495,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-041",
      username: "StingraySteve",
      vehicleId: "veh-syn-041",
      eloRating: 1966,
    },
  },
  {
    vehicle: {
      id: "veh-syn-042",
      make: "Chevrolet",
      model: "Corvette Z06",
      year: 2023,
      horsepower: 670,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-042",
      username: "FlatPlaneCrank",
      vehicleId: "veh-syn-042",
      eloRating: 2488,
    },
  },
  {
    vehicle: {
      id: "veh-syn-043",
      make: "Cadillac",
      model: "CT5-V Blackwing",
      year: 2023,
      horsepower: 668,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-043",
      username: "LuxuryBurnout",
      vehicleId: "veh-syn-043",
      eloRating: 1712,
    },
  },
  {
    vehicle: {
      id: "veh-syn-044",
      make: "Jeep",
      model: "Grand Cherokee Trackhawk",
      year: 2021,
      horsepower: 707,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-044",
      username: "SUVFromHell",
      vehicleId: "veh-syn-044",
      eloRating: 1544,
    },
  },
  {
    vehicle: {
      id: "veh-syn-045",
      make: "Tesla",
      model: "Model S Plaid",
      year: 2023,
      horsepower: 1000,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-045",
      username: "LudicrousMode",
      vehicleId: "veh-syn-045",
      eloRating: 2234,
    },
  },
  {
    vehicle: {
      id: "veh-syn-046",
      make: "Ford",
      model: "F-150 Raptor R",
      year: 2023,
      horsepower: 700,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-046",
      username: "DesertRunner",
      vehicleId: "veh-syn-046",
      eloRating: 1199,
    },
  },
  {
    vehicle: {
      id: "veh-syn-047",
      make: "Dodge",
      model: "Charger SRT Hellcat Redeye",
      year: 2022,
      horsepower: 797,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-047",
      username: "RedeyeRick",
      vehicleId: "veh-syn-047",
      eloRating: 1876,
    },
  },
  {
    vehicle: {
      id: "veh-syn-048",
      make: "Ford",
      model: "Mustang Mach 1",
      year: 2021,
      horsepower: 480,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-048",
      username: "ShakerHood",
      vehicleId: "veh-syn-048",
      eloRating: 1467,
    },
  },
  {
    vehicle: {
      id: "veh-syn-049",
      make: "Chevrolet",
      model: "Silverado RST",
      year: 2022,
      horsepower: 420,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-049",
      username: "TruckYeah",
      vehicleId: "veh-syn-049",
      eloRating: 892,
    },
  },
  {
    vehicle: {
      id: "veh-syn-050",
      make: "Dodge",
      model: "Durango SRT Hellcat",
      year: 2021,
      horsepower: 710,
      class: "Muscle",
    },
    driver: {
      id: "drv-syn-050",
      username: "FamilyCarMyFoot",
      vehicleId: "veh-syn-050",
      eloRating: 512,
    },
  },
];

/** Flattened vehicles for stores that index by `Vehicle` rows. */
export const SYNTHETIC_VEHICLES: Vehicle[] = SYNTHETIC_MATCHMAKING_SEED.map(
  (row) => row.vehicle,
);

/** Flattened drivers for stores that index by `Driver` rows. */
export const SYNTHETIC_DRIVERS: Driver[] = SYNTHETIC_MATCHMAKING_SEED.map(
  (row) => row.driver,
);
