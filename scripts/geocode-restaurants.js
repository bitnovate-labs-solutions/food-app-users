// Script to geocode restaurant addresses and generate SQL UPDATE statements
// Run with: node scripts/geocode-restaurants.js

const restaurants = [
  {
    id: "660e8400-e29b-41d4-a716-446655440001",
    address: "123 Jalan Ampang, Ampang",
    location: "Ampang"
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440002",
    address: "456 Jalan Petaling, Petaling Street",
    location: "Petaling Street"
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440003",
    address: "789 Jalan Brickfields, Brickfields",
    location: "Brickfields"
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440004",
    address: "321 Jalan Klang, Klang",
    location: "Klang"
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440005",
    address: "654 Jalan Imbi, Imbi",
    location: "Imbi"
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440006",
    address: "987 Jalan Gurney, George Town",
    location: "Gurney Drive"
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440007",
    address: "147 Jalan Kajang, Kajang",
    location: "Kajang"
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440008",
    address: "258 Jalan Melaka, Melaka",
    location: "Melaka"
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440009",
    address: "369 Jalan SS2, Petaling Jaya",
    location: "SS2 Petaling Jaya"
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440010",
    address: "741 Jalan Bukit Bintang, Bukit Bintang",
    location: "Bukit Bintang"
  }
];

// Geocoding function (simplified version)
let lastGeocodeTime = 0;
const MIN_TIME_BETWEEN_REQUESTS = 1100;

async function geocodeAddress(address) {
  if (!address || typeof address !== "string" || address.trim() === "") {
    return null;
  }

  try {
    // Respect rate limits
    const now = Date.now();
    const timeSinceLastRequest = now - lastGeocodeTime;
    
    if (timeSinceLastRequest < MIN_TIME_BETWEEN_REQUESTS) {
      const waitTime = MIN_TIME_BETWEEN_REQUESTS - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    const encodedAddress = encodeURIComponent(`${address}, Malaysia`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&countrycodes=my&limit=1`;

    lastGeocodeTime = Date.now();

    const response = await fetch(url, {
      headers: {
        "User-Agent": "FoodHunterApp/1.0",
      },
    });

    if (!response.ok) {
      console.error(`Geocoding API error for ${address}:`, response.statusText);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }

    return null;
  } catch (error) {
    console.error(`Error geocoding ${address}:`, error);
    return null;
  }
}

async function main() {
  console.log("Starting geocoding process...\n");
  
  const results = [];
  
  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    console.log(`[${i + 1}/${restaurants.length}] Geocoding: ${restaurant.address}`);
    
    const coords = await geocodeAddress(restaurant.address);
    
    if (coords) {
      results.push({
        id: restaurant.id,
        address: restaurant.address,
        lat: coords.lat,
        lng: coords.lng
      });
      console.log(`  ✓ Found: ${coords.lat}, ${coords.lng}\n`);
    } else {
      console.log(`  ✗ Failed to geocode\n`);
    }
  }
  
  console.log("\n" + "=".repeat(80));
  console.log("SQL UPDATE STATEMENTS:");
  console.log("=".repeat(80) + "\n");
  
  results.forEach((result) => {
    console.log(`UPDATE restaurants`);
    console.log(`SET latitude = ${result.lat}, longitude = ${result.lng}`);
    console.log(`WHERE id = '${result.id}';\n`);
  });
  
  console.log("\n" + "=".repeat(80));
  console.log("BATCH UPDATE (Single Statement):");
  console.log("=".repeat(80) + "\n");
  
  console.log("UPDATE restaurants");
  console.log("SET latitude = CASE");
  results.forEach((result, index) => {
    const comma = index < results.length - 1 ? "," : "";
    console.log(`    WHEN id = '${result.id}' THEN ${result.lat}${comma}`);
  });
  console.log("    ELSE latitude");
  console.log("END,");
  console.log("longitude = CASE");
  results.forEach((result, index) => {
    const comma = index < results.length - 1 ? "," : "";
    console.log(`    WHEN id = '${result.id}' THEN ${result.lng}${comma}`);
  });
  console.log("    ELSE longitude");
  console.log("END");
  console.log(`WHERE id IN (${results.map(r => `'${r.id}'`).join(", ")});`);
}

main().catch(console.error);

