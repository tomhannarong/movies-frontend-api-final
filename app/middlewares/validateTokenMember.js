const db = require('../../config/db');
const sequelize = db.sequelize;
const Member = db.member;
const OathMemberClient = db.oath_member_clients;
const MemberRefreshToken = db.member_refresh_tokens;

const env = require('dotenv').config();
const jwtDecode = require('jwt-decode');
const decodeToken = require("../helper/decodeToken");

const query = require("../helper/query");

let conditions, select, join;

const validateTokenMember = async (req, res, next) => {
    try {
        const decode = jwtDecode(req.headers.authorization);
        conditions = {
            uuid: decode.sub
        };
        select = [
            [sequelize.col('oath_member_clients.member_id'), 'member_id'] ,
            [sequelize.col('oath_member_clients.id'), 'oath_member_id'] ,
            [sequelize.col('oath_member_clients.secret_key'), 'secret_key'] ,
            [sequelize.col('member_refresh_token.token_expire_at'), 'token_expire_at'] ,
            [sequelize.col('member.is_paymented'), 'is_paymented'] ,
            [sequelize.col('member.customer_id'), 'customer_id']
        ];
        join = [
            { model: MemberRefreshToken, attributes: [], require: true } ,
            { model: Member, attributes: [], require: true }
        ];
        const dataClient = await query.findOneByConditions(conditions, OathMemberClient, select, join);
        const jwtValid = decodeToken(req.headers.authorization, dataClient.secret_key , process.env.TOKEN_MEMBER_KEY , dataClient.token_expire_at);
        if ( jwtValid ) {
            const status = {
                code: 1 ,
                message: "Token valid"
            };
            const datPrivate = {
                status: status ,
                member_id: dataClient.member_id ,
                oath_member_id: dataClient.oath_member_id ,
                is_paymented: dataClient.is_paymented ,
                customer_id: dataClient.customer_id ,
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
        const isToken = await MemberRefreshToken.findOne({
            raw: true ,
            attributes: ['id'] ,
            where: {
                token: req.headers.authorization
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
    validateTokenMember
};