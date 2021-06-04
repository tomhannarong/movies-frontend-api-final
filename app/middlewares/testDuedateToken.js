const db = require('../../config/db');
const MemberRefreshToken = db.member_refresh_tokens;
const ProfileRefreshToken = db.profile_refresh_tokens;
const moment = require('moment');

const testDuedateToken = async (req, res, next) => {
    try {
        const params = await req.body.variables;
        const memberToken = await MemberRefreshToken.findOne({
            attributes: ['id'] ,
            where: {
                token: params.token
            }
        });
        const type = ['seconds', 'minutes'];
        const update = {
            token_expire_at: moment().add(params.token_time, type[params.type]).format("YYYY-MM-DD HH:mm:ss") ,
            refresh_expire_at: moment().add(params.refresh_time, type[params.type]).format("YYYY-MM-DD HH:mm:ss")
        };
        await MemberRefreshToken.update(update, { where: { id: memberToken.id } });
        res.json({ status: true });
    } catch(e) {
        console.log(e);
        res.json({ status: false });
    }
};

const testDuedateTokenProfile = async (req, res, next) => {
    try {
        const params = await req.body.variables;
        const profileToken = await ProfileRefreshToken.findOne({
            attributes: ['id'] ,
            where: {
                token: params.token
            }
        });
        const type = ['seconds', 'minutes'];
        const update = {
            token_expire_at: moment().add(params.token_time, type[params.type]).format("YYYY-MM-DD HH:mm:ss") ,
            refresh_expire_at: moment().add(params.refresh_time, type[params.type]).format("YYYY-MM-DD HH:mm:ss")
        };
        await ProfileRefreshToken.update(update, { where: { id: profileToken.id } });
        res.json({ status: true });
    } catch (error) {
        console.log(e);
        res.json({ status: false });
    }
};

module.exports = {
    testDuedateToken ,
    testDuedateTokenProfile
};