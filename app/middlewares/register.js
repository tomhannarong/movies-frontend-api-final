const db = require('../../config/db');
const Member = db.member;
const Customer = db.customers;

const md5 = require('md5');
const generatePassword = require('password-generator');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const jwt = require("jwt-simple");
const moment = require('moment');
const env = require('dotenv').config();

const sendEmail = require('../helper/emailTemplate');

const register = async (req, res, next) => {
    try {
        const params = await req.body.variables;
        const customer = await Customer.findOne({
            raw: true ,
            attributes: ['id'] ,
            where: {
                uuid: params.customer_uuid
            }
        });
        if ( !customer ) {
            const status = {
                code: 2 ,
                message: "Not found customer"
            };
            const datPrivate = {
                status: status
            };
            req.dataPrivate = datPrivate;
            next();
        }

        await Member.findOne({
            raw: true ,
            attributes: ['email'] ,
            where: {
                email: params.email ,
                customer_id: customer.id
            }
        }).then( async (item) => {
            if ( !item ) {
                const saltKey = generatePassword(12, false);  
                const dataMember = {
                    uuid: uuidv4() ,
                    name: params.email ,
                    email: params.email ,
                    password: md5(params.password + saltKey) ,
                    salt_key: saltKey ,
                    is_verified: false ,
                    is_paymented: false ,
                    customer_id: customer.id ,
                    status_member_id: 1
                };

                await Member.create(dataMember).then( async (member) => {
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    const tokenPayload = {
                        sub: member.uuid ,
                        otp: otp ,
                        iat: moment()
                    };
                    const token = jwt.encode(tokenPayload, saltKey + process.env.OTP_KEY);
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
                    transporter.sendMail(mailOptions, (err, info) => {
                        if ( err ) {
                            const status = {
                                code: 2 ,
                                message: "Send email not complete"
                            };
                            const datPrivate = {
                                status: status
                            };
                            req.dataPrivate = datPrivate;
                            next();
                        } else {
                            req.body.variables.email = params.email;
                            req.body.variables.password = params.password;
                            req.body.variables.customer_uuid = params.customer_uuid;
                            req.dataPrivate = {
                                status: {
                                    code: 1 ,
                                    message: "Register success"
                                }
                            };
                            next();
                        }
                    });
                });
            } else {
                const status = {
                    code: 2 ,
                    message: "Email is exist!"
                };
                const datPrivate = {
                    status: status
                };
                req.dataPrivate = datPrivate;
                next();
            }
        });
    } catch(e) {
        const status =  {
            code: 4,
            message: "Wrong format"
        };
        const datPrivate =  {
            status: status
        };
        req.dataPrivate = datPrivate;
        next();
    }
};

module.exports = {
    register
};