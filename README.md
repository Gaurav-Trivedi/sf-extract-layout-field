# Salesforce Layout Fields to Excel Utility

This utility script fetches layout details from Salesforce and exports them to Excel files. The script uses Salesforce CLI to authenticate and make API calls to Salesforce to retrieve layout details for a specified object. The layout details are then extracted and saved into an Excel file, organized under a directory structure.

## Prerequisites

- Node.js (v12 or higher)
- Salesforce CLI (sf)

## Installation

1. Clone the repository or download the script files to your local machine.
2. Navigate to the project directory.

    ```bash
    cd your_project_directory
    ```

3. Install the required npm packages.

    ```bash
    npm install
    nmp i sf-layout-to-excel -g
    ```

## Usage

```bash
sf-layout-to-excel -ob <objectAPIName> -o <orgAlias>
```

# Description
The script performs the following steps:

* **Argument Validation**: Ensures that both -ob and -o arguments are provided.
* **Salesforce Authentication**: Uses Salesforce CLI to authenticate and fetch access tokens and instance URLs.
* **Fetch Layout Details**: Makes API calls to Salesforce to retrieve layout details for the specified object.
* **Extract Data**: Extracts relevant information from the layout details JSON response.
* **Generate Excel Files**: Converts the extracted data into Excel files and saves them under the `layouts/<objectAPIName>/` directory.
# Functions
### extractData(jsonData)
Extracts layout data from the provided JSON structure and returns it as an array of objects.

### convertToExcel(data, outputFilePath)
Converts the provided data into an Excel file and writes it to the specified file path.

### fetchLayoutDetails(url, headers)
Fetches layout details from the given URL with the specified headers and returns the JSON response.

### showHelp(message)
Displays usage instructions and exits the process if required arguments are missing.

### main()
Main function that orchestrates the workflow, including argument validation, Salesforce authentication, fetching layout details, and generating Excel files.

# Error Handling
* Ensures required arguments are provided.
* Handles JSON parsing errors from the Salesforce CLI response.
* Catches and logs errors during API calls and file operations.
# License
This project is licensed under the MIT License - see the LICENSE file for details.

# Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Authors
Gaurav Trivedi - [GitHub](https://github.com/Gaurav-Trivedi)
