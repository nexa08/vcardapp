const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./route/authroute');
const path = require('path');
const BASE_URL = process.env.BASE_URL;

dotenv.config(); // Load .env

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

 // Serve uploads folder statically (optional)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/charm', authRoutes);

app.get('/', (req, res) => {
  res.send('Vcard Backend  API is running');
});

app.listen(port, () => {
  console.log(`Server is live at ${BASE_URL}`);
});
