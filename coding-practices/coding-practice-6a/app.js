const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");
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

// Returns a list of all states in the state table
app.get("/states/", async (request, response) => {
  const getStatesListQuery = "SELECT * FROM state";
  const statesList = await db.all(getStatesListQuery);
  const formattedStatesList = statesList.map((state) => {
    return {
      stateId: state.state_id,
      stateName: state.state_name,
      population: state.population,
    };
  });
  response.send(formattedStatesList);
});

//Returns a state based on the state ID
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `SELECT * FROM state where state_id = ${stateId}`;
  const stateList = await db.all(getStateQuery);
  const formattedStateArray = stateList.map((state) => {
    return {
      stateId: state.state_id,
      stateName: state.state_name,
      population: state.population,
    };
  });
  response.send(formattedStateArray[0]);
});

// Create a district in the district table, `district_id` is auto-incremented
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const createDistrictQuery = `
    INSERT INTO  
    district(
        district_name,
        state_id,
        cases,
        cured,
        active,
        deaths)
    VALUES(
      "${districtName}", ${stateId}, ${cases}, ${cured}, ${active}, ${deaths} 
    );
`;
  await db.run(createDistrictQuery);
  response.send("District Successfully Added");
});

//Returns a district based on the district ID
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
        SELECT
        *
        FROM
        district
        where
        district_id = ${districtId}
        `;

  const districtArray = await db.all(getDistrictQuery);
  const formattedDistrict = {
    districtId: districtArray[0].district_id,
    districtName: districtArray[0].district_name,
    stateId: districtArray[0].state_id,
    cases: districtArray[0].cases,
    cured: districtArray[0].cured,
    active: districtArray[0].active,
    deaths: districtArray[0].deaths,
  };
  response.send(formattedDistrict);
});

// Deletes a district from the district table based on the district ID
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    delete
    from
    district
    where
    district_id = ${districtId}
    `;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

// Updates the details of a specific district based on the district ID
app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const { districtId } = request.params;

  const updateDistrictDetailsQuery = `
    UPDATE
        district
    SET
    district_name='${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE
           district_id = ${districtId};`;

  await db.run(updateDistrictDetailsQuery);
  response.send("District Details Updated");
});

// Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getDistrictsQuery = `
        SELECT
        *
        FROM
        district
        where
        state_id = ${stateId}
        `;

  const districtsArray = await db.all(getDistrictsQuery);

  let totalCases = 0;
  let totalCured = 0;
  let totalActive = 0;
  let totalDeaths = 0;
  districtsArray.map((district) => {
    totalCases += district.cases;
    totalCured += district.cured;
    totalActive += district.active;
    totalDeaths += district.deaths;
  });

  const formattedStateStats = {
    totalCases: totalCases,
    totalCured: totalCured,
    totalActive: totalActive,
    totalDeaths: totalDeaths,
  };
  response.send(formattedStateStats);
});

//Returns an object containing the state name of a district based on the district ID
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
   const getDistrictQuery = `
        SELECT
        *
        FROM
        district
        where
        district_id = ${districtId}
        `;

  const districtArray = await db.all(getDistrictQuery);
  const stateId = districtArray[0].state_id
  const getStateNameQuery = `
  SELECT 
  *
  FROM
  state
  WHERE
  state_id = ${stateId}`;

  const stateNameList = await db.all(getStateNameQuery);
  const formattedStateName = {
    stateName: stateNameList[0].state_name,
  };
  response.send(formattedStateName);
});
module.exports = app;
