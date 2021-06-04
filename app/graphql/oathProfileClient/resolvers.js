const db = require('../../../config/db');
const ProfileRefreshToken = db.profile_refresh_tokens;
const OathProfileClients = db.oath_profile_clients;
const Profile = db.member_profiles;
const InterestedCategories = db.interested_categories;

const generatePassword = require('password-generator');
const jwt = require("jwt-simple");
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const config = require('config');
const env = require('dotenv');
env.config();

const baseUrl = config.baseUrl;

const query = require('../../helper/query');

let conditions, select;

const resolvers = {
    Query: {
        
    } ,
    Mutation: {
        createOathProfile: async function(_, { uuid }, { context }) {
            try {
                if ( context.status.code === 1 ) {
                    conditions = {
                        uuid: uuid ,
                        member_id: context.member_id
                    };
                    select = ['id', 'uuid', 'member_id', 'name', 'avatar'];
                    const checkProfile = await query.findOneByConditions(conditions, Profile, select);

                    if ( checkProfile ) {
                        conditions = {
                            oath_member_id: context.oath_member_id
                        };
                        select = ['id'];
                        const checkOathOnceProfile = await query.findOneByConditions(conditions, OathProfileClients, select);
                        if ( !checkOathOnceProfile ) {
                            const salt_key = generatePassword(12, false);
                            const createdOathProfile = await OathProfileClients.create({
                                oath_member_id: context.oath_member_id ,
                                profile_id: checkProfile.id ,
                                uuid: uuidv4() ,
                                secret_key: salt_key ,
                                is_active: true ,
                                created_at: moment().format("YYYY-MM-DD HH:mm:ss") ,
                                updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                            });

                            const tokenPayload = {
                                sub: createdOathProfile.uuid ,
                                sub2: context.customer_uuid ,
                                iat: moment()
                            };
                            const refreshPayload = {
                                sub: createdOathProfile.uuid ,
                                sub2: context.customer_uuid ,
                                iat: moment()
                            };
                            const token = jwt.encode(tokenPayload, salt_key + process.env.TOKEN_PROFILE_KEY);
                            const refresh = jwt.encode(refreshPayload, salt_key + process.env.REFRESH_PROFILE_KEY);
                            const dataToken = {
                                profile_client_id: createdOathProfile.id ,
                                token: token ,
                                refresh: refresh ,
                                created_at: moment().format("YYYY-MM-DD HH:mm:ss") ,
                                updated_at: moment().format("YYYY-MM-DD HH:mm:ss") ,
                                token_expire_at: moment().add(60,'minutes').format("YYYY-MM-DD HH:mm:ss") ,
                                refresh_expire_at: moment().add(1,'days').format("YYYY-MM-DD HH:mm:ss")
                            };
                            await ProfileRefreshToken.create(dataToken);

                            const is_interested = await InterestedCategories.findOne({
                                attributes: ['id'] ,
                                where: { 
                                    member_profile_id: checkProfile.id
                                }
                            });
                            const interested = is_interested ? true : false;

                            return {
                                status: {
                                    code: 1 ,
                                    message: 'Success'
                                } ,
                                result: {
                                    name_profile: checkProfile.name ,
                                    avatar: checkProfile.avatar ? `${baseUrl}/${checkProfile.avatar}` : `${baseUrl}/img/no-avatar.jpg` ,
                                    token_profile: token ,
                                    refresh_profile: refresh ,
                                    is_interested: interested
                                }
                            };
                        } else {
                            await OathProfileClients.destroy({ where: { id: checkOathOnceProfile.id } });
                            const salt_key = generatePassword(12, false);
                            const createdOathProfile = await OathProfileClients.create({
                                oath_member_id: context.oath_member_id ,
                                profile_id: checkProfile.id ,
                                uuid: uuidv4() ,
                                secret_key: salt_key ,
                                is_active: true ,
                                created_at: moment().format("YYYY-MM-DD HH:mm:ss") ,
                                updated_at: moment().format("YYYY-MM-DD HH:mm:ss")
                            });

                            const tokenPayload = {
                                sub: createdOathProfile.uuid ,
                                sub2: context.customer_uuid ,
                                iat: moment()
                            };
                            const refreshPayload = {
                                sub: createdOathProfile.uuid ,
                                sub2: context.customer_uuid ,
                                iat: moment()
                            };
                            const token = jwt.encode(tokenPayload, salt_key + process.env.TOKEN_PROFILE_KEY);
                            const refresh = jwt.encode(refreshPayload, salt_key + process.env.REFRESH_PROFILE_KEY);
                            const dataToken = {
                                profile_client_id: createdOathProfile.id ,
                                token: token ,
                                refresh: refresh ,
                                created_at: moment().format("YYYY-MM-DD HH:mm:ss") ,
                                updated_at: moment().format("YYYY-MM-DD HH:mm:ss") ,
                                token_expire_at: moment().add(60,'minutes').format("YYYY-MM-DD HH:mm:ss") ,
                                refresh_expire_at: moment().add(1,'days').format("YYYY-MM-DD HH:mm:ss")
                            };
                            await ProfileRefreshToken.create(dataToken);

                            const is_interested = await InterestedCategories.findOne({
                                attributes: ['id'] ,
                                where: { 
                                    member_profile_id: checkProfile.id
                                }
                            });
                            const interested = is_interested ? true : false;

                            return {
                                status: {
                                    code: 1 ,
                                    message: 'Success'
                                } ,
                                result: {
                                    name_profile: checkProfile.name ,
                                    avatar: checkProfile.avatar ? `${baseUrl}/${checkProfile.avatar}` : `${baseUrl}/img/no-avatar.jpg` ,
                                    token_profile: token ,
                                    refresh_profile: refresh ,
                                    is_interested: interested
                                }
                            };
                        }
                    } else {
                        return {
                            status: {
                                code: 3 ,
                                message: 'Not access profile'
                            } ,
                            result: {}
                        };
                    }
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
                console.log(e);
                return {
                    status: {
                        code: 4,
                        message: "Server error"
                    } ,
                    result: {}
                };
            }
        } ,
        deleteOathProfile: async function(_, { }, { context }) {
            try {
                if ( context.status.code === 1 ) {
                    await OathProfileClients.destroy({ where: { id: context.oathProfileId } });
                    return {
                        status: {
                            code: 1 ,
                            message: "Success"
                        } ,
                        result: {
                            signOut: true
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
                console.log(e);
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