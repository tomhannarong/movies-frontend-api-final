const db = require('../../../config/db');
const sequelize = db.sequelize;
const Category = db.categories;
const ManageCategory = db.manage_categories;
const Movie = db.movies;
const MovieCategory = db.movie_categories;

const query = require('../../helper/query');

let conditions, select, join;

const resolvers = {
    Query: {
        categoriesList: async (_, {}, { context }) => {
            try {
                if ( context.status.code != 1 ) {
                    return {
                        status: {
                            code: context.status.code ,
                            message: context.status.message
                        } ,
                        result: []
                    };
                }

                conditions = {
                    customer_id: context.customerId
                };
                select = [
                    [sequelize.col('category.id'), 'category_id'] ,
                    [sequelize.col(`category.name${context.lang}`), 'category_name']
                ];
                join = [
                    { model: Category, where: { status_delete: 0 }, attributes: [], required: true }
                ];
                const categories = await query.findAllByConditions(conditions, ManageCategory, select, join);
                
                let list = [{ category_id: 0, category_name: context.lang == '' ? 'ทั้งหมด' : 'All Category' }];
                for ( const item of categories ) {
                    conditions = {
                        status_delete: 0 ,
                        is_comingsoon: 0 ,
                        customer_id: context.customerId
                    };
                    join = [
                        { model: Movie, where: conditions, attributes: [], required: true }
                    ];
                    const checkCategory = await query.countDataRows({ category_id: item.category_id }, MovieCategory, join);
                    if ( checkCategory > 0 ) {
                        list.push(item);
                    }
                }

                return {
                    status: {
                        code: 1 ,
                        message: "Success"
                    } ,
                    result: list
                };
            } catch (error) {
                return {
                    status: {
                        code: 4 ,
                        message: "Server error"
                    } ,
                    result: []
                };
            }
        }
    } ,
};

module.exports = resolvers;