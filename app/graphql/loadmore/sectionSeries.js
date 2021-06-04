const db = require('../../../config/db');
const sequelize = db.sequelize;
const Movie = db.movies;
const MovieCategory = db.movie_categories;
const Rate = db.rates;

const config = require('config');
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, order, group;

const series = async (categoryId, page, limit, context) => {
    let conditionCategory = {};
    if ( categoryId > 0 ) {
        conditionCategory = {
            category_id: categoryId
        };
    }

    conditions = {
        status_delete: 0 ,
        is_comingsoon: 0 ,
        type: 1 ,
        customer_id: context.customerId
    };
    select = [
        [sequelize.col('movie.uuid'), 'movie_uuid'] ,
        [sequelize.col('movie.type'), 'movie_type'] ,
        [sequelize.col(`movie.name${context.lang}`), 'movie_name'] ,
        [sequelize.col('movie.poster_vertical'), 'poster_v'] ,
        [sequelize.col('movie.poster_horizontal'), 'poster_h'] ,
        [sequelize.col(`movie.title${context.lang}`), 'title'] ,
        [sequelize.col(`movie.description${context.lang}`), 'description'] ,
        [sequelize.col(`movie.actors${context.lang}`), 'actors'] ,
        [sequelize.col('movie.release_date'), 'release_date'] ,
        [sequelize.col('movie.link'), 'link'] ,
        [sequelize.col('movie.runtime'), 'runtime'] ,
        [sequelize.col('movie->rate.code'), 'rate_code']
    ];
    order = [
        [{ model: Movie }, 'views', 'DESC'] ,
        [{ model: Movie }, 'created_at', 'DESC']
    ];
    join = [
        { model: Movie, where: conditions, attributes: [], required: true, include: [{ model: Rate, attributes: [], required: true }] }
    ];
    group = ['movie.id'];
    const series = await query.findAllLimitByConditions(conditionCategory, MovieCategory, select, join, order, page, limit, group);
    let itemsSeries = [];
    if ( series.length > 0 ) {
        for ( const item of series ) {
            let posterV = `${imageUrl}/img/no-poster-v.jpg`;
            let posterH = `${imageUrl}/img/no-poster-h.jpg`;
            if ( item.poster_v ) {
                posterV = item.poster_v.split('/');
                posterV = `${imageUrl}/${posterV[0]}/sm/${posterV[1]}/${posterV[2]}`;
            }
            if ( item.poster_h ) {
                posterH = item.poster_h.split('/');
                posterH = `${imageUrl}/${posterH[0]}/lg/${posterH[1]}/${posterH[2]}`;
            }
            let tmp = {
                movie_type: item.movie_type ,
                movie_uuid: item.movie_uuid ,
                movie_name: item.movie_name ,
                episode_uuid: "" ,
                episode_name: "" ,
                poster_v: posterV ,
                poster_h: posterH ,
                title: item.title ,
                description: item.description ,
                actors: item.actors ,
                match: 0 ,
                year: item.release_date.substring(0, (item.release_date.length - 6)) ,
                user_rate: -1 ,
                rate_code: item.rate_code ,
                is_favorite: false ,
                link: "" ,
                runtime: item.runtime * 60000 ,
                current_time: 0 ,
                progress_bar: 0
            };
            itemsSeries.push(tmp);
        }
    }

    return {
        status: {
            code: 1 ,
            message: "Success"
        } ,
        result: {
            items: itemsSeries
        }
    };
};

module.exports = series;