const express = require('express');
const app = express();
require('dotenv').config();

const { connectDB } = require('./config/db');
connectDB();

app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/password', require('./routes/password.routes'));
app.use('/api/vendors', require('./routes/vendor.routes'));
app.use('/api/ingredients', require('./routes/ingredient.routes'));
app.use('/api/batches', require('./routes/batch.routes'));


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server connecting on port: ${port}✅`);
});