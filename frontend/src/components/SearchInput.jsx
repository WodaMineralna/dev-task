import { useState, useRef, useContext, useEffect } from "react";

import { FiltersContext } from "../context/FiltersContextProvider";

export default function SearchInput() {
  const [inputValue, setInputValue] = useState("");

  const debounceTimerRef = useRef(null);

  const { setSearch } = useContext(FiltersContext);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setSearch(inputValue);
    }, 200);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, setSearch]);

  return (
    <input
      type="text"
      name="Search Product"
      placeholder="Szukaj..."
      className="input-searchProduct"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
    />
  );
}
