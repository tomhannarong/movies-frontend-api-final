const db = require('../../../config/db');
const ProfileRefreshToken = db.profile_refresh_tokens;
const oathProfileClient = db.oath_profile_clients;

const generatePassword = require('password-generator');
const env = require('dotenv').config();
const jwt = require("jwt-simple");
const moment = require('moment');

const resolvers = {
    Query: {
        getOathClient: async function(_, { uuid }) {
            
        }
    } ,
    Mutation: {
        updateProfileToken: async function(_, { }, { context }) {
            try {
                if ( context.status.code === 1 ) {
                    const genSecretKey = generatePassword(12, false);
                    await oathProfileClient.update( {secret_key: genSecretKey}, { where: { id: context.oath_profile_id } });
                    
                    const tokenPayload = {
                        sub: context.profile_uuid ,
                        sub2: context.customer_uuid ,
                        iat: moment()
                    };
                    const refreshPayload = {
                        sub: context.profile_uuid ,
                        sub2: context.customer_uuid ,
                        iat: moment()
                    };
                    const token = jwt.encode(tokenPayload, genSecretKey + process.env.TOKEN_PROFILE_KEY);
                    const refresh = jwt.encode(refreshPayload, genSecretKey + process.env.REFRESH_PROFILE_KEY);
                    const updateToken = {
                        token: token ,
                        refresh: refresh ,
                        updated_at: moment().format("YYYY-MM-DD HH:mm:ss") ,
                        token_expire_at: moment().add(60,'minutes').format("YYYY-MM-DD HH:mm:ss") ,
                        refresh_expire_at: moment().add(1,'days').format("YYYY-MM-DD HH:mm:ss")
                    };
                    await ProfileRefreshToken.update( updateToken, { where: { profile_client_id: context.oath_profile_id } });
    
                    return {
                        status: {
                            code: 1 ,
                            message: "Success"
                        } ,
                        result: {
                            profile_token: token ,
                            profile_refresh: refresh
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
                        code: 4 ,
                        message: "Server error"
                    } ,
                    result: {}
                };
            }
        }
    }
};

module.exports = resolvers;