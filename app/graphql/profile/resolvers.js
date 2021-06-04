const db = require('../../../config/db');
const MemberProfile = db.member_profiles

const config = require('config');
const baseUrl = config.baseUrl;

const query = require('../../helper/query');

let conditions, select;

const resolvers = {
    Query: {
        getProfile: async (_, { }, { context }) => {
            try {
                if ( context.status.code === 1 ) {
                    if ( context.is_paymented ) {
                        conditions = {
                            member_id: context.member_id
                        };
                        select = ['uuid', 'name', 'avatar'];
                        const profiles = await query.findAllByConditions(conditions, MemberProfile, select);

                        for ( const item of profiles ) {
                            let avatar = `${baseUrl}/img/no-avatar.jpg`;
                            if ( item.avatar ) avatar = `${baseUrl}/${item.avatar}`;
                            item.avatar = avatar;
                        }
        
                        return {
                            status: {
                                code: 1,
                                message: "Success"
                            } ,
                            result: profiles
                        }

                    } else {
                        return {
                            status: {
                                code: 2 ,
                                message: "Not payment"
                            } ,
                            result: []
                        }
                    }
                } else {
                    return {
                        status: {
                            code: context.status.code ,
                            message: context.status.message
                        } ,
                        result: []
                    };
                }
            } catch(e) {
                console.log(e);
                return {
                    status: {
                        code: 4 ,
                        message: "Server error"
                    } ,
                    result: []
                };
            }
        }
    }
};

module.exports = resolvers;