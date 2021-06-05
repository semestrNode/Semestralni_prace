const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('./auth');

// Home page
router.get('/', (req, res) => {
    res.render('home_page');
})

/*
// Dashboard -> room _ chat
// Ne-autentizovany uzivatel nemuze vstoupit do mistnosti
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard.ejs',{
        name: req.user.name
    })
})
*/
module.exports = router;