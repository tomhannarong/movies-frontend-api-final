const db = require('../../config/db');
const Member = db.member;

const generatePassword = require('password-generator');
const md5 = require('md5');
const env = require('dotenv').config();
const jwtDecode = require('jwt-decode');
const decodeOtpToken = require("../helper/decodeOtpToken");

const query = require('../helper/query');

let conditions, select;

const validateNewPassword = async (req, res, next) => {
    try {
        const params = await req.body.variables;
        const decode = jwtDecode(req.headers.authorization);
        conditions = {
            uuid: decode.sub
        };
        select = ['email', 'salt_key', 'id'];
        const member = await query.findOneByConditions(conditions, Member, select);
        
        const jwtValid = decodeOtpToken(req.headers.authorization, member.salt_key, process.env.OTP_KEY);
        if ( jwtValid ) {
            const saltKey = generatePassword(12, false);  
            await Member.update({ password: md5(params.new_password + saltKey), salt_key: saltKey, verify_token: null}, { where: { id: member.id } });
            req.body.variables.email = member.email;
            req.body.variables.password = params.new_password;
            req.body.variables.customer_uuid = params.customer_uuid;
            req.body.variables.force = true;
            req.body.variables.is_new_password = true;
            req.dataPrivate = {
                status: {
                    code: 1 ,
                    message: "Change password success"
                }
            };
            next();
        } else {
            const status = {
                code: 3 ,
                message: "Token expire"
            };
            const datPrivate = {
                status: status
            };
            req.dataPrivate = datPrivate;
            next();
        }
    } catch(e) {
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
};

module.exports = {
    validateNewPassword
};
