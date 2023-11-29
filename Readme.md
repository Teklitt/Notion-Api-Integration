# CSV to Notion Database Populator

## Description

This program reads data from a CSV file (ratings.csv) containing book name, membername and ratings, processes it to calculate average ratings for each book, favorite counts, and then populates a Notion database with the results.

## How to Run

Before running the program, make sure you have the following prerequisites:

- Node.js installed on your system (npm install node).
- Notion API credentials set up with your database ID and Notion API key stored in the `.env` file.
- The required Node.js packages installed, including `csv-parser`, `axios`, and `@notionhq/client`.

To execute the program, follow these steps:

1. Open your terminal.
2. Navigate to the project directory.
3. Run the program using the following command:

```shell
node csv-processor.js
```

## Challenges

During the development of this program, I encountered several challenges, including:

1. Issues reading the CSV file due to the absence of column headers.
2. Managing favorites count based on the last member's rating.
3. Querying the database to prevent multiple rows for the same book.
4. Structuring the Node application efficiently, to have separate files for CSV processing and Notion database connection.
5. learning new Javascript syntax

Despite these challenges, I successfully overcame them with the help of external resources, such as Stack Overflow, YouTube tutorials, and GitHub repositories with similar projects.

## Improving API Documentation

- One area for improvement in the API Documentation will be better classification and simplification of different object properties. All properties should be listed in one page with a table containing their 'Type', 'Description' and 'Example Value'

- Include more detailed and real-world examples of API requests using Axios. These examples should cover various use cases and provide a step-by-step guide on how to construct and send requests. Additionally, please ensure that response examples are also available to help developers understand the expected response format.

## Sources

Here are the primary sources and references I used during the development of this project:

- Notion API Documentation: Notion API Docs

- Node.js Documentation: Node.js Docs

- Getting started and use of axios:
  https://www.youtube.com/watch?v=ec5m6t77eYM&t=241s

- Notion database creation:
  https://github.com/makenotion/notion-sdk-js/blob/main/examples/intro-to-notion-api/intermediate/1-create-a-database.js

- Helped with reading ratings.csv due to no column headers:
  https://stackoverflow.com/questions/65416405/numeric-column-header-for-parsed-csv-in-javascript

- Helped with updating the database after querying:
  https://stackoverflow.com/questions/71698638/how-to-update-database-item-using-the-notion-api

- Filter Issue:
  https://stackoverflow.com/questions/70619530/validation-error-while-updating-pages-in-notion-by-using-the-notion-javascript-s

## Dependencies

csv-parser: Used for parsing the CSV file.
axios: Used for sending data to the Notion database.
@notionhq/client: Used for working with the Notion API.

## Edge Cases

- Edge case(handled): The previous rating was 5, but the new rating is not 5, so decrement the favorites count.
- Edgecase(handled): Where code runs more than once and duplicates row.
- Edge Case(not handled): Handling variations of CSV files (csv with unexpected delimeters).
- Edge Case(not handled): Handling cases for csv files with headers.
- Edge Case(not handled): if CSV file was empty.
- Edge Case(not handled): Where code runs more than once and certain rows are removed from the csv file
- Edge Case(not handled): Code Optimization: In situations where we have more data to populate and process.

## Testing to ensure rows are not duplicated

New Book Test,Cory E,1.5
New Book Test 2,Gabby H,0
New Book Test,Tess L,5
New Book Test 2,Bill C,5
New Book Test ,Scott D,5
