"use strict";
//testing

const express = require("express"); // load modules
const app = express(); // create the Express app
const morgan = require("morgan");
//const fs = require('fs');
const cors = require('cors'); // load CORS
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";
const path = require('path');

const Sequelize = require('sequelize');
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: true
    }
  });
} else {
  sequelize = new Sequelize({ //builds data base
    dialect: 'sqlite',
    storage: './fsjstd-restapi.db'
  });
}

sequelize //tests data base connection
  .authenticate()
  .then(() => {
    console.log('Connection to database success!');
  })
  .catch(err => {
    console.error('Unable to connect to database. :/')
  });

app.use(express.static(path.resolve(__dirname, 'client', 'build')));

app.use(express.json());   // setup request body JSON parsing

app.use(morgan("dev")); // setup morgan which gives us http request logging

app.use(cors()); // setup cors 

// app.get('/', (req, res) => { // setup a friendly greeting for the root route
//   res.json({
//     message: 'Welcome to the REST API project!',
//   });
// });

app.use("/api/indexes", require("./routes/indexes")); // REST API index route w/ Express application use() method  
app.use("/api/users", require("./routes/users")); // REST API users route         "       "
app.use("/api/courses", require("./routes/courses")); // REST API courses route            "       "
app.use("/api/authenticate", require("./routes/authenticate"));// REST API authenticate rote      "       "

app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

// app.use((req, res) => {  // send 404 if no other route matched
//   res.status(404).json({
//     message: 'Route Not Found',
//   });
// });

app.use((err, req, res, next) => { // setup a global error handler
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${err.stack}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('REST API listening on port ' + port + '!')); // set our port
