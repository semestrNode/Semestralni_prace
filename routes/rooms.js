const express = require('express');
const router = express.Router();
const { v4: uuidV4 } = require('uuid')
const { ensureAuthenticated } = require('./auth');


// You will chooce room here or create one
router.get('/rooms', ensureAuthenticated, (req, res) =>
    res.render('rooms',{
        name: req.user.name
    })
    //res.redirect(`/room-${uuidV4()}`)
)

// join specific room
router.get('/:room', ensureAuthenticated, (req, res) => {
    res.render('room_con', { roomId: req.params.room,  name: req.user.name })
})


router.post('/rooms', (req, res) => {
    const { room } = req.body
    // user wants to create a new room
    if (room == 'create') {
        res.redirect(`/room-${uuidV4()}`);
    }
    else if (room.includes("room-")) {
        res.redirect(`/${room}`);
    }
    else{
        res.render('rooms',{
            name: req.user.name
        })
    }
})


module.exports = router;
//<script type="text/javascript?v=1" src = "pokus.js"></script>

