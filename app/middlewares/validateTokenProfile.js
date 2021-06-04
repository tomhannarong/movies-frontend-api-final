const db = require('../../config/db');
const sequelize = db.sequelize;
const Profile = db.member_profiles;
const OathProfileClient = db.oath_profile_clients;
const ProfileRefreshToken = db.profile_refresh_tokens;
const Customer = db.customers;

const env = require('dotenv').config();
const jwtDecode = require('jwt-decode');
const decodeToken = require("../helper/decodeToken");

const query = require("../helper/query");

let conditions, select, join;

const validateTokenProfile = async (req, res, next) => {
    try {
        const decode = jwtDecode(req.headers.authorization);
        conditions = {
            uuid: decode.sub
        };
        select = [
            [sequelize.col('oath_profile_clients.profile_id'), 'profile_id'] ,
            [sequelize.col('oath_profile_clients.id'), 'oath_profile_id'] ,
            [sequelize.col('oath_profile_clients.secret_key'), 'secret_key'] ,
            [sequelize.col('profile_refresh_token.token_expire_at'), 'token_expire_at'] ,
            [sequelize.col('member_profile.member_id'), 'member_id']
        ];
        join = [
            { model: ProfileRefreshToken, attributes: [], require: true } ,
            { model: Profile, attributes: [], require: true }
        ];
        const dataClient = await query.findOneByConditions(conditions, OathProfileClient, select, join);
        const jwtValid = decodeToken(req.headers.authorization, dataClient.secret_key, process.env.TOKEN_PROFILE_KEY, dataClient.token_expire_at);
        if ( jwtValid ) {
            const status = {
                code: 1 ,
                message: "Token valid"
            };
            const customer = await Customer.findOne({
                attributes: ['id'] ,
                where: { uuid: decode.sub2 }
            });
            const dataPrivate = {
                status: status ,
                memberProfileId: dataClient.profile_id  ,
                oathProfileId: dataClient.oath_profile_id ,
                customerId: customer.id ,
                memberId: dataClient.member_id
            };
            req.dataPrivate = dataPrivate;
            next();
        } else {
            res.statusCode = 401;
            const status = {
                code: 3 ,
                message: "Token invalid"
            };
            const datPrivate = {
                status: status
            };
            req.dataPrivate = datPrivate;
            next();
        }
    } catch(e) {
        const isToken = await ProfileRefreshToken.findOne({
            raw:true ,
            attributes: ['id'] ,
            where: {
                token: req.headers.authorization
            }
        });
        if ( !isToken ) {
            res.statusCode = 401;
            const status = {
                code: 3 ,
                message: "Token invalid"
            };
            const datPrivate = {
                status: status
            };
            req.dataPrivate = datPrivate;
            next();
        } else {
            const status = {
                code: 4 ,
                message: "Wrong format"
            };
            const datPrivate = {
                status: status
            };
            req.dataPrivate = datPrivate;
            next();
        }
    }
};

module.exports = {
    validateTokenProfile
};