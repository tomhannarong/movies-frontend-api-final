const db = require('../../config/db');
const Member = db.member;
const Customer = db.customers;

const md5 = require('md5');
const getLocation = require("../helper/getLocationIp");

const query = require('../helper/query');

let conditions, select;

const oathMember = async (req, res, next) => {
    try {
        if ( req.dataPrivate ) { // Pass middleware register
            if ( req.dataPrivate.status.code !== 1 ) {
                const datPrivate = {
                    status: req.dataPrivate.status
                };
                req.dataPrivate = datPrivate;
                next();
            }
        }
        
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
        select = ['salt_key'];
        const member = await query.findOneByConditions(conditions, Member, select);
        if ( member ) {
            conditions = {
                email: params.email ,
                password: md5(params.password + member.salt_key)
            };
            select = ['uuid'];
            const memberWithPass = await query.findOneByConditions(conditions, Member, select);
            if ( memberWithPass ) {
                const locations = getLocation(req);
                const nameClient = `${req.useragent.platform}, ${req.useragent.browser}`;
                const status = {
                    code: 1 ,
                    message: "success"
                };

                let force = false;
                if ( params.force ) {
                    force = params.force;
                }

                let isNewPassword = false;
                if ( params.is_new_password ) {
                    isNewPassword = true;
                }

                const datPrivate = {
                    status: status ,
                    uuid: memberWithPass.uuid ,
                    locations: locations ,
                    nameClient: nameClient ,
                    force: force ,
                    is_new_password: isNewPassword ,
                    customer_uuid: params.customer_uuid
                };
                req.dataPrivate = datPrivate;
                next();
            } else {
                const status =  {
                    code: 2 ,
                    message: "Wrong password"
                };
                const datPrivate = {
                    status: status
                };
                req.dataPrivate = datPrivate;
                next();
            }
        } else {
            const status = {
                code: 2 ,
                message: "Email not exist"
            };
            const datPrivate = {
                status: status
            };
            req.dataPrivate = datPrivate;
            next();
        }
    } catch(e) {
        console.log(e);
        const status =  {
            code: 4,
            message: "Wrong format error"
        };
        const datPrivate = {
            status: status,
        };
        req.dataPrivate = datPrivate;
        next();
    }
};

module.exports = {
    oathMember
};