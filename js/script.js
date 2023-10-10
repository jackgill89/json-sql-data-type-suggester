$(document).ready(function() {
    $("#submitBtn").click(function () {
        try {
            const jsonInput = JSON.parse($("#jsonInput").val());
            const suggestions = suggestSqlDataTypes(jsonInput);
            $("#output").text(JSON.stringify(suggestions, null, 4)).show();
            $(".output-header").show();

            const createTableQuery = generateCreateTableQuery(jsonInput, suggestions, 'users');
            $("#sqlOutput").text(createTableQuery).show();

            // Hide error message if input is valid
            $("#errorMsg").hide();
        } catch (e) {
            // Show error message if input is invalid
            $("#errorMsg").text("An error occurred: " + e.message + ". Please check your JSON formatting.").show();
            // Hide the output areas
            $("#output, #sqlOutput, .output-header").hide();
        }
    });

    $("#infoIcon").click(function () {
        $("#infoModal").css("display", "flex");
    });

    // When the close icon is clicked, hide the modal
    $("#closeModal").click(function () {
        $("#infoModal").hide();
    });

    // When anywhere outside of the modal content is clicked, hide the modal
    $(window).click(function (event) {
        if ($(event.target).is("#infoModal")) {
            $("#infoModal").hide();
        }
    });
});


function suggestSqlDataTypes(jsonInput) {
    const suggestions = {};

    for (const key in jsonInput) {
        const value = jsonInput[key];
        const type = typeof value;

        switch (type) {
            case 'number':
                suggestions[key] = Number.isInteger(value) ? 'INT' : 'FLOAT';
                break;
            case 'string':
                if (Date.parse(value)) {
                    suggestions[key] = 'DATETIME';
                } else {
                    suggestions[key] = `VARCHAR(${value.length + 10})`;
                }
                break;
            case 'boolean':
                suggestions[key] = 'BOOLEAN';
                break;
            case 'object':
                if (value === null) {
                    suggestions[key] = 'NULL'; // Adjust as per your use case
                } else {
                    suggestions[key] = 'TEXT'; // For objects or arrays
                }
                break;
            default:
                suggestions[key] = 'TEXT';
        }
    }
    return suggestions;
}

function generateCreateTableQuery(jsonInput, suggestions, tableName = 'my_table') {
    let query = `CREATE TABLE ${tableName} (\n`;

    const columns = [];
    for (const key in suggestions) {
        let dataType = suggestions[key];
        if (dataType === 'NULL') {
            dataType = 'VARCHAR(255)'; // Defaulting NULL type to VARCHAR(255), adjust as needed
        }
        columns.push(`  ${key} ${dataType}`);
    }
    query += columns.join(',\n');
    query += '\n);';

    return query;
}

// Example usage:
const jsonInput = {
    name: 'John',
    age: 30,
    height: 5.9,
    isStudent: false,
    birthdate: '1993-05-15',
};

const suggestions = suggestSqlDataTypes(jsonInput);
console.log(suggestions);

const createTableQuery = generateCreateTableQuery(jsonInput, suggestions, 'users');
console.log(createTableQuery);
