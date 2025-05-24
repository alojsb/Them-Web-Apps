import React, { useState, useEffect } from 'react';
import countriesData from './countries.json'; // Import the JSON file

const CountryList = () => {
  const initialFilterState = {
    startsWith: '',
    containsSubstring: '',
    endsWith: '',
    continent: '',
    population: 0,
    capital: '',
    landlocked: false,
    independent: false,
    dependency: false,
    belongsTo: '',
    neighbor: '',
    topNByArea: '',
    topNByPopulation: ''
  };

  const [filteredCountries, setFilteredCountries] = useState([]);
  const [filteredTerritories, setFilteredTerritories] = useState([]);
  const [filter, setFilter] = useState(initialFilterState);

  // Extract unique governing countries from countriesData
  const governingCountries = Array.from(
    new Set(countriesData
      .filter(country => country.belongsTo) // Only territories/dependencies
      .map(country => country.belongsTo)
    )
  );

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
    
    // Apply all filters
    if (filter.startsWith) {
      result = result.filter(country =>
        country.name.toLowerCase().startsWith(filter.startsWith.toLowerCase())
      );
    }
    if (filter.containsSubstring) {
      result = result.filter(country => 
        country.name.toLowerCase().includes(filter.containsSubstring.toLowerCase())
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
    if (filter.independent) {
      result = result.filter(country => country.independent === filter.independent);
    }
    if (filter.dependency) {
      result = result.filter(country => country.independent !== filter.dependency);
    }
    if (filter.belongsTo) {
      result = result.filter(country => country.belongsTo === filter.belongsTo)
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
        .sort((a, b) => b.area - a.area)
        .slice(0, filter.topNByArea);
    }

    // Sort and return top N countries by population
    if (filter.topNByPopulation) {
      result = result
        .sort((a, b) => b.population - a.population)
        .slice(0, filter.topNByPopulation);
    }

    // Separate filtered results into countries and territories
    const countries = result.filter(country => 
      country.independent === true
    );
    const territories = result.filter(country => country.independent === false || country.independent === undefined);

    setFilteredCountries(countries);
    setFilteredTerritories(territories);
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
      {/* Filter Inputs */}
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
        <label>Contains: </label>
        <input
          type="text"
          name="containsSubstring"
          value={filter.containsSubstring}
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
        <label>Independent: </label>
        <input
          type="checkbox"
          name="independent"
          checked={filter.independent}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Dependency: </label>
        <input
          type="checkbox"
          name="dependency"
          checked={filter.dependency}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Belongs to: </label>
        <select
          name="belongsTo"
          value={filter.belongsTo}
          onChange={handleInputChange}
        >
          <option value="">Select a country</option>
          {governingCountries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
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
      <div>
        <label>Top N Countries by Population: </label>
        <input
          type="number"
          name="topNByPopulation"
          value={filter.topNByPopulation}
          onChange={handleInputChange}
        />
      </div>

      {/* Clear Button */}
      <button onClick={clearFilters}>Clear</button>

      <h2>Countries that match the criteria {"(" + (filteredCountries.length) + ")"}:</h2>
      <ul>
        {filteredCountries.map((country) => (
          <li key={country.name}>
            <img src={country.flagUrl} alt={`${country.name} flag`} loading="lazy" width="20" height="15" style={{ marginRight: '8px' }} />
            <strong>{country.name}</strong> - Population: {formatPopulation(country.population)}, Area: {formatArea(country.area)}, Continent(s): {country.continent}, Capital: {country.capital}, Landlocked: {country.landlocked ? 'Yes' : 'No'}, Neighbors: {getNeighborNames(country.borders)}
          </li>
        ))}
      </ul>

      <h2>Other Territories/Dependencies that match the criteria {"(" + (filteredTerritories.length) + ")"}:</h2>
      <ul>
        {filteredTerritories.map((territory) => (
          <li key={territory.name}>
            <strong>{territory.name}</strong> - Population: {formatPopulation(territory.population)}, Area: {formatArea(territory.area)}, Continent(s): {territory.continent}, Capital: {territory.capital}, Landlocked: {territory.landlocked ? 'Yes' : 'No'}, Neighbors: {getNeighborNames(territory.borders)}
          </li>
        ))}
      </ul>

    </div>
  );
};

export default CountryList;
