const db = require('../../../config/db');
const MemberRefreshToken = db.member_refresh_tokens;
const oathMemberClient = db.oath_member_clients;
const env = require('dotenv').config();
const jwt = require("jwt-simple");
const moment = require('moment');
const generatePassword = require('password-generator');

const resolvers = {
    Query: {
        getOathClient: async function(_, { uuid }) {
            
        }
    } ,
    Mutation: {
        updateMemberToken: async function(_, { }, { context }) {
            try {
                if ( context.status.code === 1 ) {
                    const genSecretKey = generatePassword(12, false);
                    await oathMemberClient.update( {secret_key: genSecretKey}, { where: { uuid: context.client_uuid } });
                    
                    const tokenPayload = {
                        sub: context.client_uuid ,
                        sub2: context.customer_uuid ,
                        iat: moment()
                    };
                    const refreshPayload = {
                        sub: context.client_uuid ,
                        sub2: context.customer_uuid ,
                        iat: moment()
                    };
                    const token = jwt.encode(tokenPayload, genSecretKey + process.env.TOKEN_MEMBER_KEY);
                    const refresh = jwt.encode(refreshPayload, genSecretKey + process.env.REFRESH_MEMBER_KEY);
                    const updateToken = {
                        token: token ,
                        refresh: refresh ,
                        token_expire_at: moment().add(60,'minutes').format("YYYY-MM-DD HH:mm:ss") ,
                        refresh_expire_at: moment().add(7,'days').format("YYYY-MM-DD HH:mm:ss")
                    };
                    await MemberRefreshToken.update( updateToken, { where: { member_client_id: context.member_client_id } });
    
                    return {
                        status: {
                            code: 1 ,
                            message: "Success"
                        } ,
                        result: {
                            member_token: token ,
                            member_refresh: refresh ,
                            is_verified: context.is_verified ,
                            is_paymented: context.is_paymented
                        }
                    };
                } else {
                    return {
                        status: {
                            code: context.status.code ,
                            message: context.status.message
                        } ,
                        result: {}
                    };
                }
            } catch(e) {
                return {
                    status: {
                        code: 4,
                        message: "server error"
                    } ,
                    result: {}
                };
            }
        }
    }
};

module.exports = resolvers;