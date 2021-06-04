module.exports = (sequelize, Sequelize) => {
    const Oath_profile_clients = sequelize.define(
        'oath_profile_clients' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            oath_member_id: {
                type: Sequelize.INTEGER ,
                field: 'oath_member_id'
            } ,
            profile_id: {
                type: Sequelize.INTEGER ,
                field: 'profile_id'
            } ,
            uuid: {
                type: Sequelize.STRING(255) ,
                field: 'uuid'
            },
            secret_key: {
                type: Sequelize.STRING(255) ,
                field: 'secret_key'
            } ,
            is_active: {
                type: Sequelize.BOOLEAN ,
                field: 'is_active'
            } ,
            created_at: {
                type: Sequelize.DATE ,
                field: 'created_at'
            } ,
            updated_at: {
                type: Sequelize.DATE ,
                field: 'updated_at'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Oath_profile_clients;
};