module.exports = (sequelize, Sequelize) => {
    const Interested_categories = sequelize.define(
        'interested_categories' ,
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
            category_id: {
                type: Sequelize.INTEGER ,
                field: 'category_id'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Interested_categories;
};