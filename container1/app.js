const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const PORT = 6000;

const app = express();
app.use(express.json());

const PERSISTENT_VOLUME_PATH = '/rushil_PV_dir'; // Define the persistent volume path

// Ensure the directory exists
if (!fs.existsSync(PERSISTENT_VOLUME_PATH)) {
    console.log(`Directory ${PERSISTENT_VOLUME_PATH} does not exist. Creating...`);
    fs.mkdirSync(PERSISTENT_VOLUME_PATH, { recursive: true });
}

// Endpoint to handle POST requests to /store-file
app.post('/store-file', (req, res) => {
    const { file, data } = req.body;

    console.log("Store file API called with file:", file);
    console.log("Store file API called with data:", data);

    if (!file || !data) {
        console.error("Invalid JSON input.");
        return res.status(400).json({ file: null, error: 'Invalid JSON input.' });
    }

    const filePath = path.join(PERSISTENT_VOLUME_PATH, file);
    console.log("Storing file at:", filePath);
    fs.writeFile(filePath, data, (err) => {
        if (err) {
            console.error("Error while storing the file:", err);
            return res.status(500).json({ file, error: 'Error while storing the file to the storage.' });
        }
        console.log("File stored successfully.");
        res.status(200).json({ file, message: 'Success.' });
    });
});

// Endpoint to handle POST requests to /calculate
app.post('/calculate', async (req, res) => {
    const { file, product } = req.body;

    console.log("Calculate API called with file:", file);
    console.log("Calculate API called with product:", product);

    if (!file || !product) {
        console.error("Invalid JSON input.");
        return res.json({ file: null, error: 'Invalid JSON input.' });
    }

    const filePath = path.join(PERSISTENT_VOLUME_PATH, file);
    console.log("File path for calculation", filePath);
    if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return res.json({ file, error: 'File not found.' });
    }

    try {
        console.log("Sending request to Container 2...");
        const response = await axios.post('http://container2-service:90/calculate', { file, product });
        console.log("Received response from Container 2:", response.data);

        return res.json(response.data); // Return the response from container 2
    } catch (error) {
        console.error("Error communicating with Container 2:", error);
        return res.json({ file, error: 'Error communicating with container2.' });
    }
});

// Start the server and listen on port 6000
app.listen(PORT, () => {
    console.log(`Container 1 is running on port ${PORT}`);
});
