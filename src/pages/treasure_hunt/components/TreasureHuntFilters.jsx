import { Search, X, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TreasureHuntFilters({
  formData,
  setFormData,
  activeSection,
  setActiveSection,
  onClearAll,
  onStart,
  onClose,
}) {
  const suggestedLocations = [
    {
      id: "pj",
      name: "Petaling Jaya, Malaysia",
      icon: <MapPin className="w-5 h-5 text-primary" />,
    },
    {
      id: "uptown",
      name: "Uptown, Malaysia",
      icon: <MapPin className="w-5 h-5 text-orange-500" />,
    },
    {
      id: "puchong",
      name: "Puchong, Malaysia",
      icon: <MapPin className="w-5 h-5 text-blue-500" />,
    },
  ];

  const mealTimes = ["Breakfast", "Lunch", "Dinner"];
  const foodTypes = [
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

  const getLocationDisplay = () => {
    if (formData.selectedLocation) {
      const location = suggestedLocations.find(
        (l) => l.id === formData.selectedLocation
      );
      return location ? location.name : formData.searchQuery || "Where";
    }
    return formData.searchQuery || "Where";
  };

  const getPriceDisplay = () => {
    if (formData.minPrice && formData.maxPrice) {
      return `RM ${formData.minPrice}-${formData.maxPrice}`;
    }
    return "Price";
  };

  const getFoodTypeDisplay = () => {
    const parts = [];
    if (formData.selectedMealTimes.length > 0) {
      parts.push(formData.selectedMealTimes.join(", "));
    }
    if (formData.selectedFoodTypes.length > 0) {
      parts.push(formData.selectedFoodTypes.join(", "));
    }
    if (formData.includeDesserts) {
      parts.push("Desserts/Cafes");
    }
    return parts.length > 0 ? parts.join(" • ") : "Food Type";
  };

  return (
    <>
      {/* Dark Overlay Background */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Collapsibles Content */}
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center mt-28">
        <div className="w-full max-w-md px-4 flex-1 flex flex-col overflow-hidden">
          {/* Close Button */}
          <div className="absolute -top-20 right-3">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors border border-gray-200 shadow-lg"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <div
            className="space-y-4 flex flex-col flex-1 overflow-y-auto pb-24"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Where Section ============================================================= */}
            <div className="bg-white rounded-2xl overflow-hidden py-2 px-1 shadow-2xl">
              <button
                onClick={() =>
                  setActiveSection(activeSection === "where" ? null : "where")
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-xl"
              >
                <div className="text-left">
                  <div
                    className={
                      activeSection === "where"
                        ? "text-xl font-semibold text-black mb-0.5"
                        : "text-sm font-medium text-gray-900"
                    }
                  >
                    {activeSection === "where"
                      ? "Where?"
                      : getLocationDisplay()}
                  </div>
                </div>
                {activeSection === "where" ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {activeSection === "where" && (
                <div className="px-6 pb-4 space-y-4">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Kuala Lumpur"
                      value={formData.searchQuery}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          searchQuery: e.target.value,
                        })
                      }
                      className="pl-10 h-12 rounded-xl border-gray-100 text-sm font-light"
                    />
                  </div>

                  <div className="space-y-1">
                    {suggestedLocations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            selectedLocation: location.id,
                            searchQuery: location.name,
                          })
                        }
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors text-left ${
                          formData.selectedLocation === location.id
                            ? "bg-gray-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-gray-600 flex-shrink-0">
                          {location.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {location.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Section ============================================================= */}
            <div className="bg-white rounded-2xl overflow-hidden py-2 px-1 shadow-2xl">
              <button
                onClick={() => {
                  const newSection = activeSection === "price" ? null : "price";
                  setActiveSection(newSection);
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-xl"
              >
                <div className="text-left">
                  <div
                    className={
                      activeSection === "price"
                        ? "text-xl font-semibold text-black mb-0.5"
                        : "text-sm font-medium text-gray-900"
                    }
                  >
                    {activeSection === "price" ? "Price?" : getPriceDisplay()}
                  </div>
                </div>
                {activeSection === "price" ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {activeSection === "price" && (
                <div className="px-6 pb-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">
                        Minimum
                      </label>
                      <Input
                        type="text"
                        placeholder="RM 10"
                        value={`RM ${formData.minPrice}`}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          setFormData({ ...formData, minPrice: value });
                        }}
                        className="h-12 rounded-xl border-gray-100 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">
                        Maximum
                      </label>
                      <Input
                        type="text"
                        placeholder="RM 20"
                        value={`RM ${formData.maxPrice}`}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          setFormData({ ...formData, maxPrice: value });
                        }}
                        className="h-12 rounded-xl border-gray-100 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Food Type Section ============================================================= */}
            <div className="bg-white rounded-2xl overflow-hidden py-2 px-1 shadow-2xl">
              <button
                onClick={() => {
                  const newSection =
                    activeSection === "foodType" ? null : "foodType";
                  setActiveSection(newSection);
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-xl"
              >
                <div className="text-left">
                  <div
                    className={
                      activeSection === "foodType"
                        ? "text-xl font-semibold text-black mb-0.5"
                        : "text-sm font-medium text-gray-900"
                    }
                  >
                    {activeSection === "foodType"
                      ? "Food Type?"
                      : getFoodTypeDisplay()}
                  </div>
                </div>
                {activeSection === "foodType" ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {activeSection === "foodType" && (
                <div className="px-6 pb-4 space-y-6 max-h-[60vh] overflow-y-auto">
                  <div>
                    <p className="text-xs font-light text-gray-500 mb-3">
                      When
                    </p>
                    <div className="flex gap-2">
                      {mealTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => {
                            const isSelected =
                              formData.selectedMealTimes.includes(time);
                            setFormData({
                              ...formData,
                              selectedMealTimes: isSelected
                                ? formData.selectedMealTimes.filter(
                                    (t) => t !== time
                                  )
                                : [...formData.selectedMealTimes, time],
                            });
                          }}
                          className={`px-4 py-2 w-full rounded-full text-xs font-medium transition-colors ${
                            formData.selectedMealTimes.includes(time)
                              ? "bg-primary text-white"
                              : "bg-white text-gray-900 border border-gray-200"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-light text-gray-500 mb-3">
                      Type
                    </p>
                    <div className="space-y-2">
                      <select
                        value=""
                        onChange={(e) => {
                          if (
                            e.target.value &&
                            !formData.selectedFoodTypes.includes(e.target.value)
                          ) {
                            setFormData({
                              ...formData,
                              selectedFoodTypes: [
                                ...formData.selectedFoodTypes,
                                e.target.value,
                              ],
                            });
                            e.target.value = "";
                          }
                        }}
                        className="w-full h-12 rounded-xl border border-gray-100 px-4 text-xs"
                      >
                        <option value="">Select cuisine type</option>
                        {foodTypes
                          .filter(
                            (type) => !formData.selectedFoodTypes.includes(type)
                          )
                          .map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                      </select>

                      {formData.selectedFoodTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedFoodTypes.map((type) => (
                            <div
                              key={type}
                              className="px-3 py-1.5 bg-gray-100 rounded-full flex items-center gap-2 text-xs"
                            >
                              <span className="text-gray-900">{type}</span>
                              <button
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    selectedFoodTypes:
                                      formData.selectedFoodTypes.filter(
                                        (t) => t !== type
                                      ),
                                  });
                                }}
                                className="text-gray-500 hover:text-gray-900"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-light text-gray-500 mb-3">
                      Desserts/Cafes?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            includeDesserts: true,
                          })
                        }
                        className={`px-4 py-2 w-full rounded-full text-xs font-medium transition-colors ${
                          formData.includeDesserts
                            ? "bg-primary text-white"
                            : "bg-white text-gray-900 border border-gray-200"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            includeDesserts: false,
                          })
                        }
                        className={`px-4 py-2 w-full rounded-full text-xs font-medium transition-colors ${
                          !formData.includeDesserts
                            ? "bg-primary text-white"
                            : "bg-white text-gray-900 border border-gray-200"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Bottom Actions - Fixed at bottom */}
          <div className="sticky bottom-0 p-2 space-y-3 flex mb-6">
            <button
              onClick={onClearAll}
              className="text-sm text-gray-700 hover:text-gray-900 transition-colors w-full text-left"
            >
              Clear all
            </button>
            <Button
              onClick={onStart}
              className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl shadow-xl font-medium"
            >
              Start
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
