module.exports = (sequelize, Sequelize) => {
    const Profile_refresh_tokens = sequelize.define(
        'profile_refresh_tokens' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            profile_client_id: {
                type: Sequelize.INTEGER,
                field: 'profile_client_id'
            } ,
            token: {
                type: Sequelize.STRING(255) ,
                field: 'token'
            } ,
            refresh: {
                type: Sequelize.STRING(255) ,
                field: 'refresh'
            } ,
            created_at: {
                type: Sequelize.DATE ,
                field: 'created_at'
            } ,
            updated_at: {
                type: Sequelize.DATE ,
                field: 'updated_at'
            } ,
            token_expire_at: {
                type: Sequelize.DATE ,
                field: 'token_expire_at'
            } ,
            refresh_expire_at: {
                type: Sequelize.DATE ,
                field: 'refresh_expire_at'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Profile_refresh_tokens;
};