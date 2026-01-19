export interface Destination {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  description: string;
  category: "city" | "nature" | "landmark" | "beach" | "adventure";
  image?: string;
}

export const destinations: Destination[] = [
  // Europe
  { id: "paris", name: "Paris", country: "France", countryCode: "FR", lat: 48.8566, lng: 2.3522, description: "City of Light, Eiffel Tower, Louvre Museum", category: "city" },
  { id: "rome", name: "Rome", country: "Italy", countryCode: "IT", lat: 41.9028, lng: 12.4964, description: "Colosseum, Vatican City, Ancient History", category: "city" },
  { id: "barcelona", name: "Barcelona", country: "Spain", countryCode: "ES", lat: 41.3851, lng: 2.1734, description: "Gaudí architecture, La Rambla, beaches", category: "city" },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", countryCode: "NL", lat: 52.3676, lng: 4.9041, description: "Canals, Van Gogh Museum, cycling culture", category: "city" },
  { id: "london", name: "London", country: "United Kingdom", countryCode: "GB", lat: 51.5074, lng: -0.1278, description: "Big Ben, British Museum, Royal Palaces", category: "city" },
  { id: "santorini", name: "Santorini", country: "Greece", countryCode: "GR", lat: 36.3932, lng: 25.4615, description: "White-washed buildings, stunning sunsets", category: "beach" },
  { id: "swiss-alps", name: "Swiss Alps", country: "Switzerland", countryCode: "CH", lat: 46.8182, lng: 8.2275, description: "Majestic mountains, skiing, hiking", category: "nature" },
  { id: "reykjavik", name: "Reykjavik", country: "Iceland", countryCode: "IS", lat: 64.1466, lng: -21.9426, description: "Northern Lights, geysers, waterfalls", category: "nature" },
  { id: "prague", name: "Prague", country: "Czech Republic", countryCode: "CZ", lat: 50.0755, lng: 14.4378, description: "Charles Bridge, Old Town, Gothic architecture", category: "city" },
  { id: "dubrovnik", name: "Dubrovnik", country: "Croatia", countryCode: "HR", lat: 42.6507, lng: 18.0944, description: "Game of Thrones filming, walled city", category: "city" },
  
  // Asia
  { id: "tokyo", name: "Tokyo", country: "Japan", countryCode: "JP", lat: 35.6762, lng: 139.6503, description: "Shibuya, temples, incredible food scene", category: "city" },
  { id: "kyoto", name: "Kyoto", country: "Japan", countryCode: "JP", lat: 35.0116, lng: 135.7681, description: "Traditional temples, geisha culture, bamboo forests", category: "city" },
  { id: "bali", name: "Bali", country: "Indonesia", countryCode: "ID", lat: -8.3405, lng: 115.092, description: "Rice terraces, temples, surf beaches", category: "beach" },
  { id: "bangkok", name: "Bangkok", country: "Thailand", countryCode: "TH", lat: 13.7563, lng: 100.5018, description: "Grand Palace, street food, vibrant nightlife", category: "city" },
  { id: "singapore", name: "Singapore", country: "Singapore", countryCode: "SG", lat: 1.3521, lng: 103.8198, description: "Gardens by the Bay, food paradise, modern city", category: "city" },
  { id: "hong-kong", name: "Hong Kong", country: "Hong Kong", countryCode: "HK", lat: 22.3193, lng: 114.1694, description: "Victoria Peak, dim sum, skyscrapers", category: "city" },
  { id: "maldives", name: "Maldives", country: "Maldives", countryCode: "MV", lat: 3.2028, lng: 73.2207, description: "Overwater villas, crystal clear waters, diving", category: "beach" },
  { id: "taj-mahal", name: "Taj Mahal", country: "India", countryCode: "IN", lat: 27.1751, lng: 78.0421, description: "Iconic marble mausoleum, symbol of love", category: "landmark" },
  { id: "great-wall", name: "Great Wall", country: "China", countryCode: "CN", lat: 40.4319, lng: 116.5704, description: "Ancient wonder, stunning mountain views", category: "landmark" },
  { id: "angkor-wat", name: "Angkor Wat", country: "Cambodia", countryCode: "KH", lat: 13.4125, lng: 103.867, description: "Ancient temple complex, sunrise views", category: "landmark" },
  
  // Americas
  { id: "new-york", name: "New York", country: "United States", countryCode: "US", lat: 40.7128, lng: -74.006, description: "Times Square, Central Park, Statue of Liberty", category: "city" },
  { id: "grand-canyon", name: "Grand Canyon", country: "United States", countryCode: "US", lat: 36.0544, lng: -112.1401, description: "Breathtaking natural wonder, hiking trails", category: "nature" },
  { id: "machu-picchu", name: "Machu Picchu", country: "Peru", countryCode: "PE", lat: -13.1631, lng: -72.545, description: "Lost city of the Incas, mountain citadel", category: "landmark" },
  { id: "rio", name: "Rio de Janeiro", country: "Brazil", countryCode: "BR", lat: -22.9068, lng: -43.1729, description: "Christ the Redeemer, Copacabana, Carnival", category: "city" },
  { id: "cancun", name: "Cancún", country: "Mexico", countryCode: "MX", lat: 21.1619, lng: -86.8515, description: "Caribbean beaches, Mayan ruins nearby", category: "beach" },
  { id: "patagonia", name: "Patagonia", country: "Argentina", countryCode: "AR", lat: -50.3402, lng: -72.2648, description: "Glaciers, mountains, untouched wilderness", category: "adventure" },
  { id: "havana", name: "Havana", country: "Cuba", countryCode: "CU", lat: 23.1136, lng: -82.3666, description: "Vintage cars, colorful streets, salsa music", category: "city" },
  { id: "banff", name: "Banff", country: "Canada", countryCode: "CA", lat: 51.1784, lng: -115.5708, description: "Rocky Mountains, turquoise lakes, wildlife", category: "nature" },
  
  // Africa & Middle East
  { id: "cape-town", name: "Cape Town", country: "South Africa", countryCode: "ZA", lat: -33.9249, lng: 18.4241, description: "Table Mountain, wine country, beaches", category: "city" },
  { id: "marrakech", name: "Marrakech", country: "Morocco", countryCode: "MA", lat: 31.6295, lng: -7.9811, description: "Medina, souks, desert excursions", category: "city" },
  { id: "serengeti", name: "Serengeti", country: "Tanzania", countryCode: "TZ", lat: -2.3333, lng: 34.8333, description: "Wildlife safari, Great Migration", category: "adventure" },
  { id: "pyramids", name: "Pyramids of Giza", country: "Egypt", countryCode: "EG", lat: 29.9792, lng: 31.1342, description: "Ancient wonders, Sphinx, desert adventures", category: "landmark" },
  { id: "dubai", name: "Dubai", country: "UAE", countryCode: "AE", lat: 25.2048, lng: 55.2708, description: "Burj Khalifa, luxury shopping, desert safaris", category: "city" },
  { id: "petra", name: "Petra", country: "Jordan", countryCode: "JO", lat: 30.3285, lng: 35.4444, description: "Rose-red city carved into rock", category: "landmark" },
  
  // Oceania
  { id: "sydney", name: "Sydney", country: "Australia", countryCode: "AU", lat: -33.8688, lng: 151.2093, description: "Opera House, Harbour Bridge, beaches", category: "city" },
  { id: "great-barrier-reef", name: "Great Barrier Reef", country: "Australia", countryCode: "AU", lat: -18.2871, lng: 147.6992, description: "World's largest coral reef, snorkeling paradise", category: "nature" },
  { id: "queenstown", name: "Queenstown", country: "New Zealand", countryCode: "NZ", lat: -45.0312, lng: 168.6626, description: "Adventure capital, bungee jumping, skiing", category: "adventure" },
  { id: "fiji", name: "Fiji Islands", country: "Fiji", countryCode: "FJ", lat: -17.7134, lng: 178.065, description: "Tropical paradise, friendly locals, diving", category: "beach" },
];

export const categories = {
  city: { label: "Cities", color: "#3b82f6", icon: "🏙️" },
  nature: { label: "Nature", color: "#22c55e", icon: "🏔️" },
  landmark: { label: "Landmarks", color: "#f59e0b", icon: "🏛️" },
  beach: { label: "Beaches", color: "#06b6d4", icon: "🏖️" },
  adventure: { label: "Adventure", color: "#ef4444", icon: "🎿" },
};
