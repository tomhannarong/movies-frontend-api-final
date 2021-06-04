const db = require('../../../config/db');
const sequelize = db.sequelize;
const Member = db.member;

const jwtDecode = require('jwt-decode');
const moment = require('moment');
const jwt = require("jwt-simple");
const nodemailer = require('nodemailer');
const sendEmail = require('../../helper/emailTemplate');
const env = require('dotenv').config();

const query = require('../../helper/query');

let conditions, select;

const resolvers = {
    Query: {
       
    } ,
    Mutation: {
        validateOTP: async function(_, { code }, { context }) {
            try {
                conditions = {
                    email: context.email ,
                    customer_id: context.customer_id
                };
                select = ['verify_token', 'id', 'verify_count'];
                const member = await query.findOneByConditions(conditions, Member, select);
                if ( member.verify_count < 3 ) {
                    const decode = jwtDecode(member.verify_token);
                    if ( decode.otp === code ) {
                        return {
                            status: {
                                code: 1 ,
                                message: 'Verification success'
                            } ,
                            result: {
                                verify_success : true ,
                                new_password_token: member.verify_token
                            }
                        };
                    } else {
                        await Member.update({ verify_count: sequelize.literal('verify_count + 1') }, { where: { id: member.id } });
                        return {
                            status: {
                                code: 2 ,
                                message: 'Verification invalid'
                            } ,
                            result: {
                                verify_success : false
                            }
                        };
                    }
                } else {
                    await Member.update({ verify_token: null, verify_count: 0 }, { where: { id: member.id } });
                    return {
                        status: {
                            code: 2,
                            message: 'Verification limit pls resend email'
                        } ,
                        result: {
                            verify_success : false
                        }
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
        },
        updateTokenForgot: async function(_, { }, { context }) {
            try {
                if ( context.status.code === 1 ) {
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    const tokenPayload = {
                        sub: context.uuid ,
                        sub2: context.customer_uuid ,
                        otp: otp ,
                        iat: moment()
                    };
                    const token = jwt.encode(tokenPayload, context.salt_key + process.env.OTP_KEY);
                    await Member.update({ verify_token: token }, { where: { uuid: context.uuid } });
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'adesso.movie.streaming@gmail.com', // your email
                            pass: 'Adesso456!' // your email password
                        } ,
                        tls: {
                            rejectUnauthorized: false
                        }
                    });

                    const mailOptions = sendEmail(context.email, 'Please verify email for forgotpassword', otp);
                    try {
                        await transporter.sendMail(mailOptions);
                        return {
                            status: {
                                code: 1 ,
                                message: "Send email success"
                            } ,
                            result: {
                                email: context.email,
                                success: true
                            }
                        };
                    } catch(err) {
                        await Member.update({ verify_token: null }, { where: { uuid: context.uuid } })   
                        return {
                            status: {
                                code: 3,
                                message: "Send email error"
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
                        message: "server error"
                    } ,
                    result: {}
                };
            }
        }
    }
};

module.exports = resolvers;