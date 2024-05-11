const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const Player = require('./models/player'); //required for adding all players to players database
require("dotenv").config();

const app = express();
const port = 3000;

// Database Details
const DB_USER = process.env['DB_USER'];
const DB_PWD = process.env['DB_PWD'];
const DB_URL = process.env['DB_URL'];
const DB_NAME = "task-yajnesh";
const DB_COLLECTION_NAME = "players";

// Read players.json file and parse the JSON data
const playersData = fs.readFileSync('./data/players.json', 'utf8');
const players = JSON.parse(playersData);

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://"+DB_USER+":"+DB_PWD+"@"+DB_URL+"/?retryWrites=true&w=majority", {})
.then(() => {
  console.log('Successfully connected to MongoDB Atlas');

    /* Here we are saving all the players details to mongodb database using mnongoose
    model of ./models/players.js and taking content from players.json */

    // Iterate over the parsed JSON data and save each player document to the database
    players.forEach(async (playerData) => {
      try {
        // Create new player document using model Player
        const player = new Player({
          name: playerData.Player,
          team: playerData.Team,
          role: playerData.Role,
        });
        await player.save();
        console.log(`Player "${player.name}" added to the database`);
      } catch (error) {
        console.error(`Error adding player "${playerData.Player}" to the database:`, error);
      }
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
});

//Server app coonnection details
app.listen(port, (error) => {
  if(!error) {
    console.log(`App listening on port ${port}`);
  } else {
    console.log("Server start ERROR !!");
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes'));