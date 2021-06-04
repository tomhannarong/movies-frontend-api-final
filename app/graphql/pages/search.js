const db = require('../../../config/db');
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const Movie = db.movies;

const config = require('config');
const baseUrl = config.baseUrl;
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select;

const search = async (keyword, limit, context) => {
    let section = [];

    conditions = {
        status_delete: 0 ,
        is_comingsoon: 0 ,
        customer_id: context.customerId
    };
    if (keyword) {
        conditions = {
            status_delete: 0,
            customer_id: context.customerId,
            [Op.or]: {
                name: { [Op.regexp]: keyword },
                name_en: { [Op.regexp]: keyword },
                title: { [Op.regexp]: keyword },
                title_en: { [Op.regexp]: keyword },
                description: { [Op.regexp]: keyword },
                description_en: { [Op.regexp]: keyword },
                actors: { [Op.regexp]: keyword },
                actors_en: { [Op.regexp]: keyword },
                directors: { [Op.regexp]: keyword },
                directors_en: { [Op.regexp]: keyword },
                authors: { [Op.regexp]: keyword },
                authors_en: { [Op.regexp]: keyword }
            },
            is_comingsoon: 0,
        };
    }

    select = [
        [sequelize.col('movies.uuid'), 'movie_uuid'],
        [sequelize.col('movies.type'), 'movie_type'],
        [sequelize.col(`movies.name${context.lang}`), 'movie_name'],
        [sequelize.col('movies.poster_vertical'), 'poster_v'],
        [sequelize.col('movies.poster_horizontal'), 'poster_h'],
    ];
    order = [
        ['created_at', 'DESC']
    ];
    const movies = await query.findAllLimitByConditions(conditions, Movie, select, [], order, 1, limit);
    let itemsSearch = [];
    if (movies.length > 0) {
        for (const item of movies) {
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
            itemsSearch.push(tmp);
        }
    }

    const sectionSearch = {
        group_type: 3,
        group_name: "Search",
        section: 9,
        loadmore: `${baseUrl}/loadmore?query=query{loadmoreItems(input:{section:$section,keyword:"$keyword",page:$page,limit:$limit}){status{code message}result{items{movie_type movie_uuid movie_name poster_v poster_h}}}}`,
        items: itemsSearch
    };
    section.push(sectionSearch);

    return {
        status: {
            code: 1,
            message: "Success"
        },
        result: section
    }
};

module.exports = search;