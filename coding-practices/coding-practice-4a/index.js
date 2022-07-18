const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db"); // have the db like above with 
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

function format(players) {
  return {
    playerId: players.player_id,
    playerName: players.player_name,
    jerseyNumber: players.jersey_number,
    role: players.role,
  };
}
// Get players API
app.get("/players/", async (request, response) => {
  const getCricketTeamQuery = "SELECT * FROM cricket_team";

  const playerArray = await db.all(getCricketTeamQuery);
  const formattedPlayerArray = playerArray.map((player) => format(player));
  response.send(formattedPlayerArray);
});

//create post API
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayersQuery = `
    INSERT INTO  
    cricket_team(player_name,jersey_number,role)
    VALUES(
       "${playerName}",${jerseyNumber},"${role}"
    );
`;

  await db.run(updatePlayersQuery);
  response.send("Player Added to Team");
});

//Get player API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
        *
    FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  response.send(format(player));
});

//update player API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerQuery = `
    UPDATE
        cricket_team
    SET
      player_id = ${playerId},  player_name ='${playerName}',jersey_number=${jerseyNumber},role='${role}'
    WHERE
        player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerQuery = `
    DELETE
    FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;

  const player = await db.run(updatePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
