//const express = require("express");
//const routes = require("./routes");
//const app = express();
//
//app.use(express.json());
//app.use("/api", routes);
//
//app.get("/", (req, res) => {
//    res.send("Welcome to the API");
//});
//
//module.exports = app;

const app =require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Jolie Home : http://localhost:' + PORT);
});

//module.exports = Server;