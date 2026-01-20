export interface Planet {
  id: string;
  name: string;
  emoji: string;
  radius: number; // Stylized radius in pixels
  orbitRadius: number; // Distance from sun in pixels
  orbitSpeed: number; // Degrees per frame
  rotationSpeed: number; // Degrees per frame
  color: string;
  colorLight: string;
  colorDark: string;
  diameter: string; // Actual diameter
  distanceFromSun: string;
  orbitalPeriod: string;
  dayLength: string;
  moons: number;
  temperature: string;
  composition: string;
  funFacts: string[];
  discovered: string;
}

export const sun: Planet = {
  id: "sun",
  name: "Sun",
  emoji: "☀️",
  radius: 80,
  orbitRadius: 0,
  orbitSpeed: 0,
  rotationSpeed: 0.1,
  color: "#FDB813",
  colorLight: "#FFF4E0",
  colorDark: "#FF8C00",
  diameter: "1,391,000 km",
  distanceFromSun: "0 km",
  orbitalPeriod: "N/A",
  dayLength: "~27 days (surface)",
  moons: 0,
  temperature: "5,500°C (surface)",
  composition: "Hydrogen, Helium",
  funFacts: [
    "The Sun contains 99.86% of the mass in our solar system",
    "Every second, the Sun converts 4 million tons of matter into energy",
    "Light from the Sun takes about 8 minutes to reach Earth",
    "The Sun's core temperature is about 15 million degrees Celsius"
  ],
  discovered: "Known since prehistory"
};

export const planets: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    emoji: "☿",
    radius: 5,
    orbitRadius: 150,
    orbitSpeed: 0.04,
    rotationSpeed: 0.05,
    color: "#8C7853",
    colorLight: "#BCA888",
    colorDark: "#5C4833",
    diameter: "4,879 km",
    distanceFromSun: "57.9 million km",
    orbitalPeriod: "88 Earth days",
    dayLength: "59 Earth days",
    moons: 0,
    temperature: "-173°C to 427°C",
    composition: "Iron core, rocky mantle",
    funFacts: [
      "Mercury is the smallest planet in our solar system",
      "One day on Mercury lasts about 59 Earth days",
      "Mercury has no atmosphere to trap heat",
      "Named after the Roman messenger god"
    ],
    discovered: "Known since ancient times"
  },
  {
    id: "venus",
    name: "Venus",
    emoji: "♀",
    radius: 12,
    orbitRadius: 210,
    orbitSpeed: 0.03,
    rotationSpeed: -0.02,
    color: "#FFC649",
    colorLight: "#FFE4A0",
    colorDark: "#E5A020",
    diameter: "12,104 km",
    distanceFromSun: "108.2 million km",
    orbitalPeriod: "225 Earth days",
    dayLength: "243 Earth days",
    moons: 0,
    temperature: "462°C (average)",
    composition: "Rocky with thick CO₂ atmosphere",
    funFacts: [
      "Venus rotates backwards compared to most planets",
      "A day on Venus is longer than its year",
      "Venus is the hottest planet despite not being closest to the Sun",
      "Named after the Roman goddess of love and beauty"
    ],
    discovered: "Known since ancient times"
  },
  {
    id: "earth",
    name: "Earth",
    emoji: "🌍",
    radius: 13,
    orbitRadius: 280,
    orbitSpeed: 0.025,
    rotationSpeed: 0.5,
    color: "#4A90E2",
    colorLight: "#87CEEB",
    colorDark: "#1E3A8A",
    diameter: "12,742 km",
    distanceFromSun: "149.6 million km",
    orbitalPeriod: "365.25 days",
    dayLength: "24 hours",
    moons: 1,
    temperature: "15°C (average)",
    composition: "Rocky with water and atmosphere",
    funFacts: [
      "Earth is the only planet not named after a god",
      "70% of Earth's surface is covered by water",
      "Earth's atmosphere is 78% nitrogen and 21% oxygen",
      "The only known planet to support life"
    ],
    discovered: "N/A - Our home planet"
  },
  {
    id: "mars",
    name: "Mars",
    emoji: "♂",
    radius: 7,
    orbitRadius: 350,
    orbitSpeed: 0.02,
    rotationSpeed: 0.45,
    color: "#E27B58",
    colorLight: "#FF9E80",
    colorDark: "#B23A2B",
    diameter: "6,779 km",
    distanceFromSun: "227.9 million km",
    orbitalPeriod: "687 Earth days",
    dayLength: "24.6 hours",
    moons: 2,
    temperature: "-63°C (average)",
    composition: "Rocky with iron oxide dust",
    funFacts: [
      "Mars is called the Red Planet due to iron oxide on its surface",
      "Mars has the largest volcano in the solar system (Olympus Mons)",
      "A day on Mars is almost the same length as an Earth day",
      "Mars has polar ice caps like Earth"
    ],
    discovered: "Known since ancient times"
  },
  {
    id: "jupiter",
    name: "Jupiter",
    emoji: "♃",
    radius: 60,
    orbitRadius: 500,
    orbitSpeed: 0.008,
    rotationSpeed: 0.8,
    color: "#C88B3A",
    colorLight: "#E5B870",
    colorDark: "#8B5A2B",
    diameter: "139,820 km",
    distanceFromSun: "778.5 million km",
    orbitalPeriod: "12 Earth years",
    dayLength: "10 hours",
    moons: 95,
    temperature: "-108°C (average)",
    composition: "Hydrogen, Helium gas giant",
    funFacts: [
      "Jupiter is the largest planet in our solar system",
      "The Great Red Spot is a storm larger than Earth",
      "Jupiter has 95 known moons, including four large Galilean moons",
      "Jupiter's magnetic field is 20,000 times stronger than Earth's"
    ],
    discovered: "Known since ancient times"
  },
  {
    id: "saturn",
    name: "Saturn",
    emoji: "♄",
    radius: 50,
    orbitRadius: 680,
    orbitSpeed: 0.006,
    rotationSpeed: 0.7,
    color: "#FAD5A5",
    colorLight: "#FFEDC9",
    colorDark: "#D4A574",
    diameter: "116,460 km",
    distanceFromSun: "1.43 billion km",
    orbitalPeriod: "29 Earth years",
    dayLength: "10.7 hours",
    moons: 146,
    temperature: "-138°C (average)",
    composition: "Hydrogen, Helium gas giant",
    funFacts: [
      "Saturn's rings are made of billions of ice and rock particles",
      "Saturn has 146 known moons, the most in our solar system",
      "Saturn is the least dense planet - it would float in water",
      "The rings are only about 10 meters thick on average"
    ],
    discovered: "Known since ancient times"
  },
  {
    id: "uranus",
    name: "Uranus",
    emoji: "♅",
    radius: 26,
    orbitRadius: 820,
    orbitSpeed: 0.004,
    rotationSpeed: -0.4,
    color: "#4FD0E7",
    colorLight: "#87E8F7",
    colorDark: "#2BA6C2",
    diameter: "50,724 km",
    distanceFromSun: "2.87 billion km",
    orbitalPeriod: "84 Earth years",
    dayLength: "17.2 hours",
    moons: 27,
    temperature: "-195°C (average)",
    composition: "Water, methane, ammonia ices",
    funFacts: [
      "Uranus rotates on its side at a 98-degree angle",
      "A collision may have caused its unusual tilt",
      "Uranus appears cyan due to methane in its atmosphere",
      "Seasons on Uranus last about 21 Earth years each"
    ],
    discovered: "1781 by William Herschel"
  },
  {
    id: "neptune",
    name: "Neptune",
    emoji: "♆",
    radius: 25,
    orbitRadius: 950,
    orbitSpeed: 0.003,
    rotationSpeed: 0.5,
    color: "#4166F5",
    colorLight: "#7B9BFF",
    colorDark: "#1E3AA8",
    diameter: "49,244 km",
    distanceFromSun: "4.5 billion km",
    orbitalPeriod: "165 Earth years",
    dayLength: "16 hours",
    moons: 14,
    temperature: "-201°C (average)",
    composition: "Water, methane, ammonia ices",
    funFacts: [
      "Neptune has the strongest winds in the solar system (2,100 km/h)",
      "Neptune was the first planet located using mathematics",
      "It takes 165 years for Neptune to orbit the Sun once",
      "Neptune's blue color comes from methane in its atmosphere"
    ],
    discovered: "1846 by Johann Galle"
  },
  {
    id: "pluto",
    name: "Pluto",
    emoji: "♇",
    radius: 4,
    orbitRadius: 1100,
    orbitSpeed: 0.002,
    rotationSpeed: 0.15,
    color: "#ECE6D9",
    colorLight: "#FFFFFF",
    colorDark: "#B8AFA0",
    diameter: "2,377 km",
    distanceFromSun: "5.9 billion km",
    orbitalPeriod: "248 Earth years",
    dayLength: "6.4 Earth days",
    moons: 5,
    temperature: "-223°C (average)",
    composition: "Ice and rock",
    funFacts: [
      "Pluto was reclassified as a dwarf planet in 2006",
      "Pluto's largest moon, Charon, is half its size",
      "A year on Pluto is 248 Earth years",
      "Pluto has a heart-shaped glacier called Tombaugh Regio"
    ],
    discovered: "1930 by Clyde Tombaugh"
  }
];

export const allCelestialBodies = [sun, ...planets];

export const planetCategories = {
  all: "All Bodies",
  inner: "Inner Planets",
  outer: "Outer Planets",
  gas: "Gas Giants"
};

export function getPlanetsByCategory(category: string): Planet[] {
  switch (category) {
    case "inner":
      return planets.filter(p => ["mercury", "venus", "earth", "mars"].includes(p.id));
    case "outer":
      return planets.filter(p => ["jupiter", "saturn", "uranus", "neptune", "pluto"].includes(p.id));
    case "gas":
      return planets.filter(p => ["jupiter", "saturn", "uranus", "neptune"].includes(p.id));
    default:
      return planets;
  }
}
