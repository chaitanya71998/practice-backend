const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server is running at localhost 3000");
    });
  } catch (error) {
    console.log(`DB initialization Error${error}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// get all movies names api
app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = "SELECT movie_name FROM movie";

  const moviesList = await db.all(getMoviesListQuery);
  const formattedMoviesList = moviesList.map((movie) => {
    return {
      movieName: movie.movie_name,
    };
  });
  response.send(formattedMoviesList);
});

//create movie api
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    INSERT INTO  
    movie(movie_name,lead_actor,director_id)
    VALUES(
       "${movieName}","${leadActor}",${directorId}
    );
`;
  await db.run(updateMovieQuery);
  response.send("Movie Successfully Added");
});

// get movie api
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
     SELECT
        *
    FROM
        movie
    WHERE
        movie_id = ${movieId};`;

  const movie = await db.all(getMovieQuery);
  response.send({
    movieId: movie[0].movie_id,
    directorId: movie[0].director_id,
    movieName: movie[0].movie_name,
    leadActor: movie[0].lead_actor,
  });
});

//update movie data API
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;

  const updateMovieDetailsQuery = `
    UPDATE
        movie
    SET
      movie_name = "${movieName}",  lead_actor ='${leadActor}',director_id=${directorId}
    WHERE
        movie_id = ${movieId};`;

  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//delete movie data API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE
    FROM
        movie
    WHERE
        movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Returns a list of all directors in the director table
app.get("/directors/", async (request, response) => {
  const getDirectorsList = "SELECT * FROM director";

  const directorsList = await db.all(getDirectorsList);
  const formattedDirectorsList = directorsList.map((directorObject) => {
    return {
      directorId: directorObject.director_id,
      directorName: directorObject.director_name,
    };
  });
  response.send(formattedDirectorsList);
});
// get list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNamesList = `
  SELECT 
  movie_name
  FROM
  movie
  WHERE
  director_id = ${directorId}`;

  const moviesNamesList = await db.all(getMovieNamesList);
  const formattedMovieNamesList = moviesNamesList.map((movie) => {
    return {
      movieName: movie.movie_name,
    };
  });
  response.send(formattedMovieNamesList);
});
module.exports = app;
