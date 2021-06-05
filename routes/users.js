const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs');

const passport = require('passport');

router.get('/login', (req, res) =>
    res.render('login')
)

router.get('/register', (req, res) =>
    res.render('register')
)



// Register handle
router.post('/register', async (req, res) => {
    //descruture
    var { name, password, password2 } = req.body
    let errors = [];
    // name or password is not filled
    if (!name || !password || !password2) {
        errors.push({ msg: 'All fields are not filled in!' })
    }
    // passwords do not match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match!' })
    }
    // Invalid length?
    if (password.length <= 0) {
        errors.push({ msg: 'Invalid length of password!' })
    }
    // we have an issue
    if (errors.length > 0) {
        res.render('register',{
            errors,
            name,
        });
    }
    else{
        // VALIDATION SUCCESS
        try {
            var nameExists = await db.checkUserIfExists(name);
        } catch (e) {
            console.log(e)
        }
        if (!nameExists) {
            // USER will be added to database
            // HASH Password
            bcrypt.genSalt(10, (err,salt) =>{
                bcrypt.hash(password, salt, (err, hash)=>{
                    if(err) throw err;
                    // adding hashed passwd
                    password = hash;
                    insertData(name, password)
                    
                })
            })
            
        res.redirect('/users/login')
        } else {
            errors.push({ msg: 'User already exists!' })
            res.render('register',{
                errors,
                name,
            })
        }


        
        //res.send('posted');
    }

});


async function insertData(name, password) {
    let d = Date(Date.now());
    d = d.toString()
    let date = d.substring(0, 24);
    try {
        result = await db.insertion(name, password, date);
        console.log('Insert success.')
    } catch (e) {
        console.log(e)
    }
}

router.post('/login', (req,res, next)=>{
    passport.authenticate('local',{
        successRedirect: '/rooms',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req,res,next);
});

//LOGOUT
router.get('/logout', (req,res)=>{
    req.logout();
    res.redirect('/users/login');
});


module.exports = router;