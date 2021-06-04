const db = require('../../../config/db');
const sequelize = db.sequelize;
const Movie = db.movies;
const Season = db.season;
const Episode = db.episode;
const Rate = db.rates;
const Category = db.categories;
const MovieCategory = db.movie_categories;
const Favorite = db.favorites;
const Download = db.download;
const Review = db.reviews;

const config = require('config');
const baseUrl = config.baseUrl;
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, join, order;

const preview = async (movieType, movieUuid, seasonUuid, context) => {
    let section = [];

    conditions = {
        status_delete: 0,
        is_comingsoon: 0,
        uuid: movieUuid
    };
    if (movieType == 0) {
        // Start Section Header
        select = [
            [sequelize.col('movies.id'), 'id'],
            [sequelize.col('movies.uuid'), 'movie_uuid'],
            [sequelize.col('movies.type'), 'movie_type'],
            [sequelize.col(`movies.name${context.lang}`), 'movie_name'],
            [sequelize.col('movies.poster_vertical'), 'poster_v'],
            [sequelize.col('movies.poster_horizontal'), 'poster_h'],
            [sequelize.col(`movies.title${context.lang}`), 'title'],
            [sequelize.col(`movies.description${context.lang}`), 'description'],
            [sequelize.col('movies.release_date'), 'release_date'],
            [sequelize.col('movies.link'), 'link'],
            [sequelize.col('movies.runtime'), 'runtime'],
            [sequelize.col('rate.code'), 'rate_code']
        ];
        join = [
            { model: Rate, attributes: [], require: true }
        ];
        const movie = await query.findOneByConditions(conditions, Movie, select, join);
        if (!movie) {
            return {
                status: {
                    code: 2,
                    message: "Not found in database"
                },
                result: []
            };
        }
        let posterV = `${imageUrl}/img/no-poster-v.jpg`;
        let posterH = `${imageUrl}/img/no-poster-h.jpg`;
        if (movie.poster_v) {
            posterV = movie.poster_v.split('/');
            posterV = `${imageUrl}/${posterV[0]}/md/${posterV[1]}/${posterV[2]}`;
        }
        if (movie.poster_h) {
            posterH = movie.poster_h.split('/');
            posterH = `${imageUrl}/${posterH[0]}/lg/${posterH[1]}/${posterH[2]}`;
        }
        conditions = {
            movie_id: movie.id,
            member_profile_id: context.memberProfileId
        };
        const isFavorite = await query.countDataRows(conditions, Favorite);
        const isDownload = await query.countDataRows(conditions, Download);
        conditions = {
            movie_id: movie.id
        };
        select = [
            [sequelize.col('category.id'), 'category_id'],
            [sequelize.col(`category.name${context.lang}`), 'category_name'],
        ];
        join = [
            { model: Category, attributes: [], require: true }
        ]
        const categories = await query.findAllByConditions(conditions, MovieCategory, select, join);
        conditions = {
            movie_id: movie.id,
            member_profile_id: context.memberProfileId
        };
        select = ['rating'];
        const userRate = await query.findOneByConditions(conditions, Review, select);
        conditions = {
            movie_id: movie.id,
            rating: 1
        };
        const rate = await query.countDataRows(conditions, Review);
        conditions = {
            movie_id: movie.id,
            rating: 0
        };
        const disRate = await query.countDataRows(conditions, Review);
        const sumMatch = rate + disRate;
        const match = Math.ceil((rate / sumMatch) * 100);
        const sectionHeader = {
            group_type: 1,
            group_name: "Header",
            section: 5,
            loadmore: "",
            items: [{
                movie_uuid: movie.movie_uuid,
                movie_type: movie.movie_type,
                movie_name: movie.movie_name,
                title: movie.title,
                description: movie.description,
                poster_v: posterV,
                poster_h: posterH,
                match: match ? match : 0,
                year: movie.release_date.substring(0, (movie.release_date.length - 6)),
                rate_code: movie.rate_code,
                user_rate: userRate ? userRate.rating : -1,
                is_favorite: isFavorite,
                is_download: isDownload,
                link: movie.link,
                categories: categories
            }]
        };
        section.push(sectionHeader);
        // End Section Header

        // Start Section Movie Suggest
        conditions = {
            category_id: categories[0].category_id
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
            { model: Movie, where: { type: 0, is_comingsoon: 0 }, attributes: [], require: true }
        ];
        const suggest = await query.findAllLimitByConditions(conditions, MovieCategory, select, join);
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
                    link: item.link,
                    categories: []
                };
                itemsSuggest.push(tmp);
            }
        }
        const sectionSuggest = {
            group_type: 3,
            group_name: "Suggest",
            section: 6,
            loadmore: `${baseUrl}/loadmore?query=query{loadmoreItems(input:{section:$section,movie_uuid:"$movieUuid",page:$page,limit:$limit}){status{code message}result{items{movie_type movie_uuid movie_name title description poster_v match year rate_code user_rate is_favorite is_download link categories{category_id category_name}}}}}`,
            items: itemsSuggest
        };
        section.push(sectionSuggest);
        // End Section Movie Suggest
    } else {
        // Start Section Series Header
        select = [
            [sequelize.col('season->movie.id'), 'movie_id'],
            [sequelize.col('season->movie.uuid'), 'movie_uuid'],
            [sequelize.col(`season->movie.name${context.lang}`), 'movie_name'],
            [sequelize.col('season->movie.trailer'), 'trailer'],
            [sequelize.col('season->movie.runtime'), 'runtime'],
            [sequelize.col('season->movie.release_date'), 'release_date'],
            [sequelize.col('season->movie.rate_id'), 'rate_id'],
            [sequelize.col('season.id'), 'season_id'],
            [sequelize.col('season.uuid'), 'season_uuid'],
            [sequelize.col('season.season_no'), 'season_no'],
            [sequelize.col('season.poster_vertical'), 'poster_v'],
            [sequelize.col('season.poster_horizontal'), 'poster_h'],
            [sequelize.col(`season.title${context.lang}`), 'title'],
            [sequelize.col(`season.description${context.lang}`), 'description'],
            [sequelize.col('episode.link'), 'link']
        ];
        let conditionsSeason = {
            status_delete: 0
        };
        if ( seasonUuid ) conditionsSeason.uuid = seasonUuid;
        join = [
            { model: Season, where: conditionsSeason, attributes: [], required: true, include: [{ model: Movie, where: conditions, attributes: [], require: true }] }
        ];
        order = [
            ['ep', 'ASC']
        ];
        const series = await query.findOneByConditions({}, Episode, select, join, order);
        if (!series) {
            return {
                status: {
                    code: 2,
                    message: "Not found in database"
                },
                result: []
            };
        }

        let posterV = `${imageUrl}/img/no-poster-v.jpg`;
        let posterH = `${imageUrl}/img/no-poster-h.jpg`;
        if (series.poster_v) {
            posterV = series.poster_v.split('/');
            posterV = `${imageUrl}/${posterV[0]}/md/${posterV[1]}/${posterV[2]}`;
        }
        if (series.poster_h) {
            posterH = series.poster_h.split('/');
            posterH = `${imageUrl}/${posterH[0]}/md/${posterH[1]}/${posterH[2]}`;
        }
        conditions = {
            id: series.rate_id
        };
        select = ['code'];
        const rateMovie = await query.findOneByConditions(conditions, Rate, select);
        conditions = {
            movie_id: series.movie_id,
            member_profile_id: context.memberProfileId
        };
        const isFavorite = await query.countDataRows(conditions, Favorite);
        conditions = {
            movie_id: series.movie_id
        };
        select = [
            [sequelize.col('category.id'), 'category_id'],
            [sequelize.col(`category.name${context.lang}`), 'category_name']
        ];
        join = [
            { model: Category, attributes: [], require: true }
        ];
        const categories = await query.findAllByConditions(conditions, MovieCategory, select, join);
        select = [
            [sequelize.col('season.uuid'), 'season_uuid'],
            [sequelize.col('season.season_no'), 'season_no']
        ];
        const season = await query.findAllByConditions(conditions, Season, select);
        conditions = {
            movie_id: series.movie_id,
            member_profile_id: context.memberProfileId
        };
        select = ['rating'];
        const userRate = await query.findOneByConditions(conditions, Review, select);
        conditions = {
            movie_id: series.movie_id,
            rating: 1
        };
        const rate = await query.countDataRows(conditions, Review);
        conditions = {
            movie_id: series.movie_id,
            rating: 0
        };
        const disRate = await query.countDataRows(conditions, Review);
        const sumMatch = rate + disRate;
        const match = Math.ceil((rate / sumMatch) * 100);
        const sectionHeader = {
            group_type: 1,
            group_name: "Header",
            section: 7,
            loadmore: "",
            season: season,
            season_no: series.season_no,
            items: [{
                movie_type: 1,
                movie_uuid: series.movie_uuid,
                movie_name: series.movie_name,
                season_uuid: series.season_uuid,
                episode_uuid: "",
                episode_name: "",
                title: series.title,
                description: series.description,
                poster_v: posterV,
                poster_h: posterH,
                match: match ? match : 0,
                year: series.release_date.substring(0, (series.release_date.length - 6)),
                rate_code: rateMovie.code,
                season_no: series.season_no,
                user_rate: userRate ? userRate.rating : -1,
                is_favorite: isFavorite,
                is_download: false,
                trailer: series.trailer,
                link: series.link,
                hours: 0,
                categories: categories
            }]
        };
        section.push(sectionHeader);
        // End Section Series Header

        // Start Section Episode Series
        conditions = {
            status_delete: 0,
            season_id: series.season_id
        };
        select = [
            [sequelize.col('episode.id'), 'episode_id'],
            [sequelize.col('episode.uuid'), 'episode_uuid'],
            [sequelize.col(`episode.name${context.lang}`), 'episode_name'],
            [sequelize.col(`episode.description${context.lang}`), 'description'],
            [sequelize.col('episode.release_date'), 'release_date'],
            [sequelize.col('episode.link'), 'link'],
            [sequelize.col('episode.runtime'), 'runtime']
        ];
        const listEpisode = await query.findAllLimitByConditions(conditions, Episode, select);
        let itemsListEpisode = [];
        if (listEpisode.length > 0) {
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
                    movie_uuid: series.movie_uuid,
                    movie_name: series.movie_name,
                    season_uuid: series.season_uuid,
                    episode_uuid: item.episode_uuid,
                    episode_name: item.episode_name,
                    title: "",
                    description: item.description,
                    poster_v: posterV,
                    poster_h: posterH,
                    match: 0,
                    year: item.release_date.substring(0, (item.release_date.length - 6)),
                    rate_code: rateMovie.code,
                    season_no: series.season_no,
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
        const sectionListEpisode = {
            group_type: 4,
            group_name: "List Episode",
            section: 8,
            loadmore: `${baseUrl}/loadmore?query=query{loadmoreItems(input:{section:$section,movie_uuid:"$movieUuid",page:$page,limit:$limit}){status{code message}result{items{movie_type movie_uuid movie_name season_uuid episode_uuid episode_name title description poster_v poster_h match year rate_code season_no user_rate is_favorite is_download trailer link hours categories{category_id category_name}}}}}`,
            season: [],
            season_no: series.season_no,
            items: itemsListEpisode
        };
        section.push(sectionListEpisode);
        // End Section Episode Series
    }

    return {
        status: {
            code: 1,
            message: "Success"
        },
        result: section
    };
};

module.exports = preview;