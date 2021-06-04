const env = require('dotenv').config();
const db = require('../../config/db');
const Member = db.member;
const oathMember = db.oath_member_clients;

let conditions, select, join;

const testSetFalsePayment = async (req, res, next) => {
    try{
        const params = await req.body.variables;
        const member = await Member.findOne({
            attributes: ['id'] ,
            where: {
                email: params.email
            }
        });
        const updatedPayment = await Member.update( {is_paymented: false}, { where: { id: member.id } });

        res.json({ status: true })
        

    } catch(e) {
        console.log(e);
        res.json({ status: false })
    }
};

module.exports = {
    testSetFalsePayment
};
