import { useContext, useState, useEffect, useCallback } from "react";

import ErrorBox from "../ErrorBox";
import ProductCard from "./ProductCard";

import { FiltersContext } from "../../context/FiltersContextProvider";

export default function ProductsBox() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  const [pagination, setPagination] = useState(null);

  const { filters } = useContext(FiltersContext);
  console.log(filters); // DEBUGGING

  const handleGetProducts = useCallback(
    async (pageNum = 1) => {
      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            params.delete(key);
            value.forEach((v) => params.append(key, v));
          } else {
            params.set(key, value);
          }
        });

        params.delete("page");
        params.set("page", pageNum);
        console.log(params.toString()); // DEBUGGING

        setIsLoading(true);

        // ^ fetching data from the backend
        const res = await fetch(`/api/products?${params.toString()}`);
        const body = await res.json();

        if (!res.ok) {
          const msg = body?.message || "An error has occured! Please try again";
          setIsLoading(false);

          throw new Error(`${msg}, statusCode: ${res.status || "500"}`);
        }

        if (pageNum === 1) {
          setProducts(body.products);
        } else {
          setProducts((prev) => [...prev, ...body.products]);
        }

        setPagination(body.pagination);
        setIsLoading(false);
      } catch (e) {
        setError(e.message);
        console.error(e);
      }
    },
    [filters],
  );

  useEffect(() => {
    handleGetProducts(1);
  }, [handleGetProducts]);

  function handleShowMore() {
    if (pagination?.hasNextPage && !isLoading) {
      handleGetProducts(pagination.currentPage + 1);
    }
  }

  return (
    <section className="products-section">
      <div className="products-totalAmount">
        Liczba wyników: {products.length || 0}
      </div>
      <div className="products-wrapper">
        {/* {isLoading && <p>Ładowanie...</p>} */}
        {products &&
          products.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
      </div>
      {error && (
        <ErrorBox message={error} onRetry={() => handleGetProducts(1)} />
      )}
      {products && products.length > 0 && pagination?.hasNextPage && (
        <button className="products-showMore" onClick={handleShowMore}>
          {isLoading ? "Ładowanie..." : "Pokaż więcej"}
          <span
            className={`polygon-showMore ${isLoading ? "polygon-up" : "polygon-down"}`}
          ></span>
        </button>
      )}
    </section>
  );
}
