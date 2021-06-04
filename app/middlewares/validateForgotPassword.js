const { customers } = require('../../config/db');
const db = require('../../config/db');
const { findOneByConditions } = require('../helper/query');
const Member = db.member;
const Customer = db.customers;

const query = require('../helper/query');

let conditions, select;

const validateForgotPassword = async (req, res, next) => {
    try {
        const params = await req.body.variables;
        
        conditions = {
            uuid: params.customer_uuid
        };
        select = ['id'];
        const customer = await query.findOneByConditions(conditions, Customer, select);
        if ( !customer ) {
            const status = {
                code: 2 ,
                message: "Customer invalid"
            };
            const datPrivate = {
                status: status
            };
            req.dataPrivate = datPrivate;
            next();
        }

        conditions = {
            email: params.email ,
            customer_id: customer.id
        };
        select = ['email', 'salt_key', 'uuid'];
        const member = await findOneByConditions(conditions, Member, select);

        if ( member ) {
            const status = {
                code: 1 ,
                message: "Email valid"
            };
            const datPrivate = {
                status: status ,
                uuid: member.uuid ,
                email: member.email ,
                salt_key: member.salt_key ,
                customer_id: customer.id ,
                customer_uuid: params.customer_uuid
            };
            req.dataPrivate = datPrivate;
            next();
        } else {
            const status = {
                code: 2 ,
                message: "Email invalid"
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
    validateForgotPassword
};