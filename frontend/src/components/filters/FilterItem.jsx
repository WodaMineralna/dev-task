import { useContext } from "react";

import { FiltersContext } from "../../context/FiltersContextProvider";

// * lowercase 'filterkey' because:
// React does not recognize the `filterKey` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `filterkey` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
export default function FilterItem({
  label,
  filterkey,
  filterFlags,
  filterValue,
}) {
  // ? not really needed though
  // TODO: add 'selected' class based on URLSeachParams (so if someone directly accesses URL with search params, then such buttons will appear as SELECTED without prior clicking

  const { filters, setFilter } = useContext(FiltersContext);

  const selected = filterFlags?.multiFilter
    ? filters[filterkey]?.includes(filterValue)
    : filters[filterkey] === filterValue;

  const isAscending = filters.order === "asc";

  function handleSetFilter() {
    setFilter(filterkey, filterValue, filterFlags);
  }

  return (
    <li
      className={`filter-category-list-item${selected ? " selected" : ""}`}
      onClick={handleSetFilter}
    >
      {label}
      {filterFlags?.multiFilter == false &&
        selected &&
        filterValue !== "none" && (
          <span
            className={`${isAscending ? "polygon-up" : "polygon-down"} polygon-gray`}
          ></span>
        )}
    </li>
  );
}
