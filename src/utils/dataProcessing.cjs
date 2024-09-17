const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Parser } = require('json2csv');

const OPEN_MIC_RAW_CSV_PATH = '../../data/wa_open_mic_data.csv';
const OPEN_MIC_CLEAN_PATH = '../../data/clean_open_mic_data.csv';

const GEOAPIFY_QUERY_URL = 'https://api.geoapify.com/v1/geocode/search?text=';
const GEOAPIFY_API_KEY = 'XXXXX';

// Paths for input/output files
const inputFilePath = path.join(__dirname, OPEN_MIC_RAW_CSV_PATH);  // Input CSV file
const outputFilePath = path.join(__dirname, OPEN_MIC_CLEAN_PATH); // Output CSV file with new headers

// Mapping header names
const headerMapping = {
    'Name (club)': 'Name',
    'Location': 'Address',
    'Time Signup/Start': 'Signup/Start',
};

// Headers to remove
const headersToRemove = ['Wheelchair accessible', 'Age requirement', 'Open mic type', 'Email', 'Parking', 'Phone'];

// Get coordinates from address using API
async function getCoordinates(address) {
    try {
        const response = await fetch(`${GEOAPIFY_QUERY_URL}${encodeURIComponent(address)}&format=json&apiKey=${GEOAPIFY_API_KEY}`);
        const data = await response.json();

        return [
            data.results[0].lat, 
            data.results[0].lon,
        ]

    } catch (error) {
        console.error(`Error fetching coordinates for ${address}:`, error);
        return null;
    }
}

// Read the CSV and return an array of objects (rows)
async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => data.push(row))
            .on('end', () => resolve(data))
            .on('error', (err) => reject(err));
    });
}

// Rename headers in each row based on the headerMapping
function renameHeaders(data) {
    return data.map(row => {
        const renamedRow = {};
        for (const [key, value] of Object.entries(row)) {
            const newKey = headerMapping[key] || key;
            renamedRow[newKey] = value;
        }
        return renamedRow;
    });
}

// Remove specified headers from each row
function removeHeaders(data) {
    return data.map(row => {
        const filteredRow = {};
        for (const [key, value] of Object.entries(row)) {
            if (!headersToRemove.includes(key)) {
                filteredRow[key] = value; // Keep only the headers that are not in the headersToRemove list
            }
        }
        return filteredRow;
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function addCoordinates(data) {
    const results = [];

    for (const row of data) {
        // Await the result of getCoordinates
        row['Coordinates'] = await getCoordinates(row['Address']);
        
        // Push the updated row to the results array
        results.push(row);
        
        // Wait for 1 second before processing the next row, API rate limiting requirement
        await delay(1000);
    }

    return results;
}

// Get the new headers based on the mapping and the original headers
function getNewHeaders(originalHeaders) {
    return originalHeaders
        .map(header => headerMapping[header] || header)
        .filter(header => !headersToRemove.includes(header)) // Exclude headers you want to remove
        .concat('Coordinates'); // Add the new column to the headers
}

// Write the processed data to a new CSV file
async function writeCSV(data, headers, filePath) {
    const json2csvParser = new Parser({ fields: headers });
    const csvData = json2csvParser.parse(data);

    fs.writeFileSync(filePath, csvData);
    console.log('CSV file saved as:', filePath);
}

// Main function to process the CSV
async function dataProcessing() {
    try {
        // Step 1: Read the CSV file
        const data = await readCSV(inputFilePath);

        // TODO: Clean data with no addresses for example

        // Step 2: Rename the headers in each row
        const renamedData = renameHeaders(data);

        // Step 3: Remove unwanted headers from the data
        const filteredData = removeHeaders(renamedData);

        // Step 4: Add the new column to the data
        const dataWithNewColumn = await addCoordinates(filteredData);

        // Step 5: Get the new headers from the first row
        const originalHeaders = Object.keys(data[0]);
        const newHeaders = getNewHeaders(originalHeaders);

        // Step 6: Write the new CSV
        await writeCSV(dataWithNewColumn, newHeaders, outputFilePath);
    } catch (err) {
        console.error('Error processing CSV:', err);
    }
}

dataProcessing();
