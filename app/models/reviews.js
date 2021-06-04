module.exports = (sequelize, Sequelize) => {
    const Reviews = sequelize.define(
        'reviews' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            movie_id: {
                type: Sequelize.INTEGER ,
                field: 'movie_id'
            } ,
            member_profile_id: {
                type: Sequelize.INTEGER ,
                field: 'member_profile_id'
            } ,
            rating: {
                type: Sequelize.INTEGER(1) ,
                field: 'rating'
            } ,
            description: {
                type: Sequelize.TEXT ,
                field: 'description'
            } ,
            status_delete: {
                type: Sequelize.BOOLEAN ,
                field: 'status_delete'
            } ,
            created_at: {
                type: Sequelize.DATE ,
                field: 'created_at'
            } ,
            updated_at: {
                type: Sequelize.DATE ,
                field: 'updated_at'
            } ,
            deleted_at: {
                type: Sequelize.DATE ,
                field: 'deleted_at'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Reviews;
};