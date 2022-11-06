function startApp() {
  let countriesByContinent;
  let cityAndPopulation;

  function addGlobalEventListenet(type, selector, callback) {
    document.addEventListener(type, (e) => {
      if (e.target.matches(selector)) callback(e);
    });
  }

  async function fetchGet(url) {
    try {
      const res = await axios.get(url).catch(alert);
      return res;
    } catch (err) {
      throw new Error("Something went wrong, check the API url's");
    }
  }

  async function fetchPost(country) {
    try {
      const res = await axios
        .post(
          "https://countriesnow.space/api/v0.1/countries/population/cities/filter",
          {
            limit: "20",
            order: "dsc",
            orderBy: "name",
            country: `${country}`,
          }
        )
        .catch(alert);
      cityAndPopulation = {
        city: [],
        population: [],
      };

      for (let eachCity of res.data.data) {
        const { city } = eachCity;
        const { value } = eachCity.populationCounts[0];
        cityAndPopulation.city.push(city);
        cityAndPopulation.population.push(value);
      }
    } catch (err) {
      throw new Error("Something went wrong");
    }
    return cityAndPopulation;
  }

  async function getCountriesByRegion() {
    const countriesPromises = [];
    const regions = [
      "https://restcountries.com/v3.1/region/Americas",
      "https://restcountries.com/v3.1/region/Africa",
      "https://restcountries.com/v3.1/region/Asia",
      "https://restcountries.com/v3.1/region/Europe",
      "https://restcountries.com/v3.1/region/Oceania",
    ];

    regions.forEach((url) => {
      countriesPromises.push(fetchGet(url));
    });

    const promises = await Promise.all(countriesPromises);
    return promises;
  }

  async function countriesByregion() {
    countriesByContinent;
    countriesByContinent = {
      america: [],
      africa: [],
      europe: [],
      asia: [],
      oceania: [],
    };

    const getCountries = await getCountriesByRegion();
    // console.log(getCountries);
    getCountries.forEach((region) => {
      for (let country of Object.values(region.data)) {
        let countryName = country.name.common;
        let population = country.population;
        if (country.region.includes("Americas")) {
          countriesByContinent.america.push({ countryName, population });
        }
        if (country.region.includes("Africa")) {
          countriesByContinent.africa.push({ countryName, population });
        }
        if (country.region.includes("Asia")) {
          countriesByContinent.asia.push({ countryName, population });
        }
        if (country.region.includes("Europe")) {
          countriesByContinent.europe.push({ countryName, population });
        }
        if (country.region.includes("Oceania")) {
          countriesByContinent.oceania.push({ countryName, population });
        }
      }
    });

    chartCountriesBycount(getCountries);
    return getCountries;
  }

  async function chartJs(labels, data, label) {
    replaceChart();
    const ctx = document.getElementById("myChart");
    const myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: ["rgb(58, 130, 238, 0.5)"],
            borderColor: ["rgba(934, 64, 164, 1)"],
            borderWidth: 1,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  function replaceChart() {
    const myChart = document.querySelector("#myChart");
    myChart.parentNode.replaceChildren(myChart.cloneNode(false));
  }

  addGlobalEventListenet("click", "input", (e) => {
    const target = e.target.value.toLowerCase();
    if (e.target.matches(".americas")) {
      createButtons(target);
    } else if (e.target.matches(".africa")) {
      createButtons(target);
    } else if (e.target.matches(".asia")) {
      createButtons(target);
    } else if (e.target.matches(".europe")) {
      createButtons(target);
    } else if (e.target.matches(".oceania")) {
      createButtons(target);
    }
  });

  addGlobalEventListenet("click", "input", async (e) => {
    if (e.target.matches(".btn")) {
      const target = e.target.value.toLowerCase();
      const result = await fetchPost(target);
      chartCitiesAndPopulation(result);
    }
  });

  async function chartCitiesAndPopulation(data) {
    const citiesAndPopulationObj = await data;
    chartJs(data.city, data.population, "Population By Cities");
  }

  function chartCountriesBycount() {
    const populationCountByContinent = [];
    const labels = ["America", "Africa", "Europe", "Asia", "Oceania"];
    const label = "Population By Continent";
    for (let continent in countriesByContinent) {
      populationCountByContinent.push(
        countriesByContinent[continent].reduce(
          (acc, cur) => acc + cur.population,
          0
        )
      );
    }

    chartJs(labels, populationCountByContinent, label);
  }

  async function chartCountriesPopulation(target) {
    replaceChart();
    const countries = [];
    const population = [];
    if (target) {
      countriesByContinent[target].forEach((e) => {
        countries.push(e.countryName);
        population.push(e.population);
      });
    }
    chartJs(countries, population, "Population By Countries");
  }

  async function createButtons(target) {
    const continentName = target;
    const buttonContainer = document.querySelector(".buttons-container");
    buttonContainer.replaceChildren("");
    // console.log(countriesByContinent);
    countriesByContinent[target].forEach((e) => {
      const button = document.createElement("input");
      button.type = "button";
      button.value = e.countryName;
      button.className = "btn";
      buttonContainer.append(button);
    });
    chartCountriesPopulation(continentName);
  }

  countriesByregion();
}

startApp();
