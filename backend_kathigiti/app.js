require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const profRoutes = require('./routes/profRoutes');
const diplomatikiRoutes = require('./routes/diplomatikiRoutes');

const app = express();
app.use(express.json());

app.use('/api/professors', profRoutes);
app.use('/api/diplomatikis', diplomatikiRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
