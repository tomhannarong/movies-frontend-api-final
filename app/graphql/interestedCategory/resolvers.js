const db = require('../../../config/db');
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const InterestCategory = db.interested_categories;
const Category = db.categories;
const MovieCategory = db.movie_categories;
const Movie = db.movies;

const config = require('config');
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, join, order, group;

const resolvers = {
    Query: {
        getInterested: async (_, {}, { context }) => {
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
                    status_delete: 0 ,
                    poster_vertical: {
                        [Op.not]: null
                    }
                };
                select = [
                    [sequelize.col('category.id'), 'category_id'] ,
                    [sequelize.col('movie.poster_vertical'), 'poster_v']
                ];
                join = [
                    { model: Category, where: { status_delete: 0 }, attributes: [], require: true } ,
                    { model: Movie, where: conditions, attributes: [], require: true }
                ];
                group = ['category.id'];
                const interest = await query.findAllByConditions({}, MovieCategory, select, join, [], group);
                for ( const item of interest ) {
                    let posterV = `${imageUrl}/img/no-poster-v.jpg`;
                    if ( item.poster_v ) {
                        posterV = item.poster_v.split('/');
                        posterV = `${imageUrl}/${posterV[0]}/sm/${posterV[1]}/${posterV[2]}`;
                    }
                    item.poster_v = posterV;
                }

                return {
                    status: {
                        code: 1 ,
                        message: "Success"
                    } ,
                    result: interest
                };
            } catch (error) {
                return {
                    status: {
                        code: 4 ,
                        message: "server error"
                    } ,
                    result: []
                };
            }
        }
    } ,
    Mutation: {
        createInterested: async function(_, { interest }, {context}) {
            
            try{

                if(context.status.code === 1 ){

                    let interestStatus = false;
                    interest.forEach(async (item) => {
                        const createInterest = await InterestCategory.create({
                            raw: true,
                            member_profile_id: context.memberProfileId,
                            category_id: item
                        });
                        if(createInterest){
                            interestStatus = true
                        }else{
                            interestStatus = true
                        }
                        console.log(interestStatus);
                    })

                    return {
                        status: {
                            code: 1,
                            message: "success"
                        } ,
                        result: {
                            is_interested: interestStatus
                        }
                    }
                
                }else{
                    return {
                        status: {
                            code: context.status.code,
                            message: context.status.message
                        } ,
                        result: {}
                    }
                }   

            }catch(e){
                return {
                    status: {
                        code: 4,
                        message: "server error"
                    } ,
                    result: {}
                }
            }
            
        }
    }
};

module.exports = resolvers;

