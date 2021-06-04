const db = require('../../../config/db');
const sequelize = db.sequelize;
const Movie = db.movies;
const Rate = db.rates;

const config = require('config');
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, join, order;

const comingSoon = async (page, limit, context) => {
    conditions = {
        status_delete: 0,
        customer_id: context.customerId,
        is_comingsoon: 1
    };
    select = [
        [sequelize.col('movies.id'), 'movie_id'],
        [sequelize.col('movies.uuid'), 'movie_uuid'],
        [sequelize.col('movies.type'), 'movie_type'],
        [sequelize.col(`movies.name${context.lang}`), 'movie_name'],
        [sequelize.col('movies.poster_horizontal'), 'poster_h'],
        [sequelize.col(`movies.title${context.lang}`), 'title'],
        [sequelize.col('movies.release_date'), 'release_date'],
        [sequelize.col('rate.code'), 'rate_code'],
        [sequelize.col('movies.trailer'), 'trailer'],
        [sequelize.col('movies.runtime'), 'runtime'],
    ];
    join = [
        { model: Rate, attributes: [], require: true }
    ];
    order = [
        ['release_date', 'ASC']
    ];
    const comingSoon = await query.findAllLimitByConditions(conditions, Movie, select, join, order, page, limit);
    const itemsComingSoon = [];
    if (comingSoon.length > 0) {
        for (const item of comingSoon) {
            const hours = Math.floor(item.runtime / 60);
            const minutes = item.runtime % 60;
            let posterH = `${imageUrl}/img/no-poster-h.jpg`;
            if (item.poster_h) {
                posterH = item.poster_h.split('/');
                posterH = `${imageUrl}/${posterH[0]}/md/${posterH[1]}/${posterH[2]}`;
            }
            let tmp = {
                movie_uuid: item.movie_uuid,
                movie_type: item.movie_type,
                movie_name: item.movie_name,
                poster_h: posterH,
                title: item.title,
                release_date: item.release_date,
                rate_code: item.rate_code,
                trailer: item.trailer ? item.trailer : "",
                hours: `${hours}.${minutes}`,
            };
            itemsComingSoon.push(tmp);
        }
    }

    return {
        status: {
            code: 1,
            message: "Success"
        },
        result: {
            items: itemsComingSoon
        }
    }
};

module.exports = comingSoon;