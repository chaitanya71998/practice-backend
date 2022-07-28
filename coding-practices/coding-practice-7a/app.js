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

//1. Returns a list of all the players in the player table
app.get("/players/", async (request, response) => {
  const getPlayersListQuery = `select * from player_details`;
  const playersList = await db.all(getPlayersListQuery);
  const formattedPlayersList = playersList.map((player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    };
  });
  response.send(formattedPlayersList);
});
//2. Returns a specific player based on the player id
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
  response.send("Player Details Updated");
});

//4. returns the match details of a specific match
app.get("/matches/:matchId/", async (request, response) => {
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
  response.send(formattedMatch[0]);
});

//5. Returns a list of all the matches of a player

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
  select match_details.match_id,
match_details.match,match_details.year
  from match_details
natural join player_match_score where player_match_score.player_id =${playerId}
  `;

  const playerMatchScoreList = await db.all(getPlayerMatchesQuery);
  const formattedPlayersList = playerMatchScoreList.map((match) => {
    return {
      matchId: match.match_id,
      match: match.match,
      year: match.year,
    };
  });
  response.send(formattedPlayersList);
});

//6. Returns a list of players of specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
  select player_details.player_id,
player_details.player_name
  from player_details
natural join player_match_score where player_match_score.match_id =${matchId}
  `;

  const matchPlayersList = await db.all(getMatchPlayersQuery);
  const formattedPlayerList = matchPlayersList.map((player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    };
  });
  response.send(formattedPlayerList);
});

//7. Returns the statistics of the total score, fours, sizes of a specific player based on the player ID
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesList = `
select * 
from player_match_score
where player_id = ${playerId}
  `;
  const getPlayerDetailsQuery = `
select * 
from player_details
where player_id = ${playerId}
  `;
  const playerMatchesList = await db.all(getPlayerMatchesList);

  const playerDetails = await db.all(getPlayerDetailsQuery);

  let totalScore = playerMatchesList.reduce((total, match) => {
      return total + match.score;
    }, 0),
    totalFours = playerMatchesList.reduce((total, match) => {
      return total + match.fours;
    }, 0),
    totalSixes = playerMatchesList.reduce((total, match) => {
      return total + match.sixes;
    }, 0);

  response.send({
    playerId: playerId,
    playerName: playerDetails[0].player_name,
    totalScore,
    totalFours,
    totalSixes,
  });
});

module.exports = app;
