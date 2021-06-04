const db = require('../../../config/db');
const Member = db.member;
const OathMemberClients = db.oath_member_clients;
const MemberRefreshToken = db.member_refresh_tokens;
const Customer = db.customers;

const generatePassword = require('password-generator');
const { v4: uuidv4 } = require('uuid');
const jwt = require("jwt-simple");
const moment = require('moment');
const env = require('dotenv');
env.config();

const query = require('../../helper/query');

let conditions, select;

const resolvers = {
    Query: {
        
    } ,
    Mutation: {
        createOath: async (_, { }, { context }) => {
            try {
                if ( context.status.code === 1 ) {
                    conditions = {
                        uuid: context.uuid
                    };
                    select = ['id', 'uuid', 'name', 'email', 'is_verified', 'is_paymented', 'customer_id'];
                    const member = await query.findOneByConditions(conditions, Member, select);
                    
                    conditions = {
                        member_id: member.id
                    };
                    const countOathMember = await query.countDataRows(conditions, OathMemberClients);
    
                    if ( countOathMember < 1 ) { // pls edit limit member login
                        const salt_key = generatePassword(12, false);
                        const dataClient = {
                            member_id: member.id ,
                            uuid: uuidv4() ,
                            name: context.nameClient ,
                            address: context.locations.city ,
                            secret_key: salt_key ,
                            ip_address: context.locations.ip ,
                            is_active: true
                        };
                        const createdOathMember = await OathMemberClients.create(dataClient);
                        
                        const tokenPayload = {
                            sub: createdOathMember.uuid ,
                            sub2: context.customer_uuid ,
                            iat: moment()
                        };
                        const refreshPayload = {
                            sub: createdOathMember.uuid ,
                            sub2: context.customer_uuid ,
                            iat: moment()
                        };
                        const token = jwt.encode(tokenPayload, createdOathMember.secret_key + process.env.TOKEN_MEMBER_KEY);
                        const refresh = jwt.encode(refreshPayload, createdOathMember.secret_key + process.env.REFRESH_MEMBER_KEY);
                        const dataToken = {
                            member_client_id: createdOathMember.id ,
                            token: token ,
                            refresh: refresh ,
                            token_expire_at: moment().add(60,'minutes').format("YYYY-MM-DD HH:mm:ss") ,
                            refresh_expire_at: moment().add(7,'days').format("YYYY-MM-DD HH:mm:ss")
                        };
                        await MemberRefreshToken.create(dataToken);
    
                        return {
                            status: {
                                code: 1 ,
                                message: 'Login success'
                            } ,
                            result: {
                                name: member.name ,
                                is_verified: member.is_verified ,
                                is_paymented: member.is_paymented ,
                                is_new_password: context.is_new_password ,
                                token: token ,
                                refresh: refresh
                            }
                        };
                    } else {
                        if ( context.force ) {
                            conditions = {
                                member_id: member.id
                            };
                            select = ['id'];
                            const firstOath = await query.findOneByConditions(conditions, OathMemberClients, select);
                            await OathMemberClients.destroy({ where: { id: firstOath.id } });
                            const salt_key = generatePassword(12, false);
                            const dataClient = {
                                member_id: member.id ,
                                uuid: uuidv4() ,
                                name: context.nameClient ,
                                address: context.locations.city ,
                                secret_key: salt_key ,
                                ip_address: context.locations.ip ,
                                is_active: true
                            };
                            const createdOathMember = await OathMemberClients.create(dataClient);
                            
                            const tokenPayload = {
                                sub: createdOathMember.uuid ,
                                sub2: context.customer_uuid ,
                                iat: moment()
                            };
                            const refreshPayload = {
                                sub: createdOathMember.uuid ,
                                sub2: context.customer_uuid ,
                                iat: moment()
                            };
                            const token = jwt.encode(tokenPayload, createdOathMember.secret_key + process.env.TOKEN_MEMBER_KEY);
                            const refresh = jwt.encode(refreshPayload, createdOathMember.secret_key + process.env.REFRESH_MEMBER_KEY);
                            const dataToken = {
                                member_client_id: createdOathMember.id ,
                                token: token ,
                                refresh: refresh ,
                                token_expire_at: moment().add(60,'minutes').format("YYYY-MM-DD HH:mm:ss") ,
                                refresh_expire_at: moment().add(7,'days').format("YYYY-MM-DD HH:mm:ss")
                            };
                            await MemberRefreshToken.create(dataToken);
        
                            return {
                                status: {
                                    code: 1,
                                    message: 'Login success'
                                } ,
                                result: {
                                    name: member.name ,
                                    is_verified: member.is_verified ,
                                    is_paymented: member.is_paymented ,
                                    is_new_password: context.is_new_password ,
                                    token: token ,
                                    refresh: refresh 
                                }
                            };
                        } else {
                            return {
                                status: {
                                    code: 5 ,
                                    message: 'Limit login.'
                                } ,
                                result: {}
                            };
                        }
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
                return {
                    status: {
                        code: 4 ,
                        message: "server error"
                    } ,
                    result: {}
                };
            }
        }
    }
};

module.exports = resolvers;