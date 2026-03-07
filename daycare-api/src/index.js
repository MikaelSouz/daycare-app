const express = require("express");
const routes = require("./app/routes");
const cors = require("cors");
require("dotenv").config();

const corsOptionsDev = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const app = express();

app.use(express.json());
app.use(cors(corsOptionsDev));
app.use(routes);

app.listen(process.env.PORT, () => console.log("Server started"));
