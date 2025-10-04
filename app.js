 require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Alive!');
});



app.listen(PORT, () => {
console.log('Environment Variables:', process.env.PORT);
    console.log(`Server is running on http://localhost:${PORT}`);
});