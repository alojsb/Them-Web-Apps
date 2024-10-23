import React, { useState, useEffect } from 'react';
import countriesData from './countries.json'; // Import the JSON file

const CountryList = () => {
  const initialFilterState = {
    startsWith: '',
    endsWith: '',
    continent: '',
    population: 0,
    capital: '',
    landlocked: false,
    neighbor: '',
    topNByArea: '' // New field for top N countries by area
  };

  const [filteredCountries, setFilteredCountries] = useState([]);
  const [filter, setFilter] = useState(initialFilterState);

  // Function to format population with thousands separator and comma for decimals
  const formatPopulation = (population) => {
    return new Intl.NumberFormat('de-DE').format(population);
  };

  // Function to format area with thousands separator
  const formatArea = (area) => {
    return new Intl.NumberFormat('de-DE').format(area) + ' km²';
  };

  // Function to map border country codes to full country names
  const getNeighborNames = (borders) => {
    return borders
      .map(code => {
        const neighbor = countriesData.find(country => country.threeLetterISOCountryCode === code);
        return neighbor ? neighbor.name : code;
      })
      .join(', ');
  };

  // Function to filter countries based on conditions
  const filterCountries = () => {
    let result = countriesData;
    
    if (filter.startsWith) {
      result = result.filter(country =>
        country.name.toLowerCase().startsWith(filter.startsWith.toLowerCase())
      );
    }
    if (filter.endsWith) {
      result = result.filter(country =>
        country.name.toLowerCase().endsWith(filter.endsWith.toLowerCase())
      );
    }
    if (filter.continent) {
      result = result.filter(country =>
        country.continent.toLowerCase().includes(filter.continent.toLowerCase())
      );
    }
    if (filter.population > 0) {
      result = result.filter(country => country.population < filter.population);
    }
    if (filter.capital) {
      result = result.filter(country =>
        country.capital.toLowerCase().includes(filter.capital.toLowerCase())
      );
    }
    if (filter.landlocked) {
      result = result.filter(country => country.landlocked === filter.landlocked);
    }

    // Filter by neighboring country
    if (filter.neighbor) {
      const neighborCountry = countriesData.find(country =>
        country.name.toLowerCase().includes(filter.neighbor.toLowerCase())
      );

      if (neighborCountry) {
        const neighborCode = neighborCountry.threeLetterISOCountryCode;
        result = result.filter(country =>
          country.borders.includes(neighborCode)
        );
      } else {
        result = [];
      }
    }

    // Sort and return top N countries by area
    if (filter.topNByArea) {
      result = result
        .sort((a, b) => b.area - a.area) // Sort by area descending
        .slice(0, filter.topNByArea); // Take the top N
    }

    setFilteredCountries(result);
  };

  // Re-run the filter whenever the filter changes
  useEffect(() => {
    filterCountries();
  }, [filter]);

  // Handlers for input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilter({
      ...filter,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handler to clear all filters
  const clearFilters = () => {
    setFilter(initialFilterState); // Reset the filter state to its initial values
  };

  return (
    <div>
      <h1>Country Quiz</h1>
      <div>
        <label>Starts With: </label>
        <input
          type="text"
          name="startsWith"
          value={filter.startsWith}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Ends With: </label>
        <input
          type="text"
          name="endsWith"
          value={filter.endsWith}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Continent: </label>
        <input
          type="text"
          name="continent"
          value={filter.continent}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Capital: </label>
        <input
          type="text"
          name="capital"
          value={filter.capital}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Landlocked: </label>
        <input
          type="checkbox"
          name="landlocked"
          checked={filter.landlocked}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Neighboring Country: </label>
        <input
          type="text"
          name="neighbor"
          value={filter.neighbor}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Population Less Than: </label>
        <input
          type="number"
          name="population"
          value={filter.population}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Top N Countries by Area: </label>
        <input
          type="number"
          name="topNByArea"
          value={filter.topNByArea}
          onChange={handleInputChange}
        />
      </div>

      {/* Clear Button */}
      <button onClick={clearFilters}>Clear</button>

      <h2>Countries that match the criteria:</h2>
      <ul>
        {filteredCountries.map((country) => (
          <li key={country.name}>
            <strong>{country.name}</strong> - Population: {formatPopulation(country.population)}, Area: {formatArea(country.area)}, Continent(s): {country.continent}, Capital: {country.capital}, Landlocked: {country.landlocked ? 'Yes' : 'No'}, Neighbors: {getNeighborNames(country.borders)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CountryList;
