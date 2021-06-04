const db = require('../../../config/db');
const sequelize = db.sequelize;
const Movie = db.movies;
const Favorite = db.favorites;

const config = require('config');
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, join, order;

const favorites = async (page, limit, context) => {
    conditions = {
        member_profile_id: context.memberProfileId
    };
    select = [
        [sequelize.col('movie.uuid'), 'movie_uuid'],
        [sequelize.col('movie.type'), 'movie_type'],
        [sequelize.col(`movie.name${context.lang}`), 'movie_name'],
        [sequelize.col('movie.poster_vertical'), 'poster_v'],
        [sequelize.col('movie.poster_horizontal'), 'poster_h']
    ];
    join = [
        { model: Movie, where: { status_delete: 0, is_comingsoon: 0 }, attributes: [], require: true }
    ];
    order = [
        ['created_at', 'DESC']
    ];
    const favorites = await query.findAllLimitByConditions(conditions, Favorite, select, join, order, page, limit);

    let itemsFavorite = [];
    if (favorites.length > 0) {
        for (const item of favorites) {
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
            tmp = {
                movie_type: item.movie_type,
                movie_uuid: item.movie_uuid,
                movie_name: item.movie_name,
                poster_v: posterV,
                poster_h: posterH
            };
            itemsFavorite.push(tmp);
        }
    }

    return {
        status: {
            code: 1,
            message: "Success"
        },
        result: {
            items: itemsFavorite
        }
    }
};

module.exports = favorites;