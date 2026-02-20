import express from "express";
const app = express();

const url =
  "https://searchapi.samsung.com/v6/front/b2c/product/finder/newhybris?type=08010000&siteCode=pl&start=1&num=27&sort=recommended&onlyFilterInfoYN=N&keySummaryYN=Y&filter2=04z01";
const CACHE_TIMEOUT_MS = 1000 * 60 * 15;
let cachedData = null;
let cachedAt = 0;

// TODO: do it!      -     DONE
// ! no need to fetch from samsung API every time, change it so it doesnt refetch on every /api/products call     -      DONE
// ^ I had this fetch inside /api/products before, which was suboptimal (because every time filters changed, /api/products was hit and new fetch to hybris was made)
async function getData() {
  const now = Date.now();
  const isUpdated = cachedData && now - cachedAt < CACHE_TIMEOUT_MS;

  if (isUpdated) return cachedData;

  // ^ Note to self: body.response.resultData.common.totalRecord holds the total amount of product, will be useful in pagination
  const r = await fetch(url, { cache: "no-cache", method: "GET" });
  if (!r.ok) {
    const err = new Error("Fetching product data has failed");
    err.status = r.status;
    throw err;
  }

  cachedData = await r.json();
  cachedAt = now;
  return cachedData;
}

// ? needed?
//  TODO: add ./routes.js
// ? needed?
//  TODO: add ./routes.js
// ? needed?

app.use(express.json());

// ? redirect to /api/products? - DONE
app.get("/", (req, res) => {
  res.redirect("/api/products");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/test", (req, res) => {
  // * dummy 2s timeout for testing purposes
  // setTimeout(() => {
  //   res.json({ date: Date.now() });
  // }, 2000);

  res.json({ date: Date.now() });
});

// ^ Notes / cheatsheet to self regarding filtering hybris data:

// ! resData.response.resultData.productList.map(product) =>
// ! productCard data:
// * image - product.modelList[0].thumbUrl
// * display name - product.fmyEngName
// * capacity - product.modelList[0].keySummary - typeof Array, I must find a "value" which contains 'kg', then .trim() it and I get the capacity
// * dimensions - product.modelList[0].keySummary - to Array, I must find a "value" which contains 'mm', then .trim() it and I get the dimensions
// * functions - ... - use dummy?
// * energy label - product.modelList[0].energyLabelGrade
// * financing - product.modelList[0].financing (Y / N) --> if Y, then product.modelList[0].monthlyPriceInfo.leasingMonthly x product.modelList[0].monthlyPriceInfo.leasingMonths
// * price dates - not available - use dummy?
// * price - product.modelList[0].price   /   promo price - product.modelList[0].promotionPrice

// ! filter related data:
// * sort by:
// ^ price - [above]
// ^ capacity - [above]
// ^ popularity - product.modelList[0].reviewCount * product.modelList[0].ratings
// * functions:
// ^ ...
// * energy class
// ^ product.modelList[0].energyLabelGrade
// * capacity
// ^ [above]

// I've decided to randomize 'energyLabel' data, because all products fetched from Samsungs' site are (supposedly) energy label 'A'
// 'functions' is also randomized because despite a thorough inspection of hybris JSON response, I could not determine how functions data is structured or how it maps to actual products    :(
const RANDOMIZED_DATA = [
  {
    energyLabel: "a",
    functions: [
      "Drzwi AddWash™",
      "Panel AI Control",
      "Wyświetlacz elektroniczny",
    ],
  },
  {
    energyLabel: "d",
    functions: ["Drzwi AddWash™", "Wyświetlacz elektroniczny"],
  },
  {
    energyLabel: "f",
    functions: ["Drzwi AddWash™", "Silnik inwerterowy"],
  },
  {
    energyLabel: "c",
    functions: ["Wyświetlacz elektroniczny", "Silnik inwerterowy"],
  },
  {
    energyLabel: "b",
    functions: ["Panel AI Control", "Silnik inwerterowy"],
  },
  {
    energyLabel: "e",
    functions: ["Panel AI Control", "Wyświetlacz elektroniczny"],
  },
];

function getSemiRandomizedData(index, specValue) {
  const randomIndex = index % RANDOMIZED_DATA.length;
  return RANDOMIZED_DATA[randomIndex][specValue];
}

app.get("/api/products", async (req, res) => {
  // TODO: add pagination     -     DONE

  function getSpecValue(specArray, searchValue) {
    // console.log(specArray) // DEBUG
    const lookFor = {
      capacity: ["Pojemność bębna (pranie)"],
      dimensions: ["Parametry fizyczne", "Wymiary"],
    };

    let result = "";

    specArray.forEach((obj) => {
      // ^ e.g. if searchValue = "capacity", then obj["key"].includes() looks for 'key': 'Pojemność bębna (pranie)'
      if (
        obj["displayType"] == "Spec" &&
        obj["key"] &&
        lookFor[searchValue]?.some((valueToFind) =>
          obj["key"].includes(valueToFind),
        )
      ) {
        // console.log(`Found '${searchValue}' for ${JSON.stringify(obj, null, 2)}`) // DEBUG

        result = obj["value"];
        return result;
      }
    });

    // console.log(`Found spec Value: ${result}`) // DEBUG
    return result;
  }

  // ^ data fetch from hybris gives dimensions in milimeters - transform to centimetrs
  function getDisplayDimensions(specArray) {
    const dimensions = getSpecValue(specArray, "dimensions");
    // console.log(dimensions); // DEBUGGING

    const displayDimensions = dimensions
      .replace("mm", "")
      .trim("")
      .split(" ")
      .map((arrayEl) => (!isNaN(arrayEl) ? arrayEl / 10 : arrayEl))
      .join(" ")
      .concat(" cm");
    return displayDimensions;
  }

  // parses fetched hybris data and retrieves needed values
  function parseProduct(product) {
    return {
      id: product.familyRecord,
      productData: {
        name: product.fmyEngName.replaceAll("\t", ""),
        imageUrl: product.modelList[0].thumbUrl,
        capacity: getSpecValue(product.modelList[0].keySummary, "capacity"),
        dimensions: getSpecValue(product.modelList[0].keySummary, "dimensions"),
        displayDimensions: getDisplayDimensions(
          product.modelList[0].keySummary,
        ),
        functions: getSemiRandomizedData(product.familyRecord, "functions"),
        // energyLabel: product.modelList[0].energyLabelGrade,
        energyLabel: getSemiRandomizedData(product.familyRecord, "energyLabel"),
        financing: {
          isAvailable: product.modelList[0].financing,
          monthlyPayment:
            product.modelList[0]?.monthlyPriceInfo?.leasingMonthly ||
            product.modelList[0].price,
          duration: product.modelList[0]?.monthlyPriceInfo?.leasingMonths || 1,
        },
        priceDates: "20.10.2025 - 20.04.2026",
        price: product.modelList[0].price || "1000",
        promoPrice: product.modelList[0].promotionPrice,
      },
      filterData: {
        price:
          product.modelList[0]?.promotionPrice ||
          product.modelList[0].price ||
          "1000",
        capacity: parseFloat(
          getSpecValue(product.modelList[0].keySummary, "capacity")
            .replace(" kg", "")
            .trim(),
        ),
        functions: getSemiRandomizedData(product.familyRecord, "functions"),
        energyLabel: getSemiRandomizedData(product.familyRecord, "energyLabel"),
        popularity: {
          rating: product.modelList[0].ratings,
          reviewCount: product.modelList[0].reviewCount,
          score:
            product.modelList[0].ratings * product.modelList[0].reviewCount,
        },
      },
    };
  }

  try {
    const resData = await getData();

    // TODO: put the logic inside a function      -     DONE
    const parsedData =
      resData.response.resultData.productList.map(parseProduct);
    console.log(JSON.stringify(parsedData, null, 2)); // DEBUG

    const {
      sortBy = "none",
      order = "asc",
      functions = ["all"],
      energyLabel = ["all"],
      capacity = ["all"],
      page = "1",
      search = "",
    } = req.query;

    console.log({
      sortBy,
      order,
      functions,
      energyLabel,
      capacity,
      page,
      search,
    }); // DEBUGGING

    const acceptedParams = {
      sortBy: ["none", "price", "capacity", "score"],
      order: ["none", "asc", "desc"],
      functions: [
        "all",
        "Drzwi AddWash™",
        "Panel AI Control",
        "Wyświetlacz elektroniczny",
        "Silnik inwerterowy",
      ],
      // ? Note to self: might delete class 'F' later if the nav bar gets too long      -     not needed
      energyLabel: ["all", "a", "b", "c", "d", "e", "f"],
      capacity: ["all", "8", "9", "10", "11", "over11"],
    };

    // ^ not implemented      -     not needed
    // const acceptedMultiParams = ["functions", "energyLabel", "capacity"];

    let filteredData = [...parsedData];

    // * data filtering
    // * data filtering
    // * data filtering

    if (search) {
      const searchLowerCase = search.toLowerCase();
      filteredData = filteredData.filter((product) =>
        product.productData.name.toLowerCase().includes(searchLowerCase),
      );
    }

    if (functions !== "all") {
      const productFunctions = Array.isArray(functions)
        ? functions
        : [functions];
      const validFunctions = productFunctions.filter((productFn) =>
        acceptedParams.functions.includes(productFn),
      );

      if (validFunctions.length > 0) {
        filteredData = filteredData.filter((product) =>
          validFunctions.every((productFn) =>
            product.filterData.functions.includes(productFn),
          ),
        );
      }
    }

    // ? merge energyLabel and capacity check together?
    if (energyLabel !== "all") {
      // console.log("test") // DEBUG
      // ^ if query looks like ?energyLabel=A&energyLabel=B&..., then req.query.energyLabel will be a type of Array
      const labels = Array.isArray(energyLabel) ? energyLabel : [energyLabel];
      const validLabels = labels.filter((label) =>
        acceptedParams.energyLabel.includes(label.toLowerCase()),
      );

      if (validLabels.length > 0)
        filteredData = filteredData.filter((product) =>
          validLabels.includes(product.filterData.energyLabel),
        );
    }

    if (capacity !== "all") {
      // console.log("test - in capacity filtering") // DEBUG
      // ^ if query looks like ?energyLabel=A&energyLabel=B&..., then req.query.energyLabel will be a type of Array
      const labels = Array.isArray(capacity) ? capacity : [capacity];
      const validLabels = labels.filter((label) =>
        acceptedParams.capacity.includes(label),
      );

      if (validLabels.length > 0) {
        const includesOver11 = validLabels.includes("over11");
        const kgLabels = validLabels.filter((label) => label !== "over11");

        filteredData = filteredData.filter((product) => {
          const productCapacity = product.filterData.capacity;
          const matchesKgLabels = kgLabels.includes(productCapacity.toString());
          const matchesOver11 = includesOver11 && productCapacity > 11;

          return matchesKgLabels || matchesOver11;
        });
      }
    }

    // * data sorting
    // * data sorting
    // * data sorting

    let sortedData = [...filteredData];

    if (
      sortBy !== "none" &&
      acceptedParams.sortBy.includes(sortBy.toLowerCase())
    ) {
      sortedData.sort((a, b) => {
        let val1, val2;

        if (sortBy === "score") {
          val1 = a.filterData.popularity[sortBy];
          val2 = b.filterData.popularity[sortBy];
        } else {
          val1 = a.filterData[sortBy];
          val2 = b.filterData[sortBy];
        }

        const diff = val1 - val2;
        // console.log(diff); // DEBUGGING
        return order === "asc" ? diff : -diff;
      });
    }

    // * pagination
    // * pagination
    // * pagination

    const productsPerPage = 6;
    const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
    const startIndex = (pageNum - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;

    const paginatedData = sortedData.slice(startIndex, endIndex);
    const totalProducts = sortedData.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    res.json({
      products: paginatedData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        productsPerPage,
        hasNextPage: pageNum < totalPages,
      },
    });
  } catch (e) {
    const statusCode = e.status || 500;
    res.status(statusCode).json({ message: "Server error has occured" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
