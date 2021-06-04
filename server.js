const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const useragent = require('express-useragent');
const bodyParser = require('body-parser');
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const config = require('config');
const port = config.port;
const baseUrl = config.baseUrl;

const { register } = require('./app/middlewares/register');
const { oathMember } = require('./app/middlewares/oathMember');
const { validateTokenMember } = require('./app/middlewares/validateTokenMember');
const { validateRefreshMember } = require('./app/middlewares/validateRefreshMember');
const { validateForgotPassword } = require('./app/middlewares/validateForgotPassword');
const { validateNewPassword } = require('./app/middlewares/validateNewPassword');
const { testDeleteMember } = require('./app/middlewares/testDeleteMember');
const { testSetFalsePayment } = require('./app/middlewares/testSetFalsePayment');
const { testDuedateToken, testDuedateTokenProfile } = require('./app/middlewares/testDuedateToken');
const { validateTokenProfile } = require('./app/middlewares/validateTokenProfile');
const { validateRefreshProfile } = require('./app/middlewares/validateRefreshProfile');
const { acceptLanguage } = require('./app/middlewares/acceptLanguage');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

const categoriesType = require('./app/graphql/categories/type');
const categoriesResolvers = require('./app/graphql/categories/resolvers');
const categoriesServer = new ApolloServer({
    typeDefs: categoriesType ,
    resolvers: categoriesResolvers ,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const forgotPassword = require('./app/graphql/forgotPassword/type');
const forgotPasswordResolvers = require('./app/graphql/forgotPassword/resolvers');
const forgotPasswordServer = new ApolloServer({
    typeDefs: forgotPassword ,
    resolvers: forgotPasswordResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const loadmoreType = require('./app/graphql/loadmore/type');
const loadmoreResolvers = require('./app/graphql/loadmore/resolvers');
const loadmoreServer = new ApolloServer({
    typeDefs: loadmoreType ,
    resolvers: loadmoreResolvers ,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const manageType = require('./app/graphql/manage/type');
const manageResolvers = require('./app/graphql/manage/resolvers');
const manageServer = new ApolloServer({
    typeDefs: manageType ,
    resolvers: manageResolvers ,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const member = require('./app/graphql/member/type');
const memberResolvers = require('./app/graphql/member/resolvers');
const memberServer = new ApolloServer({
    typeDefs: member ,
    resolvers: memberResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const memberRefreshToken = require('./app/graphql/memberRefreshToken/type');
const memberRefreshTokenResolvers = require('./app/graphql/memberRefreshToken/resolvers');
const memberRefreshTokenServer = new ApolloServer({
    typeDefs: memberRefreshToken ,
    resolvers: memberRefreshTokenResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const memberOathType = require('./app/graphql/oathMemberClient/type');
const memberOathResolvers = require('./app/graphql/oathMemberClient/resolvers');
const memberOathServer = new ApolloServer({
    typeDefs: memberOathType ,
    resolvers: memberOathResolvers,
    playground: false,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const pagesType = require('./app/graphql/pages/type');
const pagesResolvers = require('./app/graphql/pages/resolvers');
const pagesServer = new ApolloServer({
    typeDefs: pagesType ,
    resolvers: pagesResolvers ,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const payment = require('./app/graphql/payment/type');
const paymentResolvers = require('./app/graphql/payment/resolvers');
const paymentServer = new ApolloServer({
    typeDefs: payment ,
    resolvers: paymentResolvers,
    context: ({ req }) => ({
      context: req.dataPrivate
    })
});

const profileRefreshToken = require('./app/graphql/profileRefreshToken/type');
const profileRefreshTokenResolvers = require('./app/graphql/profileRefreshToken/resolvers');
const profileRefreshTokenServer = new ApolloServer({
    typeDefs: profileRefreshToken ,
    resolvers: profileRefreshTokenResolvers ,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const memberProfile = require('./app/graphql/profile/type');
const memberProfileResolvers = require('./app/graphql/profile/resolvers');
const memberProfileServer = new ApolloServer({
    typeDefs: memberProfile ,
    resolvers: memberProfileResolvers ,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const profileOathType = require('./app/graphql/oathProfileClient/type');
const profileOathResolvers = require('./app/graphql/oathProfileClient/resolvers');
const profileOathServer = new ApolloServer({
    typeDefs: profileOathType ,
    resolvers: profileOathResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const interestedCategoryType = require('./app/graphql/interestedCategory/type');
const interestedCategoryResolvers = require('./app/graphql/interestedCategory/resolvers');
const interestedCategoryServer = new ApolloServer({
    typeDefs: interestedCategoryType ,
    resolvers: interestedCategoryResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const app = express();
// app.use(limiter);
app.use(cors());
app.use(useragent.express());
app.use(bodyParser.json({limit: '100mb'}));
app.use(express.static('assets'));
app.use(express.static('ud'));

app.use((err, req, res, next) => {
    let statusCode = err.status || 500
    res.status(statusCode)
    res.json({
        error: {
            status: statusCode,
            message: err.message
        }
    });
}); 

app.use("/categories", validateTokenProfile, acceptLanguage, (req, res, next) => next());
app.use("/pages", validateTokenProfile, acceptLanguage, (req, res, next) => next());
app.use('/register', register, oathMember, (req, res, next) => next());
app.use('/login', oathMember, (req, res, next) => next());
app.use('/user/forgotpassword', validateForgotPassword, (req, res, next) => next());
app.use('/user/verification/email', validateTokenMember, (req, res, next) => next());
app.use('/user/refreshtoken', validateRefreshMember, (req, res, next) => next());
app.use('/user/verification/forgotpassword', validateForgotPassword, (req, res, next) => next());
app.use('/user/newpassword', validateNewPassword, oathMember, (req, res, next) => next());
app.use('/user/getprofile', validateTokenMember, (req, res, next) => next());
app.use('/user/select/package', validateTokenMember, (req, res, next) => next());
app.use('/user/payment', validateTokenMember, (req, res, next) => next());
app.use('/user/signout', validateTokenMember, (req, res, next) => next());
app.use('/profile/login', validateTokenMember, (req, res, next) => next());
app.use('/profile/signout', validateTokenProfile, (req, res, next) => next());
app.use('/profile/interest', validateTokenProfile, (req, res, next) => next());
app.use('/manage', validateTokenProfile, (req, res, next) => next());
app.use('/profile/refreshtoken', validateRefreshProfile, (req, res, next) => next());
app.use('/loadmore', validateTokenProfile, acceptLanguage, (req, res, next) => next());

app.use('/user/delete', testDeleteMember);
app.use('/user/paymentSetfalse', testSetFalsePayment);
app.use('/user/duedatetoken', testDuedateToken);
app.use('/profile/duedatetoken', testDuedateTokenProfile);

categoriesServer.applyMiddleware({ app, path: '/categories' });
memberOathServer.applyMiddleware({ app, path: '/register' });
memberOathServer.applyMiddleware({ app, path: '/login' });
memberOathServer.applyMiddleware({ app, path: '/user/newpassword' });
memberServer.applyMiddleware({ app, path: '/user/verification/email' }); // account verify
memberServer.applyMiddleware({ app, path: '/user/signout' }); 
forgotPasswordServer.applyMiddleware({ app, path: '/user/verification/forgotpassword' }); // account verify
loadmoreServer.applyMiddleware({ app, path: '/loadmore' });
memberRefreshTokenServer.applyMiddleware({ app, path: '/user/refreshtoken' }); 
memberServer.applyMiddleware({ app, path: '/user/forgotpassword' }); 
memberProfileServer.applyMiddleware({ app, path: '/user/getprofile' }); 
pagesServer.applyMiddleware({ app, path: '/pages' }); 
memberServer.applyMiddleware({ app, path: '/user/select/package' });
paymentServer.applyMiddleware({ app, path: '/user/payment' });
manageServer.applyMiddleware({ app, path: '/manage' });
profileOathServer.applyMiddleware({ app, path: '/profile/login' });
profileOathServer.applyMiddleware({ app, path: '/profile/signout' });
profileRefreshTokenServer.applyMiddleware({ app, path: '/profile/refreshtoken' });
interestedCategoryServer.applyMiddleware({ app, path: '/profile/interest' });

app.listen(port, () => console.log(`Server ready at ${baseUrl}`));