module.exports = (sequelize, Sequelize) => {
    const MemberProfiles = sequelize.define(
        'member_profiles' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            uuid: {
                type: Sequelize.STRING(255) ,
                field: 'uuid'
            } ,
            member_id: {
                type: Sequelize.INTEGER(11) ,
                field: 'member_id'
            } ,
            name: {
                type: Sequelize.STRING(100) ,
                field: 'name'
            },
            avatar: {
                type: Sequelize.STRING(255) ,
                field: 'avatar'
            }
        } ,
        {
            timestamps: false,
            freezeTableName: true
        }
    );
    return MemberProfiles;
};