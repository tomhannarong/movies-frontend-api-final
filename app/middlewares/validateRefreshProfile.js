const db = require('../../config/db');
const sequelize = db.sequelize;
const Profile = db.member_profiles;
const OathProfileClient = db.oath_profile_clients;
const ProfileRefreshToken = db.profile_refresh_tokens;const env = require('dotenv').config();

const jwtDecode = require('jwt-decode');
const decodeToken = require("../helper/decodeToken");

const query = require("../helper/query");

let conditions, select, join;

const validateRefreshProfile = async (req, res, next) => {
    try {
        const decode = jwtDecode(req.headers.authorization);
        conditions = {
            uuid: decode.sub
        };
        select = [
            [sequelize.col('oath_profile_clients.profile_id'), 'profile_id'] ,
            [sequelize.col('oath_profile_clients.id'), 'oath_profile_id'] ,
            [sequelize.col('oath_profile_clients.secret_key'), 'secret_key'] ,
            [sequelize.col('oath_profile_clients.uuid'), 'uuid'] ,
            [sequelize.col('profile_refresh_token.refresh_expire_at'), 'refresh_expire_at']
        ];
        join = [
            { model: ProfileRefreshToken, attributes: [], require: true } ,
            { model: Profile, attributes: [], require: true }
        ];
        const dataClient = await query.findOneByConditions(conditions, OathProfileClient, select, join);
        const jwtValid = decodeToken(req.headers.authorization, dataClient.secret_key , process.env.REFRESH_PROFILE_KEY , dataClient.refresh_expire_at);
        if ( jwtValid ) {
            const status = {
                code: 1 ,
                message: "Token valid"
            };
            const datPrivate = {
                status: status ,
                profile_id: dataClient.profile_id ,
                oath_profile_id: dataClient.oath_profile_id ,
                profile_uuid: dataClient.uuid ,
                customer_uuid: decode.sub2
            };
            req.dataPrivate = datPrivate;
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
                refresh: req.headers.authorization
            }
        });
        if ( !isToken ) {
            res.statusCode = 401;
            const status = {
                code: 3,
                message: "Token invalid"
            };
            const datPrivate = {
                status: status
            };
            req.dataPrivate = datPrivate;
            next();
        } else {
            res.statusCode = 400;
            const status = {
                code: 4,
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
    validateRefreshProfile
};