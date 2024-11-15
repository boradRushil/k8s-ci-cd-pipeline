const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const PORT = 2000;
const PERSISTENT_VOLUME_PATH = '/rushil_PV_dir';

const app = express();
app.use(express.json());

const cleanKey = (key) => key.trim().replace(/^['"]+|['"]+$/g, '');

app.post('/calculate', (req, res) => {
    const { file, product } = req.body;
    console.log("Calculate API called with file:", file);
    if (!file || !product) {
        return res.status(400).json({ error: "Invalid JSON input." });
    }

    const results = [];
    const filePath = path.join(PERSISTENT_VOLUME_PATH, file);
    const fileExtension = path.extname(file);

    let csvFormatValid = true;

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            // Clean the keys of the row
            const cleanedRow = {};
            for (const [key, value] of Object.entries(row)) {
                cleanedRow[cleanKey(key)] = value.trim();
            }

            if (cleanedRow.product === product) {
                // Parse 'amount' as a base-10 integer and add it to results array
                results.push(parseInt(cleanedRow.amount, 10));
            }
            // Check for mandatory fields
            if (!cleanedRow.product || !cleanedRow.amount) {
                csvFormatValid = false;
            }
        })
        .on('end', () => {
            // Sum up all values in the results array
            const sum = results.reduce((acc, curr) => acc + curr, 0);

            // Validate CSV format
            if (!csvFormatValid || results.length === 0) {
                return res.json({
                    file,
                    error: "Input file not in CSV format."
                });
            }

            res.json({ file, sum });
        })
        .on('error', () => {
            res.json({ file, error: "Input file not in CSV format." });
        });
});

app.listen(PORT, () => {
    console.log(`Container 2 is running on port ${PORT}`);
});
