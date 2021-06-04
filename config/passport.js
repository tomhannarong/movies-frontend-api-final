const passport = require('passport')
const passportJWT   = require("passport-jwt")
const ExtractJWT    = passportJWT.ExtractJwt
const JWTStrategy   = passportJWT.Strategy
const LocalStrategy = require('passport-local').Strategy

const db = require('./db');
const sequelize = db.sequelize;
const Member = db.member;
const md5 = require('md5');

// Mock Data
const user = {
    id: 1,
    sub: 'nottdev',
    email: 'nottdev@gmail.com'
}

// passport.use(new LocalStrategy({
//         usernameField: 'email',
//         passwordField: 'password'
//     }, 
//     async (email, password, cb) => {        
        
       
//             return await Member.findOne({
//                 raw: true ,
//                 //attributes: select ,
//                 where: {
//                     email: email,
//                     password: password
//                 }
//             }).then(user => {
//                if (!user) {
//                    return cb(null, false, {message: 'Incorrect email or password.'})
//                }               
//                return cb(null, user, {message: 'Logged In Successfully'})
//             })
//             .catch(err => cb(err))   
//     }
// ));

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, 
  (email, password, cb) => {        

    console.log("in local streategy");
    if (email !== user.email) 
      return cb(null, false, {message: 'Incorrect email or password.'})
            
    return cb(null, user, {message: 'Logged In Successfully'})
  }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'your_jwt_secret'
},
(jwtPayload, cb) => {

  try {
    // find the user in db if needed
    if(jwtPayload.id == user.id) {
      return cb(null, user);
    } else {
      return cb(null, false);
    }
  } catch (error) {
    return cb(error, false);
  }
}
));