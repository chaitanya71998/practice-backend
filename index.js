const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

let db = null;
const dbPath = path.join(__dirname, "goodreads.db");
initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT * FROM book ORDER by book_id;
    `;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
