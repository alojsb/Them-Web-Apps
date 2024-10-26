const fs = require('fs');
const path = require('path');

// Define a mapping of dependencies/territories to parent countries
const belongsToMapping = {
    "South Georgia": "United Kingdom",
    "Wallis and Futuna": "France",
    "Pitcairn Islands": "United Kingdom",
    "Caribbean Netherlands": "Netherlands",
    "Northern Mariana Islands": "United States",
    "Saint Barthélemy": "France",
    "Guernsey": "United Kingdom",
    "Svalbard and Jan Mayen": "Norway",
    "Faroe Islands": "Denmark",
    "Palestine": "Disputed",
    "Aruba": "Netherlands",
    "Cook Islands": "New Zealand",
    "Christmas Island": "Australia",
    "Tokelau": "New Zealand",
    "Réunion": "France",
    "Montserrat": "United Kingdom",
    "United States Virgin Islands": "United States",
    "Antarctica": "International",
    "Puerto Rico": "United States",
    "Mayotte": "France",
    "Norfolk Island": "Australia",
    "Bouvet Island": "Norway",
    "Isle of Man": "United Kingdom",
    "Greenland": "Denmark",
    "French Southern and Antarctic Lands": "France",
    "Saint Pierre and Miquelon": "France",
    "Macau": "China",
    "Sint Maarten": "Netherlands",
    "Turks and Caicos Islands": "United Kingdom",
    "Cocos (Keeling) Islands": "Australia",
    "Western Sahara": "Disputed",
    "French Polynesia": "France",
    "Guadeloupe": "France",
    "Gibraltar": "United Kingdom",
    "New Caledonia": "France",
    "Saint Helena, Ascension and Tristan da Cunha": "United Kingdom",
    "British Virgin Islands": "United Kingdom",
    "Niue": "New Zealand",
    "Heard Island and McDonald Islands": "Australia",
    "Hong Kong": "China",
    "Curaçao": "Netherlands",
    "French Guiana": "France",
    "Åland Islands": "Finland",
    "United States Minor Outlying Islands": "United States",
    "Falkland Islands": "United Kingdom",
    "Jersey": "United Kingdom",
    "Bermuda": "United Kingdom",
    "British Indian Ocean Territory": "United Kingdom",
    "Martinique": "France",
    "Cayman Islands": "United Kingdom",
    "Guam": "United States",
    "Saint Martin": "France",
    "American Samoa": "United States",
    "Anguilla": "United Kingdom"
  };  

// Load the countries.json data
const countriesFilePath = path.join(__dirname, '../src/countries.json');
const countriesData = JSON.parse(fs.readFileSync(countriesFilePath, 'utf-8'));

// Enrich the data with the belongsTo attribute
const enrichedCountries = countriesData.map(country => {

    const territoryName = country.name;
    // Specifically set Taiwan as independent
    if (territoryName === "Taiwan" || territoryName === "Kosovo") {
        country.independent = true;
    }
  if (belongsToMapping[territoryName]) {
    country.belongsTo = belongsToMapping[territoryName];
  }



  return country;
});

// Write the enriched data back to countries.json
fs.writeFileSync(countriesFilePath, JSON.stringify(enrichedCountries, null, 2));

console.log('countries.json has been enriched with belongsTo attribute for specified territories.');
