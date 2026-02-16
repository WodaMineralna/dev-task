import { useState, useContext } from "react";

import { FiltersContext } from "../../context/FiltersContextProvider";

import FilterItem from "./FilterItem";

// * lowercase 'filterkey' because:
// React does not recognize the `filterKey` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `filterkey` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
export default function FilterCategory({
  filterkey,
  filterFlags,
  title,
  items = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { filters } = useContext(FiltersContext);

  function getCurrentlySelectedFilters() {
    const filterValue = filters[filterkey];

    function getLabel(value) {
      const item = items.find((i) => i.filterValue === value);
      return item ? item.label : value;
    }

    if (Array.isArray(filterValue)) {
      if (filterValue.length === 0 || filterValue.includes("all")) {
        return "Pokaż wszystkie";
      } else {
        return filterValue.length === 1
          ? getLabel(filterValue[0])
          : `${filterValue.length} wybrane`;
      }
    }

    return filterValue === "none" ? "Pokaż wszystkie" : getLabel(filterValue);
  }

  return (
    <div className="filter-category-box">
      <p className="filter-category-paragraph">{title}</p>
      <div
        className="filter-selectedFilters-box"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <p className="filter-selectedFilter-paragraph">
          {getCurrentlySelectedFilters()}
        </p>
        <span
          className={`${isOpen ? "polygon-up" : "polygon-down"} polygon-gray`}
        ></span>
        {isOpen && (
          <ul
            className="filter-category-list"
            filterkey={filterkey}
            onClick={(e) => e.stopPropagation()} // ensures the filter-category-list dropdown doesnt get closed upon selecting a filter
          >
            {items.map((item) => (
              <FilterItem
                key={item.id ?? item.label}
                label={item.label}
                filterkey={filterkey}
                filterFlags={filterFlags}
                filterValue={item.filterValue}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
