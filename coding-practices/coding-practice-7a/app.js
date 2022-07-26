const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at localhost:3000");
    });
  } catch (error) {
    console.log(`Db initialization Error ${error}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Returns a list of all the players in the player table
app.get("/players/", async (request, response) => {
  const getPlayersListQuery = `select * from player_details`;
  const playersList = await db.all(getPlayersListQuery);
  const formattedPlayersList = playersList.map((player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    };
  });
});
// Returns a specific player based on the player id
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    select *
    from player_details
    where player_id = ${playerId}
    `;
  const playerDetails = await db.all(getPlayerQuery);
  const formattedPlayerDetails = playerDetails.map((player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    };
  });
  response.send(formattedPlayerDetails[0]);
});

// 3. Updates the details of a specific player based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerName } = request.body;
  const { playerId } = request.params;
  const updatePlayerDetailsQuery = `
  update
  player_details
    set player_name = '${playerName}'
    where player_id = ${playerId}
  `;

  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Update");
});

//4. returns the match details of a specific match
app.get("/matches/:matchId/", async () => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
  select *
  from match_details
  where match_id = ${matchId}  `;

  const matchList = await db.all(getMatchDetailsQuery);
  const formattedMatch = matchList.map((match) => {
    return {
      matchId: match.match_id,
      match: match.match,
      year: match.year,
    };
  });
});

//5. 
