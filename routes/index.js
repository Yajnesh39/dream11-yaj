const express = require('express');
const addTeamController = require('../controllers/addTeam');
const processResultController = require('../controllers/processResult');
const viewResultController = require('../controllers/viewResult');

const router = express.Router();

router.post('/add-team', addTeamController.addTeamFunc);
router.post('/process-result', processResultController.processResultFunc);
router.get('/team-result', viewResultController.viewTeamResultsFunc);

module.exports = router;