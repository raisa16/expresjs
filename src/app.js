//const app = require("./app");
//const PORT = process.env.PORT || 3000;
//
//app.Listen(PORT, () => {
//    console.log(`Server is running on port ${PORT}`);
//});
const express = require('express');
const routes = require('./routes');
const app = express();

app.use(express.json());
app.use('/api', routes);
app.get('/', (req, res) => {
    res.send('Jolie Home');
});
module.exports = app;