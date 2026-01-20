import { Planet } from "./planets";

export interface PlanetDot {
  lng: number;
  lat: number;
  color: string;
  type?: string;
}

// Generate procedural surface features for each planet
export function generatePlanetSurface(planet: Planet, spacing: number = 2.5): PlanetDot[] {
  const dots: PlanetDot[] = [];
  
  // Helper for noise-like patterns (simple pseudo-random based on coordinates)
  const noise = (lng: number, lat: number, seed: number = 0) => {
    const x = Math.sin(lng * 12.9898 + lat * 78.233 + seed) * 43758.5453;
    return x - Math.floor(x);
  };

  // Generate dots based on planet type
  switch (planet.id) {
    case "sun":
      // Sun: Bright center with corona patterns
      for (let lng = -180; lng <= 180; lng += spacing) {
        for (let lat = -90; lat <= 90; lat += spacing) {
          // Create solar flare patterns
          const flareIntensity = noise(lng * 0.1, lat * 0.1, 2);
          
          let color = planet.colorLight;
          if (flareIntensity > 0.7) {
            color = "#FFFFFF";
          } else if (flareIntensity > 0.4) {
            color = planet.colorLight;
          } else {
            color = planet.color;
          }
          
          dots.push({ lng, lat, color, type: "surface" });
        }
      }
      break;

    case "mercury":
      // Mercury: Cratered surface
      for (let lng = -180; lng <= 180; lng += spacing) {
        for (let lat = -90; lat <= 90; lat += spacing) {
          const crater1 = noise(lng * 0.3, lat * 0.3, 1);
          const crater2 = noise(lng * 0.5, lat * 0.5, 2);
          const base = noise(lng, lat, 3);
          
          let color = planet.colorDark;
          if (crater1 > 0.85 || crater2 > 0.9) {
            color = "#5C4833"; // Crater rims
          } else if (base > 0.6) {
            color = planet.color;
          } else {
            color = planet.colorDark;
          }
          
          dots.push({ lng, lat, color, type: "surface" });
        }
      }
      break;

    case "venus":
      // Venus: Thick cloud cover
      for (let lng = -180; lng <= 180; lng += spacing) {
        for (let lat = -90; lat <= 90; lat += spacing) {
          const cloud1 = noise(lng * 0.2, lat * 0.15, 1);
          const cloud2 = noise(lng * 0.1, lat * 0.08, 2);
          
          let color = planet.color;
          if (cloud1 > 0.6) {
            color = planet.colorLight;
          } else if (cloud2 < 0.3) {
            color = planet.colorDark;
          }
          
          dots.push({ lng, lat, color, type: "cloud" });
        }
      }
      break;

    case "mars":
      // Mars: Red desert with polar ice caps
      for (let lng = -180; lng <= 180; lng += spacing) {
        for (let lat = -90; lat <= 90; lat += spacing) {
          const distFromPole = Math.abs(lat);
          const terrain = noise(lng * 0.2, lat * 0.2, 1);
          const valley = noise(lng * 0.1, lat * 0.15, 2);
          
          let color = planet.color;
          
          // Polar ice caps
          if (distFromPole > 80) {
            color = "#FFFFFF";
          } else if (distFromPole > 75) {
            color = "#FFD4B3";
          } else if (valley > 0.75) {
            // Valles Marineris-like features
            color = planet.colorDark;
          } else if (terrain > 0.6) {
            color = planet.colorLight;
          }
          
          dots.push({ lng, lat, color, type: "surface" });
        }
      }
      break;

    case "jupiter":
      // Jupiter: Banded atmosphere with Great Red Spot
      for (let lng = -180; lng <= 180; lng += spacing) {
        for (let lat = -90; lat <= 90; lat += spacing) {
          const band = Math.floor((lat + 90) / 15);
          const turbulence = noise(lng * 0.3, lat * 0.2, band);
          
          // Great Red Spot around -20 lat, 90 lng
          const spotDist = Math.sqrt(Math.pow(lng - 90, 2) * 4 + Math.pow(lat + 20, 2) * 9);
          
          let color;
          if (spotDist < 15) {
            color = "#DC4C3E"; // Red spot
          } else if (band % 2 === 0) {
            color = turbulence > 0.5 ? "#E5B870" : "#C88B3A";
          } else {
            color = turbulence > 0.5 ? "#A67438" : "#8B5A2B";
          }
          
          dots.push({ lng, lat, color, type: "cloud" });
        }
      }
      break;

    case "saturn":
      // Saturn: Similar to Jupiter but paler
      for (let lng = -180; lng <= 180; lng += spacing) {
        for (let lat = -90; lat <= 90; lat += spacing) {
          const band = Math.floor((lat + 90) / 12);
          const turbulence = noise(lng * 0.25, lat * 0.15, band);
          
          let color;
          if (band % 2 === 0) {
            color = turbulence > 0.5 ? "#FFEDC9" : "#FAD5A5";
          } else {
            color = turbulence > 0.5 ? "#E8C794" : "#D4A574";
          }
          
          dots.push({ lng, lat, color, type: "cloud" });
        }
      }
      break;

    case "uranus":
      // Uranus: Smooth cyan with subtle bands
      for (let lng = -180; lng <= 180; lng += spacing) {
        for (let lat = -90; lat <= 90; lat += spacing) {
          const variation = noise(lng * 0.1, lat * 0.15, 1);
          
          let color = planet.color;
          if (variation > 0.7) {
            color = planet.colorLight;
          } else if (variation < 0.3) {
            color = planet.colorDark;
          }
          
          dots.push({ lng, lat, color, type: "cloud" });
        }
      }
      break;

    case "neptune":
      // Neptune: Deep blue with storm features
      for (let lng = -180; lng <= 180; lng += spacing) {
        for (let lat = -90; lat <= 90; lat += spacing) {
          const storm = noise(lng * 0.2, lat * 0.2, 1);
          const variation = noise(lng * 0.15, lat * 0.1, 2);
          
          // Great Dark Spot
          const spotDist = Math.sqrt(Math.pow(lng + 30, 2) * 4 + Math.pow(lat - 20, 2) * 9);
          
          let color;
          if (spotDist < 12) {
            color = "#1E3AA8"; // Dark spot
          } else if (storm > 0.8) {
            color = planet.colorLight;
          } else if (variation > 0.6) {
            color = planet.color;
          } else {
            color = planet.colorDark;
          }
          
          dots.push({ lng, lat, color, type: "cloud" });
        }
      }
      break;

    case "pluto":
      // Pluto: Heart-shaped Tombaugh Regio
      for (let lng = -180; lng <= 180; lng += spacing) {
        for (let lat = -90; lat <= 90; lat += spacing) {
          const terrain = noise(lng * 0.2, lat * 0.2, 1);
          
          // Tombaugh Regio (heart shape) around 0 lng, 20 lat
          const heartX = (lng + 180) % 360 - 180;
          const heartDist = Math.sqrt(Math.pow(heartX / 1.2, 2) + Math.pow((lat - 20) / 0.8, 2));
          const isHeart = heartDist < 25 && lat < 35 && lat > 5;
          
          let color;
          if (isHeart) {
            color = "#FFFFFF"; // Bright nitrogen ice
          } else if (terrain > 0.7) {
            color = planet.colorLight;
          } else if (terrain > 0.4) {
            color = planet.color;
          } else {
            color = planet.colorDark;
          }
          
          dots.push({ lng, lat, color, type: "surface" });
        }
      }
      break;

    default:
      // Default: simple color variation
      for (let lng = -180; lng <= 180; lng += spacing) {
        for (let lat = -90; lat <= 90; lat += spacing) {
          const variation = noise(lng, lat, 1);
          let color = planet.color;
          if (variation > 0.6) {
            color = planet.colorLight;
          } else if (variation < 0.4) {
            color = planet.colorDark;
          }
          dots.push({ lng, lat, color });
        }
      }
  }

  return dots;
}

// Generate ring system for Saturn
export function generateSaturnRings() {
  const rings = [];
  const ringCount = 8;
  
  for (let i = 0; i < ringCount; i++) {
    const innerRadius = 1.6 + i * 0.08;
    const outerRadius = innerRadius + 0.07;
    const opacity = 0.3 + (i % 2) * 0.2;
    const color = i % 3 === 0 ? "#E8C794" : i % 3 === 1 ? "#D4A574" : "#C9B89A";
    
    rings.push({ innerRadius, outerRadius, color, opacity });
  }
  
  return rings;
}
