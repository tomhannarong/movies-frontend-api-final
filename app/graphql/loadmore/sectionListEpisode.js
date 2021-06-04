const db = require('../../../config/db');
const sequelize = db.sequelize;
const Movie = db.movies;
const Season = db.season;
const Episode = db.episode;
const Rate = db.rates;
const Category = db.categories;
const MovieCategory = db.movie_categories;
const Download = db.download;

const config = require('config');
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, join;

const listEpisode = async (seasonUuid, page, limit, context) => {
    conditions = {
        status_delete: 0,
        uuid: seasonUuid
    };
    select = [
        [sequelize.col('season.uuid'), 'season_uuid'],
        [sequelize.col('season.movie_id'), 'movie_id'],
        [sequelize.col('season.season_no'), 'season_no'],
        [sequelize.col('season.poster_vertical'), 'poster_v'],
        [sequelize.col('season.poster_horizontal'), 'poster_h'],
        [sequelize.col('episode.id'), 'episode_id'],
        [sequelize.col('episode.uuid'), 'episode_uuid'],
        [sequelize.col(`episode.name${context.lang}`), 'episode_name'],
        [sequelize.col(`episode.description${context.lang}`), 'description'],
        [sequelize.col('episode.release_date'), 'release_date'],
        [sequelize.col('episode.link'), 'link'],
        [sequelize.col('episode.runtime'), 'runtime']
    ];
    join = [
        { model: Episode, where: { status_delete: 0 }, attributes: [], require: true }
    ];
    const listEpisode = await query.findAllLimitByConditions(conditions, Season, select, join, [], page, limit);
    let itemsListEpisode = [];
    if (listEpisode.length > 0) {
        let posterV = `${imageUrl}/img/no-poster-v.jpg`;
        let posterH = `${imageUrl}/img/no-poster-h.jpg`;
        if (listEpisode[0].poster_v) {
            posterV = listEpisode[0].poster_v.split('/');
            posterV = `${imageUrl}/${posterV[0]}/md/${posterV[1]}/${posterV[2]}`;
        }
        if (listEpisode[0].poster_h) {
            posterH = listEpisode[0].poster_h.split('/');
            posterH = `${imageUrl}/${posterH[0]}/md/${posterH[1]}/${posterH[2]}`;
        }

        conditions = {
            status_delete: 0,
            id: listEpisode[0].movie_id
        };
        select = [
            [sequelize.col('movies.id'), 'movie_id'],
            [sequelize.col('movies.uuid'), 'movie_uuid'],
            [sequelize.col(`movies.name${context.lang}`), 'movie_name'],
            [sequelize.col('movies.rate_id'), 'rate_id']
        ];
        const movie = await query.findOneByConditions(conditions, Movie, select);
        conditions = {
            id: movie.rate_id
        };
        select = ['code'];
        const movieRate = await query.findOneByConditions(conditions, Rate, select);

        conditions = {
            movie_id: listEpisode[0].movie_id
        };
        select = [
            [sequelize.col('category.id'), 'category_id'],
            [sequelize.col(`category.name${context.lang}`), 'category_name']
        ];
        join = [
            { model: Category, attributes: [], require: true }
        ];
        const categories = await query.findAllByConditions(conditions, MovieCategory, select, join);
        for (const item of listEpisode) {
            conditions = {
                episode_id: item.episode_id,
                member_profile_id: context.memberProfileId
            };
            const isDownload = await query.countDataRows(conditions, Download);
            const hours = Math.floor(item.runtime / 60);
            const minutes = item.runtime % 60;
            let tmp = {
                movie_type: 1,
                movie_uuid: movie.movie_uuid,
                movie_name: movie.movie_name,
                season_uuid: item.season_uuid,
                episode_uuid: item.episode_uuid,
                episode_name: item.episode_name,
                title: "",
                description: item.description,
                poster_v: posterV,
                poster_h: posterH,
                match: 0,
                year: item.release_date.substring(0, (item.release_date.length - 6)),
                rate_code: movieRate.code,
                season_no: item.season_no,
                user_rate: -1,
                is_favorite: false,
                is_download: isDownload,
                trailer: "",
                link: item.link,
                hours: `${hours}.${minutes}`,
                categories: categories
            };
            itemsListEpisode.push(tmp);
        }
    }

    return {
        status: {
            code: 1,
            message: "List Episode"
        },
        result: {
            items: itemsListEpisode
        }
    };
};

module.exports = listEpisode;