const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');


router.post('/login', (req, res, next) => {
  
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err) return next(err)
        console.log(user);
        if(user) {
            const token = jwt.sign(user, 'your_jwt_secret')
            return res.json({user, token})
        } else {
            return res.status(422).json(info)
        }
    })(req, res, next);
});

module.exports = router;