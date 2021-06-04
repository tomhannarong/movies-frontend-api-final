module.exports = (sequelize, Sequelize) => {
    const Download = sequelize.define(
        'download' ,
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
            movie_id: {
                type: Sequelize.INTEGER ,
                field: 'movie_id'
            } ,
            episode_id: {
                type: Sequelize.INTEGER ,
                field: 'episode_id'
            } ,
            member_profile_id: {
                type: Sequelize.INTEGER ,
                field: 'member_profile_id'
            } ,
            complete: {
                type: Sequelize.BOOLEAN ,
                field: 'complete'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Download;
};