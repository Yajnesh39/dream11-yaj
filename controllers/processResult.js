const fs = require('fs');
const csv = require('csvtojson');
const Team = require('../models/team');
const Player = require('../models/player');

//Useful to process match result between CSK vs RR
const processResultFunc = async (req, res) => {
    try {
        // Read match data from file
        const matchData = await csv().fromFile('./data/match.csv');
        //yaj
        //console.log(matchData)
        
        // Process match data to calculate points for each player
        const playerPointsMap = {};
        for (const ball of matchData) {
            const batsman = ball.batter;
            const bowler = ball.bowler;
            const fielder = ball.fielders_involved;
            
            // Calculate points for batsman
            if (batsman !== 'NA') {
                playerPointsMap[batsman] = playerPointsMap[batsman] || 0;
                playerPointsMap[batsman] += calculateBattingPoints(ball);
            }
            // Calculate points for bowler
            if (bowler !== 'NA') {
                playerPointsMap[bowler] = playerPointsMap[bowler] || 0;
                playerPointsMap[bowler] += calculateBowlingPoints(ball);
            }
            // Calculate points for fielder
            if (fielder !== 'NA') {
                const fielders = fielder.split(',');
                for (const fielder of fielders) {
                    playerPointsMap[fielder] = playerPointsMap[fielder] || 0;
                    playerPointsMap[fielder] += calculateFieldingPoints(ball);
                }
            }
        }
        
        // Update team points based on player points
        const teams = await Team.find().populate('players');
        for (const team of teams) {
            let totalPoints = 0;
            for (const player of team.players) {
                totalPoints += playerPointsMap[player.name] || 0;
                if (player._id.equals(team.captain)) {
                    totalPoints += (playerPointsMap[player.name] || 0) * 2; // Captain 2x points
                }
                if (player._id.equals(team.viceCaptain)) {
                    totalPoints += (playerPointsMap[player.name] || 0) * 1.5; // Vice-captain 1.5x points
                }
            }
            team.points = totalPoints;
            await team.save();
        }
        res.status(200).json({ message: 'Match result processed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


//calculate batting points
const calculateBattingPoints = (ball) => {
    
    let points = 0;
    if (ball.batsman_run !== 'NA') {
        points += parseInt(ball.batsman_run); // Run
        if (parseInt(ball.batsman_run) >= 4) points += 1; // Boundary points
        if (parseInt(ball.batsman_run) === 6) points += 2; // Six points
        if (parseInt(ball.total_run) >= 30) points += 4; // 30 Run points
        if (parseInt(ball.total_run) >= 50) points += 8; // Half-century points
        if (parseInt(ball.total_run) >= 100) points += 16; // Century points
        if (parseInt(ball.batsman_run) === 0 && (ball.kind === 'caught' || ball.kind === 'stumped' || ball.kind === 'lbw' || ball.kind === 'bowled')) points -= 2; // Dismissal for a duck
    }
    return points;

};
  
//calculate bowling points
const calculateBowlingPoints = (ball) => {
    
    let points = 0;
    if (ball.isWicketDelivery === '1' && (ball.kind !== 'run out' && ball.kind !== 'retired out')) {
        points += 25; // Wicket
        if (ball.kind === 'lbw' || ball.kind === 'bowled') points += 8; // LBW/Bowled bonus
    }
    if (ball.isWicketDelivery === '1') {
        if (ball.kind !== 'run out' && ball.kind !== 'retired out') { // Bonus for 3 wickets, 4 wickets, 5 wickets
            if (ball.kind === 'caught' || ball.kind === 'stumped' || ball.kind === 'lbw' || ball.kind === 'bowled') points += 8; 
        }
    }
    if (parseInt(ball.overs) % 6 === 0 && ball.isWicketDelivery === '0') {
        points += 12; // Maiden over
    }
    return points;

};
  
//calculate fielding points
const calculateFieldingPoints = (ball) => {
    
    let points = 0;
    if (ball.kind === 'caught') {
        points += 8; // Catch
        if (ball.fielders_involved.split(',').length === 3) points += 4; // 3 catch bonus
    }
    if (ball.kind === 'stumped') {
        points += 12; // Stumping
    }
    if (ball.kind === 'run out') {
        points += 6; // Run out
    }
    return points;

};

module.exports = { processResultFunc }