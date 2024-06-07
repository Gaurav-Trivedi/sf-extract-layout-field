#!/usr/bin/env node
import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';
import { exec } from 'child_process';

// Function to extract data from the JSON structure
function extractData(jsonData) {
    const extractedData = [];

    if (jsonData.detailLayoutSections) {
        jsonData.detailLayoutSections.forEach(section => {
            const header = section.heading;
            section.layoutRows.forEach(row => {
                row.layoutItems.forEach(item => {
                    if (item.layoutComponents && item.layoutComponents.length > 0) {
                        item.layoutComponents.forEach(component => {
                            const details = component.details || {};
                            extractedData.push({
                                'Header': header,
                                'Label': item.label || '',
                                'Api Name': details.name || '',
                                'Character Limit': details.length || '',
                                'Data Type': details.type || component.type || '',
                                'Parent Reference': (details.referenceTo || []).join(', '),
                                'Relationship Name': details.relationshipName || '',
                                'Formula or VF url': details.calculatedFormula || component.url || ''
                            });
                        });
                    }
                });
            });
        });
    } else {
        console.error('detailLayoutSections is not present in the JSON response');
    }

    return extractedData;
}

// Function to convert data to Excel and write it to file
function convertToExcel(data, outputFilePath) {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    xlsx.writeFile(workbook, outputFilePath);
}

async function fetchLayoutDetails(url, headers) {
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return await response.json();
}

// Helper function to display usage instructions
function showHelp(message) {
    if (message) {
        console.error(`Error: ${message}\n`);
    }
    console.log('Usage:');
    console.log('\tnode layoutFields.js -ob <objectAPIName> -o <orgAlias>');
    console.log('Options:');
    console.log('\t-ob\t\tObject API Name.');
    console.log('\t-o\t\tSalesforce org alias to use for authentication.');
    process.exit(1);
}

async function main() {
    if (!process.argv.includes('-ob')) {
        showHelp('Object API Name (-ob) is required.');
    }

    if (!process.argv.includes('-o')) {
        showHelp('Salesforce org alias (-o) is required.');
    }

    const objectApiName = process.argv.includes('-ob') ? `${process.argv[process.argv.indexOf('-ob') + 1]}` : '';
    const orgAlias = process.argv.includes('-o') ? `-o ${process.argv[process.argv.indexOf('-o') + 1]}` : '';

    exec(`sf org display ${orgAlias} --json`, async function (error, stdout, stderr) {
        if (error !== null) {
            console.error('exec error: ' + error);
            process.exit(1);
        }

        let s;
        try {
            s = JSON.parse(stdout).result;
        } catch (parseError) {
            console.error('Error parsing JSON from sf org display:', parseError);
            process.exit(1);
        }

        const accessToken = s.accessToken;
        const instanceUrl = s.instanceUrl;
        const apiUrl = `${instanceUrl}/services/data/v50.0/sobjects/${objectApiName}/describe/layouts`;

        console.log('Making API call to:', apiUrl);

        // Call Salesforce API to get recordTypeMappings
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }

            const jsonData = await response.json();
            const recordTypeMappings = jsonData.recordTypeMappings;

            // Ensure the layouts folder exists
            const layoutsDir = `layouts/${objectApiName}`;
            if (!fs.existsSync(layoutsDir)) {
                fs.mkdirSync(layoutsDir, { recursive: true });
            }

            // Loop through each recordTypeMapping to fetch and save layout details
            for (const recordType of recordTypeMappings) {
                const layoutUrl = `${instanceUrl}${recordType.urls.layout}`;
                const layoutDetails = await fetchLayoutDetails(layoutUrl, {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                });

                // Extract data from the layout details
                const extractedData = extractData(layoutDetails);

                // Create Excel file name using developerName and save under layouts folder
                const outputFilePath = path.join(layoutsDir, `${recordType.developerName}.xlsx`);

                // Convert extracted data to Excel and write it to file
                convertToExcel(extractedData, outputFilePath);

                console.log(`Excel file has been created: ${outputFilePath}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

main();