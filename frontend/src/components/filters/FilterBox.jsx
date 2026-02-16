import FilterCategory from "./FilterCategory";

export default function FilterBox({ categories = [] }) {
  return (
    <nav className="filters-categories-wrapper">
      <div className="filters-categories-box">
        {categories.map((category) => (
          <FilterCategory
            key={category.id ?? category.title}
            // * lowercase 'filterkey' because:
            // React does not recognize the `filterKey` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `filterkey` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
            filterkey={category.filterKey}
            filterFlags={category.filterFlags}
            title={category.title}
            items={category.items}
          />
        ))}
      </div>
    </nav>
  );
}
