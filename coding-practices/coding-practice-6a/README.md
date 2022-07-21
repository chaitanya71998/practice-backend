# Covid-19 India

Given two files `app.js` and a database file `covid19India.db` consisting of two tables `state` and `district`.

Write APIs to perform CRUD operations on the tables `state`, `district` containing the following columns,

**State Table**

| Columns    | Type    |
| ---------- | ------- |
| state_id   | INTEGER |
| state_name | TEXT    |
| population | INTEGER |

**District Table**

| Columns       | Type    |
| ------------- | ------- |
| district_id   | INTEGER |
| district_name | TEXT    |
| state_id      | INTEGER |
| cases         | INTEGER |
| cured         | INTEGER |
| active        | INTEGER |
| deaths        | INTEGER |
