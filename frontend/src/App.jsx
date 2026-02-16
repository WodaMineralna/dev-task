import FilterBox from "./components/filters/FilterBox";
import { ProductsBox, SearchInput } from "./components/";

import FiltersContextProvider from "./context/FiltersContextProvider";

// ^ filter categories
const categories = [
  {
    id: 100,
    filterKey: "sortBy",
    filterFlags: {
      multiFilter: false,
    },
    title: "Sortuj po:",
    items: [
      { id: 101, filterValue: "none", label: "Wszystkie" },
      { id: 102, filterValue: "price", label: "Cena" },
      { id: 103, filterValue: "capacity", label: "Pojemność" },
      { id: 104, filterValue: "score", label: "Popularność" },
    ],
  },
  {
    id: 200,
    filterKey: "functions",
    filterFlags: {
      multiFilter: true,
    },
    title: "Funkcje:",
    items: [
      { id: 201, filterValue: "all", label: "Wszystkie" },
      { id: 202, filterValue: "Drzwi AddWash™", label: "Drzwi AddWash™" },
      { id: 203, filterValue: "Panel AI Control", label: "Panel AI Control" },
      {
        id: 204,
        filterValue: "Wyświetlacz elektroniczny",
        label: "Wyświetlacz elektroniczny",
      },
      {
        id: 205,
        filterValue: "Silnik inwerterowy",
        label: "Silnik inwerterowy",
      },
    ],
  },
  {
    id: 300,
    filterKey: "energyLabel",
    filterFlags: {
      multiFilter: true,
    },
    title: "Klasa energetyczna:",
    items: [
      { id: 301, filterValue: "all", label: "Wszystkie" },
      { id: 302, filterValue: "a", label: "A" },
      { id: 303, filterValue: "b", label: "B" },
      { id: 304, filterValue: "c", label: "C" },
      { id: 305, filterValue: "d", label: "D" },
      { id: 306, filterValue: "e", label: "E" },
      // ! might delete class 'F' later if the nav bar gets too long      -     not needed
      { id: 307, filterValue: "f", label: "F" },
    ],
  },
  {
    id: 400,
    filterKey: "capacity",
    filterFlags: {
      multiFilter: true,
    },
    title: "Pojemność:",
    items: [
      { id: 401, filterValue: "all", label: "Wszystkie" },
      { id: 402, filterValue: "8", label: "8kg" },
      { id: 403, filterValue: "9", label: "9kg" },
      { id: 404, filterValue: "10", label: "10kg" },
      { id: 405, filterValue: "11", label: "11kg" },
      { id: 406, filterValue: "over11", label: "Ponad 11kg" },
    ],
  },
];

function App() {
  // ? add 'Motion' animation for loading?      -     NOT NEEDED
  return (
    <FiltersContextProvider>
      <div className="root-container">
        <header className="heading-main-container input-searchProduct-box">
          <h1 className="heading-main">Wybierz urządzenie</h1>
        </header>
        <div className="input-searchProduct-box">
          <SearchInput />
        </div>
        <FilterBox categories={categories} />
        <ProductsBox />
      </div>
    </FiltersContextProvider>
  );
}

export default App;
