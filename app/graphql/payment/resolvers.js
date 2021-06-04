const db = require('../../../config/db');
const Member = db.member;
const Profile = db.member_profiles;
const Package = db.packages;

const { v4: uuidv4 } = require('uuid');

const query = require('../../helper/query');

let conditions, select;

const resolvers = {
    Query: {
        
    } ,
    Mutation: {
        payment: async (_, { package_uuid }, { context }) => {
            try {
                if ( context.status.code === 1 ) {
                    conditions = {
                        uuid: package_uuid ,
                        customer_id: context.customer_id
                    };
                    select = ['id'];
                    const package = await query.findOneByConditions(conditions, Package, select);
                    
                    await Member.update({ is_paymented: true, package_id: package.id }, { where: { id: context.member_id } });

                    conditions = {
                        member_id: context.member_id
                    };
                    select = ['id'];
                    const checkProfile = await query.findOneByConditions(conditions, Profile, select);
                    if ( checkProfile ) {
                        return {
                            status: {
                                code: 1 ,
                                message: "Success"
                            } ,
                            result: {
                                is_paymented: true
                            }
                        };
                    } else {
                        for ( let i = 1; i < 5; i++ ) {
                            await Profile.create({
                                uuid: uuidv4() ,
                                member_id: context.member_id ,
                                name: `Profile ${i}`
                            });
                        }
                        return {
                            status: {
                                code: 1 ,
                                message: "Success"
                            } ,
                            result: {
                                is_paymented: true
                            }
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
            } catch (error) {
                console.log(error);
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