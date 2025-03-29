document.addEventListener('DOMContentLoaded', () => {
    const tickerSymbolSelect = document.getElementById('ticker-symbol');
    const targetVolatilityInput = document.getElementById('target-volatility');
    const currentAllocationInput = document.getElementById('current-allocation');
    const calculateButton = document.getElementById('calculate-button');
    const adjustedAllocationParagraph = document.getElementById('adjusted-allocation');

    let data = {}; // Store the data from the CSV

    // Function to calculate the adjusted allocation
    function calculateAdjustedAllocation(targetVolatility, currentAllocation, latestVolatility) {
        const targetVolatilityDecimal = targetVolatility / 100;

        // Handle the case where target volatility is greater than latest volatility
        if (targetVolatilityDecimal > latestVolatility) {
            return currentAllocation; // Return the original allocation
        }

        return (targetVolatilityDecimal / latestVolatility) * currentAllocation;
    }

    // Fetch and process the CSV data
    fetch('data.csv')
        .then(response => response.text())
        .then(csv => {
            const lines = csv.split('\n');
            const firstLine = lines[0].split(','); // Get the first line
            const etfTickers = firstLine.slice(1); // Exclude the 'Date' column

            // Populate the ticker symbol dropdown
            etfTickers.forEach(ticker => {
                const option = document.createElement('option');
                option.value = ticker;
                option.textContent = ticker;
                tickerSymbolSelect.appendChild(option);
            });

            // Parse the CSV data into an object (using the *last* line for values)
            const lastLine = lines[lines.length - 1].split(',');
            data = firstLine.reduce((obj, header, index) => { // Use firstLine for headers
                obj[header.trim()] = parseFloat(lastLine[index].trim()); // Parse values as floats
                return obj;
            }, {});

            // Event listener for the calculate button
            calculateButton.addEventListener('click', () => {
                const selectedTicker = tickerSymbolSelect.value;
                const targetVolatility = parseFloat(targetVolatilityInput.value);
                const currentAllocation = parseFloat(currentAllocationInput.value);
                const latestVolatility = data[selectedTicker];

                if (isNaN(targetVolatility) || isNaN(currentAllocation) || isNaN(latestVolatility) || !selectedTicker) { // Added !selectedTicker check
                    adjustedAllocationParagraph.textContent = "Invalid input. Please enter numbers and select a ticker.";
                    return;
                }

                const adjustedAllocation = calculateAdjustedAllocation(targetVolatility, currentAllocation, latestVolatility);
                adjustedAllocationParagraph.textContent = `${adjustedAllocation.toFixed(2)}%`;
            });
        })
        .catch(error => {
            console.error("Error fetching or processing data:", error);
            adjustedAllocationParagraph.textContent = "Error loading data.";
        });
});
