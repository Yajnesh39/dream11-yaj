const fs = require('fs');
const csv = require('csvtojson');
const Team = require('../models/team');
const Player = require('../models/player');

//useful to view the processed result
const viewTeamResultsFunc = async (req, res) => {

    try {
        
        // Fetch all teams sorted by points in descending order
        const teams = await Team.find().sort({ points: -1 }).populate('players', 'name');
        // If there are no teams, return an empty array
        if (!teams || teams.length === 0) {
            return res.status(200).json({ message: 'No teams found' });
        }
        // Find the maximum points scored
        const maxPoints = teams[0].points;
        // Find all teams with maximum points
        const winningTeams = teams.filter(team => team.points === maxPoints);
        // make response data
        const responseData = winningTeams.map(team => {
            return {
                teamName: team.name,
                totalPoints: team.points,
                players: team.players.map(player => player.name),
            };
        });
      res.status(200).json({ message: 'Team results retrieved successfully', winningTeams: responseData });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }

};

module.exports = { viewTeamResultsFunc }