const fs = require('fs');
const csv = require('csvtojson');
const Team = require('../models/team');
const Player = require('../models/player');

//this helps to validate & add team succesfully
const addTeamFunc = async (req, res) => {
    const { teamName, players, captain, viceCaptain } = req.body;
    //console.log(req.body)
    try {
        // Validate team name
        if (!teamName) {
            return res.status(400).json({ error: 'Team name is required' });
        }
        // Validate if team contains 11 players
        if (!players || players.length !== 11) {
            return res.status(400).json({ error: 'Team must have 11 players' });
        }
        // Validate if captain & vice-captain are different players
        if (captain === viceCaptain) {
            return res.status(400).json({ error: 'Captain and vice-captain must be different players' });
        }
        // Find player objects from database based on player names
        const playersFromDB = await Player.find({ name: { $in: players } });
        //console.log(playersFromDB)
        
        // Check if all players are found in the database
        if (playersFromDB.length !== players.length) {
            return res.status(400).json({ error: 'Invalid player(s) in the team' });
        }
        // Validate player roles and count
        const roleCount = { "WICKETKEEPER": 0, "BATTER": 0, "ALLROUNDER": 0, "BOWLER": 0 };
        for (const player of playersFromDB) {
            //console.log(player.role)
            roleCount[player.role]++;
        }
        //console.log(roleCount.WICKETKEEPER+" "+roleCount.BATTER+" "+roleCount.ALLROUNDER+" "+roleCount.BOWLER)
        
        if (roleCount.WICKETKEEPER < 1 || roleCount.BATTER < 1 || roleCount.ALLROUNDER < 1 || roleCount.BOWLER < 1) {
            return res.status(400).json({ error: 'Team must have at least one player of each role' });
        }
        
        if (roleCount.WICKETKEEPER > 8 || roleCount.BATTER > 8 || roleCount.ALLROUNDER > 8 || roleCount.BOWLER > 8) {
            return res.status(400).json({ error: 'Maximum 8 players allowed for each role' });
        }
        
        // Validate captain and vice-captain roles
        const captainFromDB = playersFromDB.find(player => player.name === captain);
        const viceCaptainFromDB = playersFromDB.find(player => player.name === viceCaptain);
        
        if (!captainFromDB || !viceCaptainFromDB) {
            return res.status(400).json({ error: 'Invalid captain or vice-captain' });
        }
        // Create new team object 
        const team = new Team({
            name: teamName,
            players: playersFromDB.map(player => player._id),
            captain: captainFromDB._id,
            viceCaptain: viceCaptainFromDB._id,
        });
        await team.save();
        res.status(201).json({ message: 'Team added successfully', team });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { addTeamFunc }