import { useState } from "react";

export default function ProductCard({ product }) {
  const [isSelected, setIsSelected] = useState(false);

  const capacityValue = parseFloat(
    product.productData?.capacity.replace(" kg", ""),
  );

  const priceValue =
    product.productData?.promoPrice || product.productData?.price || "1000";

  const firstPriceValueLetter = priceValue[0];
  const restPriceValueLetters = priceValue.slice(1);

  const financingText =
    product.productData.financing.isAvailable === "Y"
      ? `${product.productData.financing.monthlyPayment.replace(".", ",")} zł x ${product.productData.financing.duration} rat`
      : "Finansowanie niedostępne";

  return (
    <div className="product-data-wrapper">
      <div className="product-box">
        <img
          src={product.productData?.imageUrl || ""}
          alt={product.productData?.name || "Image alt text"}
          className="product-image"
        />
        <h3 className="product-name">{product.productData.name}</h3>
        <div className="product-specs-box">
          <p className="product-paragraph-gray">
            Pojemność (kg): <span>{capacityValue || "?"}</span>
          </p>
          <p className="product-paragraph-gray">
            Wymiary (GxSxW):{" "}
            <span>
              {product.productData?.displayDimensions || "? x ? x ? cm"}
            </span>
          </p>
          <p className="product-paragraph-gray product-specs-functions">
            Funkcje:{" "}
            <span>{product.productData.functions.join(", ") || "?"}</span>
          </p>
        </div>
        <div className="product-specs-energyClass">
          <p className="product-paragraph-gray product-specs-energyClass-paragraph">
            Klasa energetyczna
          </p>
          <span
            className={`product-specs-energyClass-label energyClass-${product.productData?.energyLabel || "a"}`}
          >
            {product.productData?.energyLabel.toUpperCase() || "?"}
          </span>
        </div>
        <p className="product-paragraph-gray">
          Cena obowiązuje: {product.productData?.priceDates || "? - ?"}
        </p>
        <div className="product-price-box">
          <div className="product-price-main-firstLetter">
            {firstPriceValueLetter}
          </div>
          <div className="product-price-main-restLetters">
            {restPriceValueLetters}
          </div>
          <div className="product-price-decimal">
            <p>00</p>
            <p>zł</p>
          </div>
        </div>
        <p className="product-paragraph-darkGray">{financingText}</p>
      </div>
      <button
        className={`product-button ${isSelected ? "selected" : ""}`}
        onClick={() => setIsSelected(!isSelected)}
      >
        {isSelected ? "Wybrane" : "Wybierz"}
      </button>
    </div>
  );
}
