module.exports = (sequelize, Sequelize) => {
    const ContinueWatching = sequelize.define(
        'continue_watching' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            member_profile_id: {
                type: Sequelize.INTEGER ,
                field: 'member_profile_id'
            } ,
            movie_id: {
                type: Sequelize.INTEGER ,
                field: 'movie_id'
            } ,
            episode_id: {
                type: Sequelize.INTEGER ,
                field: 'episode_id'
            } ,
            current_time: {
                type: Sequelize.INTEGER ,
                field: 'current_time'
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
    return ContinueWatching;
};