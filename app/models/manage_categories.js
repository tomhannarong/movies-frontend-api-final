module.exports = (sequelize, Sequelize) => {
    const ManageCategories = sequelize.define(
        'manage_categories' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            customer_id: {
                type: Sequelize.INTEGER ,
                field: 'customer_id'
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
    return ManageCategories;
};