const db = require('../../../config/db');
const sequelize = db.sequelize;
const Member = db.member;
const MemberProfile = db.member_profiles;

const config = require('config');
const baseUrl = config.baseUrl;

const query = require('../../helper/query');

let conditions, select, join;

const account = async (context) => {
    let section = [];

    conditions = {
        id: context.memberId
    };
    // email card_number next_billing_date
    select = [
        [sequelize.col('member_profiles.id'), 'member_profile_id'],
        [sequelize.col('member_profiles.uuid'), 'member_profile_uuid'],
        [sequelize.col('member_profiles.name'), 'member_profile_name'],
        [sequelize.col('member_profiles.avatar'), 'avatar'],
        [sequelize.col('member.email'), 'email']

    ];
    join = [
        { model: MemberProfile, attributes: [], require: true }
    ];
    const memberProfile = await query.findAllByConditions(conditions, Member, select, join);
    let itemsMemberProfile = [];
    if (memberProfile.length > 0) {
        for (const item of memberProfile) {
            let avatar = `${baseUrl}/img/no-avatar.jpg`;
            if (item.avatar) avatar = `${baseUrl}/${item.avatar}`;
            let tmp = {
                member_profile_uuid: item.member_profile_uuid,
                member_profile_name: item.member_profile_name,
                avatar: avatar,
                is_me: item.member_profile_id == context.memberProfileId ? true : false,
                email: item.email
            };
            itemsMemberProfile.push(tmp);
        }
    }
    const sectionMemberProfile = {
        group_type: 1,
        group_name: "Profile",
        items: itemsMemberProfile
    };
    section.push(sectionMemberProfile);

    return {
        status: {
            code: 1,
            message: "Success"
        },
        result: section
    }
};
module.exports = account;
