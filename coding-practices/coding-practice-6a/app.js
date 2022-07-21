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
  const getStateQuery = `SELECT * FROM movie where state_id = ${stateId}`;

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
        district_id,
        district_name,
        state_id,
        cases,
        cured,
        active,
        deaths)
    VALUES(
      ${districtName}, ${stateId}, ${cases}, ${cured}, ${active}, ${deaths} 
    );
`;
  await db.run(createDistrictQuery);
  response.send("District Successfully Added");
});

//Returns a district based on the district ID
app.get("districts/:districtId/", async (request, response) => {
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
    districtId: districtArray.district_id,
    districtName: districtArray.district_name,
    stateId: districtArray.state_id,
    cases: districtArray.case,
    cured: districtArray.cured,
    active: districtArray.active,
    deaths: districtArray.deaths,
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
  const totalCases = districtsArray.reduce(sumOfTotalCases, 0); // with initial value to avoid when the array is empty
  const totalCured = districtsArray.reduce(sumOfTotalCured, 0); // with initial value to avoid when the array is empty
  const totalActive = districtsArray.reduce(sumOfTotalActive, 0); // with initial value to avoid when the array is empty
  const totalDeaths = districtsArray.reduce(sumOfTotalDeaths, 0); // with initial value to avoid when the array is empty

  function sumOfTotalCases(district, a) {
    return district.cases + a;
  }

  function sumOfTotalCured(district, a) {
    return district.cured + a;
  }
  function sumOfTotalActive(district, a) {
    return district.active + a;
  }

  function sumOfTotalDeaths(district, a) {
    return district.deaths + a;
  }

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
  const getStateNameQuery = `
  SELECT 
  state_name
  FROM
  state
  WHERE
  district_id = ${districtId}`;

  const stateNameList = await db.all(getStateNameQuery);
  const formattedStateName = {
    stateName: stateNameList[0].state_name,
  };
  response.send(formattedStateName);
});
module.exports = app;
