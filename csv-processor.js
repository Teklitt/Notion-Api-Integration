const fs = require('fs')
const csv = require('csv-parser')
const { Client } = require('@notionhq/client')
require('dotenv').config()

const notion = new Client({
  auth: process.env.NOTION_KEY,
})

// Create an array to store the final results
const bookArray = []

//create map to store the rating Information like book name, member name, book rating value
const ratingInfo = new Map()

//EdgeCase(not handled): Handling variations of CSV files (csv with unexpected delimeters)

fs.createReadStream('ratings.csv')

  //EdgeCase: Handling cases for csv files with headers
  .pipe(csv({ headers: false }))
  .on('data', (row) => {
    // Extract and clean data from the CSV row
    const bookName = row[0].trim().toLowerCase()
    const memberName = row[1].trim().toLowerCase()
    const bookRating = parseFloat(row[2])

    // declaring variables that Check if the book is already in the ratingInfo map
    const hasBook = ratingInfo.has(bookName)
    const getBook = ratingInfo.get(bookName)

    if (!hasBook) {
      // If the book is not in the map, create a new entry and initialize them
      ratingInfo.set(bookName, {
        totalRating: 0,
        count: 0,
        favorites: 0,
        lastMemberRatings: new Map(),
      })
    }

    // Get the book entry or the newly created one
    const book = getBook || ratingInfo.get(bookName)

    // Check if the member has a previous rating for the book
    const hasMemberRating = book.lastMemberRatings.has(memberName)
    const getMemberRating = book.lastMemberRatings.get(memberName)

    if (hasMemberRating) {
      // Update the previous rating with the new one
      const previousRating = getMemberRating
      book.totalRating = book.totalRating - previousRating + bookRating
      book.lastMemberRatings.set(memberName, bookRating)

      // Edgecase(handled): The previous rating was 5, but the new rating is not 5, so decrement the favorites count
      if (previousRating === 5 && bookRating !== 5) {
        book.favorites -= 1

        // The previous rating was not 5, but the new rating is 5, so increment the favorites count
      } else if (previousRating !== 5 && bookRating === 5) {
        book.favorites += 1
      }
    } else {
      // Add a new rating for the member
      book.totalRating += bookRating
      book.count += 1
      book.lastMemberRatings.set(memberName, bookRating)
      if (bookRating === 5) {
        book.favorites += 1
      }
    }
  })
  //Edgecase(not handled): if CSV file was empty
  .on('end', () => {
    // Calculate the average rating and create the final result for each book
    for (const [bookName, book] of ratingInfo) {
      bookArray.push({
        bookName,
        averageRating: parseFloat((book.totalRating / book.count).toFixed(1)),
        favorites: book.favorites,
      })
    }

    //console.log(bookArray)
    populateNotionDatabase(bookArray)
  })

async function populateNotionDatabase(books) {
  console.log('Adding Data to Notion...')
  for (let book of books) {
    // Check if the book already exists in the Notion database
    const existingBook = await checkIfBookExists(book.bookName)

    //Edgecase(handled): Where code runs more than once
    //Edgecase(Not handled): Where code runs more than once and certain rows are removed from the csv file
    if (!existingBook) {
      // Book does not exist, create a new entry
      await addBookToDatbase(book)
      console.log('Added new book:', book.bookName)
    } else {
      // Book already exists, check if the rating and favorites are the same
      const existingRating = existingBook.properties.Rating.number
      const existingFavorites = existingBook.properties.Favorites.number

      if (
        existingRating !== book.averageRating ||
        existingFavorites !== book.favorites
      ) {
        // Update the book entry if the rating or favorites are different
        await updateBookInDatabase(existingBook, book)
        console.log('Updated book:', book.bookName)
      } else {
        // Book rating and favorites are the same, do nothing
        console.log(
          'Book rating and favorites are the same, no update needed for:',
          book.bookName
        )
      }
    }
  }
  console.log('Book ratings population completed')
}
async function checkIfBookExists(bookName) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID

    // Using Notion API to query the database
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Book Title',
        title: {
          equals: bookName,
        },
      },
    })

    // Check if any entries match the book name
    if (response.results.length > 0) {
      // Book already exists, return the first matching entry
      const existingBook = response.results[0]
      console.log('Book exists:', bookName)
      return existingBook
    } else {
      // Book does not exist in the database
      console.log('Book does not exist:', bookName)
      return null
    }
  } catch (error) {
    return null // Return null in case of an error
  }
}

async function addBookToDatbase(book) {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        'Book Title': {
          title: [
            {
              type: 'text',
              text: {
                content: book.bookName,
              },
            },
          ],
        },
        Rating: {
          number: book.averageRating,
        },
        Favorites: {
          number: book.favorites,
        },
      },
    })
    // Return the created book entry
    return response
  } catch (error) {
    console.error('Error creating book entry in Notion:', error)
    return null // Return null in case of an error
  }
}

async function updateBookInDatabase(existingBook, newratingInfo) {
  try {
    // Use the Notion API to update the existing book entry
    console.log(
      'Updating book in Notion:',
      existingBook.properties['Book Title'].title[0].text.content
    )
    const response = await notion.pages.update({
      page_id: existingBook.id, // The ID of the existing book entry
      properties: {
        'Book Title': {
          title: [
            {
              type: 'text',
              text: {
                content: newratingInfo.bookName,
              },
            },
          ],
        },
        Rating: {
          number: newratingInfo.averageRating,
        },
        Favorites: {
          number: newratingInfo.favorites,
        },
      },
    })

    // Return the updated book entry
    return response
  } catch (error) {
    console.error('Error updating book entry in Notion:', error)
    return null // Return null in case of an error
  }
}
