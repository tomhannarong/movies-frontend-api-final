const db = require('../../../config/db');
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const Movie = db.movies;
const Rate = db.rates;
const Category = db.categories;
const MovieCategory = db.movie_categories;

const config = require('config');
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, join;

const sectionMoreLikeThis = async (movieType, uuid, page, limit, context) => {

    conditions = {
        status_delete: 0,
        is_comingsoon: 0,
        uuid: uuid,
        customer_id: context.customerId
    };

    select = ['movie_id', 'category_id'];
    join = [
        { model: Category, attributes: [], require: true },
        { model: Movie, where: conditions, attributes: [], require: true }
    ];
    const category = await query.findOneByConditions({}, MovieCategory, select, join);
    if (!category) {
        return {
            status: {
                code: 2,
                message: "Not found in database"
            },
            result: []
        };
    }

    conditions = {
        status_delete: 0,
        type: movieType,
        is_comingsoon: 0,
        customer_id: context.customerId,
        [Op.not]: {
            id: category.movie_id
        }
    };
    select = [
        [sequelize.col('movie.uuid'), 'movie_uuid'],
        [sequelize.col('movie.type'), 'movie_type'],
        [sequelize.col(`movie.name${context.lang}`), 'movie_name'],
        [sequelize.col('movie.poster_vertical'), 'poster_v'],
        [sequelize.col('movie.poster_horizontal'), 'poster_h'],
        [sequelize.col(`movie.title${context.lang}`), 'title'],
        [sequelize.col(`movie.description${context.lang}`), 'description'],
        [sequelize.col('movie.release_date'), 'release_date'],
        [sequelize.col('movie.link'), 'link'],
        [sequelize.col('movie.runtime'), 'runtime'],
        [sequelize.col('movie.rate_id'), 'rate_id']
    ];
    join = [
        { model: Movie, where: conditions, attributes: [], require: true }
    ];
    const suggest = await query.findAllLimitByConditions({ category_id: category.category_id }, MovieCategory, select, join, [], page, limit);
    console.log(suggest);
    let itemsSuggest = [];
    if (suggest.length > 0) {
        for (const item of suggest) {
            let posterV = `${imageUrl}/img/no-poster-v.jpg`;
            let posterH = `${imageUrl}/img/no-poster-h.jpg`;
            if (item.poster_v) {
                posterV = item.poster_v.split('/');
                posterV = `${imageUrl}/${posterV[0]}/sm/${posterV[1]}/${posterV[2]}`;
            }
            if (item.poster_h) {
                posterH = item.poster_h.split('/');
                posterH = `${imageUrl}/${posterH[0]}/md/${posterH[1]}/${posterH[2]}`;
            }
            conditions = {
                id: item.rate_id
            };
            select = ['code'];
            const movieRate = await query.findOneByConditions(conditions, Rate, select);
            let tmp = {
                movie_uuid: item.movie_uuid,
                movie_type: item.movie_type,
                movie_name: item.movie_name,
                title: item.title,
                description: item.description,
                poster_v: posterV,
                poster_h: posterH,
                match: 0,
                year: item.release_date.substring(0, (item.release_date.length - 6)),
                rate_code: movieRate.code,
                user_rate: -1,
                is_favorite: false,
                is_download: false,
                link: item.link
            };
            itemsSuggest.push(tmp);
        }
    }

    return {
        status: {
            code: 1,
            message: "Success"
        },
        result: {
            items: itemsSuggest
        }
    };
};

module.exports = sectionMoreLikeThis;