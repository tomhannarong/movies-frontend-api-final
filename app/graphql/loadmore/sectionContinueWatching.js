const db = require('../../../config/db');
const sequelize = db.sequelize;
const Movie = db.movies;
const Rate = db.rates;
const Episode = db.episode;
const ContinueWatching = db.continue_watching;

const config = require('config');
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, join, order;

const continueWatching = async (page, limit, context) => {
    conditions = {
        member_profile_id: context.memberProfileId
    };
    select = [
        [sequelize.col('continue_watching.episode_id'), 'episode_id'] ,
        [sequelize.col('continue_watching.current_time'), 'current_time'] ,
        [sequelize.col('movie.uuid'), 'movie_uuid'] ,
        [sequelize.col('movie.type'), 'movie_type'] ,
        [sequelize.col(`movie.name${context.lang}`), 'movie_name'] ,
        [sequelize.col('movie.poster_vertical'), 'poster_v'] ,
        [sequelize.col('movie.poster_horizontal'), 'poster_h'] ,
        [sequelize.col(`movie.title${context.lang}`), 'title'] ,
        [sequelize.col(`movie.description${context.lang}`), 'description'] ,
        [sequelize.col('movie.release_date'), 'release_date'] ,
        [sequelize.col('movie.link'), 'link'] ,
        [sequelize.col('movie.runtime'), 'runtime'] ,
        [sequelize.col('movie->rate.code'), 'rate_code']
    ];
    join = [
        { model: Movie, where: { status_delete: 0, is_comingsoon: 0 }, attributes: [], required: true, include: [{ model: Rate, attributes: [], required: true }] }
    ];
    order = [
        ['id', 'DESC']
    ];
    const continueWatching = await query.findAllLimitByConditions(conditions, ContinueWatching, select, join, order, page, limit);
    let itemsContinueWatching = [];
    if ( continueWatching.length > 0 ) {
        for ( const item of continueWatching ) {
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
            if ( item.movie_type == 1 ) {
                conditions = {
                    status_delete: 0 ,
                    id: item.episode_id
                };
                select = [
                    [sequelize.col('episode.uuid'), 'uuid'] ,
                    [sequelize.col(`episode.name${context.lang}`), 'name'] ,
                    [sequelize.col(`description${context.lang}`), 'description'] ,
                    [sequelize.col('episode.link'), 'link'] ,
                    [sequelize.col('episode.runtime'), 'runtime']
                ];
                const episode = await query.findOneByConditions(conditions, Episode, select);
                const progressBar = (item.current_time / (episode.runtime * 60000)) * 100;
                if (episode) {
                    let tmp = {
                        movie_type: item.movie_type ,
                        movie_uuid: "" ,
                        movie_name: "" ,
                        episode_uuid: episode.uuid ,
                        episode_name: episode.name ,
                        poster_v: posterV ,
                        poster_h: posterH ,
                        title: item.title ,
                        description: episode.description ,
                        match: 0 ,
                        year: item.release_date.substring(0, (item.release_date.length - 6)) ,
                        user_rate: -1 ,
                        rate_code: item.rate_code ,
                        is_favorite: false ,
                        link: episode.link ,
                        runtime: episode.runtime * 60000 ,
                        current_time: item.current_time ,
                        progress_bar: progressBar.toFixed(2)
                    };
                    itemsContinueWatching.push(tmp);
                }
            } else {
                const progressBar = (item.current_time / (item.runtime * 60000)) * 100;
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
                    match: 0 ,
                    year: item.release_date.substring(0, (item.release_date.length - 6)) ,
                    user_rate: -1 ,
                    rate_code: item.rate_code ,
                    is_favorite: false ,
                    link: item.link ,
                    runtime: item.runtime * 60000 ,
                    current_time: item.current_time ,
                    progress_bar: progressBar.toFixed(2)
                };
                itemsContinueWatching.push(tmp);
            }
        }
    }

    return {
        status: {
            code: 1 ,
            message: "Success"
        } ,
        result: {
            items: itemsContinueWatching
        }
    };
};

module.exports = continueWatching;