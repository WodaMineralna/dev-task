import { createContext, useState, useCallback, useMemo } from "react";

// ?
// TODO: merge `toggleFilters` and `toggleOrder`
function toggleFilters(filters, newFilter) {
  // ^ if 'all' was selected as a filter, then set it and ignore the rest
  if (newFilter == "all") {
    return [newFilter];
  }

  // ^ if a filter is selected for the first time, then remove 'all' and append the selected
  if (!filters.includes(newFilter)) {
    const trimmedFilters = filters.filter((f) => f !== "all");
    return [...trimmedFilters, newFilter];
  }

  // ^ if same filter is selected again, then remove it / if all filters would be removed, then set "all"
  if (filters.includes(newFilter)) {
    if (filters.length - 1 == 0) {
      return ["all"];
    } else {
      return filters.filter((f) => f !== newFilter);
    }
  }
}

function toggleOrder(filtersArary, filterKey, filterValue) {
  // ^ toggle order if the same `sortBy` filter was selected again
  if (filtersArary[filterKey] == filterValue) {
    const nextOrder = filtersArary.order === "asc" ? "desc" : "asc";
    return { ...filtersArary, order: nextOrder };
  } else {
    return { ...filtersArary, [filterKey]: filterValue, order: "asc" };
  }
}

export const FiltersContext = createContext({
  filters: {
    // * original filters, default values same as in server.js
    sortBy: "none",
    order: "asc",
    functions: ["all"],
    energyLabel: ["all"],
    capacity: ["all"],
    page: "1",
    search: "",
  },
  setFilter: (searchParams = {}) => {},
  setSearch: (searchTerm) => {},
});

export default function FiltersContextProvider({ children }) {
  // ? fetch from localStorage upon first page open?
  const [currentFilters, setCurrentFilters] = useState({
    // * original filters, default values same as in server.js
    sortBy: "none",
    order: "asc",
    functions: ["all"],
    energyLabel: ["all"],
    capacity: ["all"],
    page: "1",
    search: "",
  });

  // ! used `useCallback` because this function is defined inside component body, which would cause additional unnecessary re-renders (same case as `ctxValue` object below)
  const handleSetFilter = useCallback(
    (newFilterKey, newFilterValue, filterFlags) => {
      console.log("Set new filter:", newFilterKey, newFilterValue, filterFlags); // DEBUG
      // * e.g:  newFilter = { sortBy: "price" }

      // ? needed?
      // TODO: merge `toggleFilters` and `toggleOrder`
      setCurrentFilters((prevFilters) => {
        if (filterFlags?.multiFilter) {
          const filtersArray = toggleFilters(
            prevFilters[newFilterKey], // array of filters of selected category, e.g: "capacity": ["8", "10"] or even just ["8"]
            newFilterValue,
          );
          console.log(filtersArray); // DEBUGGING

          return { ...prevFilters, [newFilterKey]: filtersArray };
        } else {
          const filtersArray = toggleOrder(
            prevFilters,
            newFilterKey,
            newFilterValue,
          );
          return filtersArray;
        }
      });
    },
    [],
  );

  const handleSetSearch = useCallback((searchTerm) => {
    setCurrentFilters((prevFilters) => ({
      ...prevFilters,
      search: searchTerm,
    }));
  }, []);

  // ! applied useMemo() because if I were to use just the Object, then React would think it is different upon every re-render, which would cause additional unnecessary re-renders
  const ctxValue = useMemo(
    () => ({
      filters: currentFilters,
      setFilter: handleSetFilter,
      setSearch: handleSetSearch,
    }),
    [currentFilters, handleSetFilter, handleSetSearch],
  );

  return (
    <FiltersContext.Provider value={ctxValue}>
      {children}
    </FiltersContext.Provider>
  );
}
