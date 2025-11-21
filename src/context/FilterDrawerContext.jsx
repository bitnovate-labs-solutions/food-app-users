import { createContext, useContext, useState } from "react";

const FilterDrawerContext = createContext();

export function useFilterDrawer() {
  return useContext(FilterDrawerContext);
}

export function FilterDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <FilterDrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </FilterDrawerContext.Provider>
  );
}

