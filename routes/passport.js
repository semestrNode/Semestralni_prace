const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');
const bcrypt = require('bcryptjs');


module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'name' }, async (name, password, done) => {
            // Matching user
            user =  await db.loginCompare(name)
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'This user is not registered!' });
                    }
                    // Match the password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        // User passed
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Incorrect password!' })
                        }
                    });
                })
        })
    )

    passport.serializeUser((user, done) => {
        done(null, user.name);
    })
    passport.deserializeUser(async (name, done) => {
        user =  await db.loginCompare(name)
        done(null, user);
    })
}
