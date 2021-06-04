const db = require('../../config/db');
const sequelize = db.sequelize;
const OathMemberClient = db.oath_member_clients;
const MemberRefreshToken = db.member_refresh_tokens;
const Member = db.member;const env = require('dotenv').config();

const jwtDecode = require('jwt-decode');
const decodeToken = require("../helper/decodeToken");

const query = require("../helper/query");

let conditions, select, join;

const validateRefreshMember = async (req, res, next) => {
    try {
        const decode = jwtDecode(req.headers.authorization);
        conditions = {
            uuid: decode.sub
        };
        select = [
            [sequelize.col('oath_member_clients.id'), 'id'] ,
            [sequelize.col('oath_member_clients.uuid'), 'uuid'] ,
            [sequelize.col('oath_member_clients.member_id'), 'member_id'] ,
            [sequelize.col('oath_member_clients.secret_key'), 'secret_key'] ,
            [sequelize.col('member_refresh_token.refresh_expire_at'), 'refresh_expire_at'] ,
            [sequelize.col('member.is_paymented'), 'is_paymented'] ,
            [sequelize.col('member.is_verified'), 'is_verified']
        ];
        join = [
            { model: MemberRefreshToken, attributes: [], require: true } ,
            { model: Member, attributes: [], require: true }
        ];
        const dataClient = await query.findOneByConditions(conditions, OathMemberClient, select, join);
        const jwtValid = decodeToken(req.headers.authorization, dataClient.secret_key , process.env.REFRESH_MEMBER_KEY , dataClient.refresh_expire_at);
        
        if ( jwtValid ) {
            const status = {
                code: 1 ,
                message: "Token valid"
            };
            const datPrivate = {
                status: status ,
                member_client_id: dataClient.id ,
                client_uuid: dataClient.uuid ,
                is_verified: dataClient.is_verified ,
                is_paymented: dataClient.is_paymented ,
                customer_uuid: decode.sub2
            };
            req.dataPrivate = datPrivate;
            next();
        } else {
            res.statusCode = 401;
            const status = {
                code: 3 , /// edit code 4 > 3  warning Problem android, ios!!!!
                message: "Token invalid"
            }
            const datPrivate = {
                status: status
            };
            req.dataPrivate = datPrivate;
            next();
        }
    } catch(e) {
        conditions = {
            refresh: req.headers.authorization
        };
        select = ['id'];
        const isToken = await query.findOneByConditions(conditions, MemberRefreshToken, select);

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
    validateRefreshMember
};