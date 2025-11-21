import { useQuery } from "@tanstack/react-query";

// Helper function to format label from value
const formatLabel = (value) => {
  // If value already contains spaces or is already formatted, return as is
  if (value.includes(" ")) {
    return value;
  }
  // Handle hyphenated values
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// FOOD CATEGORY VALUES (from CHECK constraint)
const FOOD_CATEGORY_VALUES = [
  "All",
  "Gluten-Free",
  "Halal",
  "Kosher",
  "Non-Halal",
  "Vegan",
  "Vegetarian",
];

const getFoodCategoryValues = () => {
  return FOOD_CATEGORY_VALUES.map((value) => ({
    value,
    label: formatLabel(value),
  }));
};

export function useFoodCategoryEnum() {
  return useQuery({
    queryKey: ["food_category_values"],
    queryFn: async () => getFoodCategoryValues(),
    staleTime: Infinity, // These values never change, cache forever
  });
}

// CUISINE TYPE VALUES (from CHECK constraint)
const CUISINE_TYPE_VALUES = [
  "Chinese",
  "Indian",
  "Italian",
  "Japanese",
  "Mexican",
  "American",
  "Mamak",
  "Mediterranean",
  "Middle Eastern",
  "French",
  "Thai",
  "Vietnamese",
  "Greek",
  "Spanish",
  "Korean",
  "Turkish",
  "Western",
  "Other",
];

const getCuisineTypeValues = () => {
  return CUISINE_TYPE_VALUES.map((value) => ({
    value,
    label: formatLabel(value),
  }));
};

export function useCuisineTypeEnum() {
  return useQuery({
    queryKey: ["cuisine_type_values"],
    queryFn: async () => getCuisineTypeValues(),
    staleTime: Infinity, // These values never change, cache forever
  });
}
