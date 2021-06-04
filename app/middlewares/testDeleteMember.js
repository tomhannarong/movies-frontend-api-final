const env = require('dotenv').config();
const db = require('../../config/db');
const Member = db.member;
const oathMember = db.oath_member_clients;

let conditions, select, join;

const testDeleteMember = async (req, res, next) => {
    try{
        const params = await req.body.variables;
        const member = await Member.findOne({
            attributes: ['id'] ,
            where: {
                email: params.email
            }
        });
        const deleteMember = await Member.destroy({
            where: {
                id: member.id
            }
        });
        const deleteOath = await oathMember.destroy({
            where: {
                member_id: member.id
            }
        });

        res.json({ status: true })
        

    } catch(e) {
        console.log(e);
        res.json({ status: false })
    }
};

module.exports = {
    testDeleteMember
};
