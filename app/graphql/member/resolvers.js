const db = require('../../../config/db');
const sequelize = db.sequelize;
const Package = db.packages;
const Member = db.member;
const OathMemberClient = db.oath_member_clients;

const jwtDecode = require('jwt-decode');
const env = require('dotenv').config();
const jwt = require("jwt-simple");
const moment = require('moment');
const nodemailer = require('nodemailer');

const sendEmail = require('../../helper/emailTemplate');

const query = require('../../helper/query');

let conditions, select;

const resolvers = {
    Query: {
        getSelectPackage: async (_, { }, { context }) => {
            try {
                if ( context.status.code != 1 ) {
                    return {
                        status: {
                            code: context.status.code ,
                            message: context.status.message
                        } ,
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0 ,
                    customer_id: context.customer_id
                };
                select = [
                    [sequelize.col('packages.uuid'), 'package_uuid'] ,
                    [sequelize.col('packages.name'), 'package_name'] ,
                    'price', 'days', 'max_quality', 'limit_device'
                ];
                const packages = await query.findAllByConditions(conditions, Package, select);

                return {
                    status: {
                        code: 1 ,
                        message: "Success"
                    } ,
                    result: packages
                };
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
        } ,
        getPackageByUuid: async (_, { package_uuid }, { context }) => {
            try {
                if ( context.status.code != 1 ) {
                    return {
                        status: {
                            code: context.status.code ,
                            message: context.status.message
                        } ,
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0 ,
                    uuid: package_uuid ,
                    customer_id: context.customer_id
                };
                select = [
                    [sequelize.col('packages.uuid'), 'package_uuid'] ,
                    [sequelize.col('packages.name'), 'package_name'] ,
                    'price', 'days', 'max_quality', 'limit_device'
                ];
                const packages = await query.findOneByConditions(conditions, Package, select);

                return {
                    status: {
                        code: 1 ,
                        message: "Success"
                    } ,
                    result: packages
                };
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
    } ,
    Mutation: {
        updateVerifyEmail: async (_, { code }, { context }) => {
            try {
                if ( context.status.code === 1 ) {
                    conditions = {
                        id: context.member_id
                    };
                    select = ['verify_token'];
                    const member = await query.findOneByConditions(conditions, Member, select);

                    const decode = jwtDecode(member.verify_token);
                    if ( decode.otp === code ) {
                        await Member.update({ is_verified : true, verify_token: null }, { where: { id: context.member_id } });
                        return {
                            status: {
                                code: 1 ,
                                message: 'Verification success'
                            } ,
                            result: {
                                is_verified : true
                            }
                        };
                    } else {
                        return {
                            status: {
                                code: 2 ,
                                message: 'Verification invalid'
                            } ,
                            result: {
                                is_verified : false
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
        } ,
        updateTokenEmail: async (_, { }, { context }) => {
            try {
                if ( context.status.code === 1 ) {
                    conditions = {
                        id: context.member_id
                    };
                    select = ['uuid', 'email', 'salt_key'];
                    const member = await query.findOneByConditions(conditions, Member, select);

                    const otp = Math.floor(100000 + Math.random() * 900000);
                    const tokenPayload = {
                        sub: member.uuid ,
                        otp: otp ,
                        iat: moment()
                    };
                    const token = jwt.encode(tokenPayload, member.salt_key + process.env.OTP_KEY);
                    await Member.update({ verify_token: token }, { where: { uuid: member.uuid } });
                    const transporter = nodemailer.createTransport({
                        service: 'gmail' ,
                        auth: {
                            user: 'adesso.movie.streaming@gmail.com' , // your email
                            pass: 'Adesso456!' // your email password
                        } ,
                        tls: {
                            rejectUnauthorized: false
                        }
                    });

                    const mailOptions = sendEmail(member.email, 'Please verify email for register', otp);
                    try {
                        await transporter.sendMail(mailOptions);
                        return {
                            status: {
                                code: 1 ,
                                message: "Resend email success"
                            } ,
                            result: {
                                email: member.email ,
                                success: true
                            }
                        }; 
                    } catch(err) {
                        await Member.update({ verify_token: null }, { where: { uuid: member.uuid } });
                        return {
                            status: {
                                code: 3 ,
                                message: "Resend email error"
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
        } ,
        deleteOathMember: async (_, { }, { context }) => {
            try {
                if ( context.status.code === 1 ) {
                    const deleteMemberClient = await OathMemberClient.destroy({ where: { id: context.oath_member_id } });
                    if ( deleteMemberClient === 1 ) {
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
                                code: 2 ,
                                message: "Success"
                            } ,
                            result: {
                                signOut: false
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