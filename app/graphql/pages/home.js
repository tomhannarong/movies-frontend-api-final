const db = require('../../../config/db');
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const Movie = db.movies;
const Category = db.categories;
const MovieCategory = db.movie_categories;
const Episode = db.episode;
const ContinueWatching = db.continue_watching;
const Favorite = db.favorites;
const Review = db.reviews;
const Rate = db.rates;

const config = require('config');
const baseUrl = config.baseUrl;
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, join, order, group;

const home = async (categoryId, context) => {
    let section = [];

    let conditionCategory = {};
    if ( categoryId > 0 ) {
        conditionCategory = {
            category_id: categoryId
        };
    }
    const selectMovie = [
        [sequelize.col('movie.id'), 'movie_id'] ,
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
    const orderMovie = [
        [{ model: Movie }, 'views', 'DESC'] ,
        [{ model: Movie }, 'created_at', 'DESC']
    ];

    // Start Section Header
    conditions = {
        status_delete: 0 ,
        is_comingsoon: 0 ,
        customer_id: context.customerId
    };
    join = [
        { model: Movie, where: conditions, attributes: [], required: true, include: [{ model: Rate, attributes: [], required: true }] }
    ];
    const mostView = await query.findOneByConditions(conditionCategory, MovieCategory, selectMovie, join, orderMovie);
    let posterV = `${imageUrl}/img/no-poster-v.jpg`;
    let posterH = `${imageUrl}/img/no-poster-h.jpg`;
    if ( mostView.poster_v ) {
        posterV = mostView.poster_v.split('/');
        posterV = `${imageUrl}/${posterV[0]}/md/${posterV[1]}/${posterV[2]}`;
    }
    if ( mostView.poster_h ) {
        posterH = mostView.poster_h.split('/');
        posterH = `${imageUrl}/${posterH[0]}/lg/${posterH[1]}/${posterH[2]}`;
    }
    conditions = {
        movie_id: mostView.movie_id ,
        member_profile_id: context.memberProfileId
    };
    const isFavorite = await query.countDataRows(conditions, Favorite);
    conditions = {
        movie_id: mostView.movie_id ,
        member_profile_id: context.memberProfileId
    };
    select = ['rating'];
    const userRate = await query.findOneByConditions(conditions, Review, select);
    conditions = {
        movie_id: mostView.movie_id ,
        rating: 1
    };
    const rate = await query.countDataRows(conditions, Review);
    conditions = {
        movie_id: mostView.movie_id ,
        rating: 0
    };
    conditions = {
        movie_id: mostView.movie_id
    };
    select = [
        [sequelize.col('category.id'), 'category_id'],
        [sequelize.col(`category.name${context.lang}`), 'category_name'],
    ];
    join = [
        { model: Category, attributes: [], require: true }
    ]
    const categories = await query.findAllByConditions(conditions, MovieCategory, select, join);
    const disRate = await query.countDataRows(conditions, Review);
    const sumMatch = rate + disRate;
    const match = Math.ceil((rate / sumMatch) * 100);
    const sectionHeader = {
        group_type: 1 ,
        group_name: context.lang == '_en' ? "Header" : "เฮดเดอร์" ,
        section: 1 ,
        loadmore: "" ,
        items: [{
            movie_type: mostView.movie_type ,
            movie_uuid: mostView.movie_uuid ,
            movie_name: mostView.movie_name ,
            episode_uuid: "" ,
            episode_name: "" ,
            poster_v: posterV ,
            poster_h: posterH ,
            title: mostView.title ,
            description: mostView.description ,
            actors: mostView.actors ,
            match: match ? match : 0 ,
            year: mostView.release_date.substring(0, (mostView.release_date.length - 6)) ,
            rate_code: mostView.rate_code ,
            user_rate: userRate ? userRate.rating : -1 ,
            is_favorite: isFavorite ,
            link: mostView.link ,
            runtime: mostView.runtime * 60000 ,
            current_time: 0 ,
            progress_bar: 0 ,
            categories: categories
        }]
    };
    section.push(sectionHeader);
    // End Section Header

    // Start Section Continue Watching
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
    const continueWatching = await query.findAllLimitByConditions(conditions, ContinueWatching, select, join, order);
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
                if ( episode ) {
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
                        progress_bar: progressBar.toFixed(2) ,
                        categories: []
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
                    progress_bar: progressBar.toFixed(2) ,
                    categories: []
                };
                itemsContinueWatching.push(tmp);
            }
        }
    }
    const sectionContinueWatching = {
        group_type: 2 ,
        group_name: context.lang == '_en' ? "Continue Watching" : "ดูต่อที่ค้างไว้" ,
        section: 2 ,
        loadmore: `${baseUrl}/loadmore?query=query{loadmoreItems(input:{section:$section,page:$page,limit:$limit}){status{code message}result{items{movie_type movie_uuid movie_name episode_uuid episode_name poster_v poster_h title description match year rate_code user_rate is_favorite link runtime current_time progress_bar}}}}` ,
        items: itemsContinueWatching
    };
    section.push(sectionContinueWatching);
    // End Section Continue Watching

    // Start Section Top Views
    conditions = {
        status_delete: 0 ,
        is_comingsoon: 0 ,
        customer_id: context.customerId ,
        [Op.not]: {
            id: mostView.movie_id
        }
    };
    join = [
        { model: Movie, where: conditions, attributes: [], required: true, include: [{ model: Rate, attributes: [], required: true }] }
    ];
    group = ['movie.id'];
    const topViews = await query.findAllLimitByConditions(conditionCategory, MovieCategory, selectMovie, join, orderMovie, 1, 9, group);
    let itemsTopView = [];
    if ( topViews.length > 0 ) {
        for ( const item of topViews ) {
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
                link: item.link ,
                runtime: item.runtime * 60000 ,
                current_time: 0 ,
                progress_bar: 0 ,
                categories: []
            };
            itemsTopView.push(tmp);
        }
    }
    const sectionTopViews = {
        group_type: 3 ,
        group_name: context.lang == '_en' ? "Top Views" : "ยอดวิวสูงสุด" ,
        section: 3 ,
        loadmore: `${baseUrl}/loadmore?query=query{loadmoreItems(input:{section:$section,category_id:$categoryId,page:$page,limit:$limit}){status{code message}result{items{movie_type movie_uuid movie_name episode_uuid episode_name poster_v poster_h title description match year rate_code user_rate is_favorite link runtime current_time progress_bar}}}}` ,
        items: itemsTopView
    };
    section.push(sectionTopViews);
    // End Section Top Views

    // Start Section Series
    conditions = {
        status_delete: 0 ,
        is_comingsoon: 0 ,
        type: 1 ,
        customer_id: context.customerId
    };
    join = [
        { model: Movie, where: conditions, attributes: [], required: true, include: [{ model: Rate, attributes: [], required: true }] }
    ];
    group = ['movie.id'];
    const series = await query.findAllLimitByConditions(conditionCategory, MovieCategory, selectMovie, join, orderMovie, 1, 10, group);
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
                progress_bar: 0 ,
                categories: []
            };
            itemsSeries.push(tmp);
        }
    }
    const sectionSeries = {
        group_type: 3 ,
        group_name: context.lang == '_en' ? "Series" : "ซีรี่ย์" ,
        section: 4 ,
        loadmore: `${baseUrl}/loadmore?query=query{loadmoreItems(input:{section:$section,category_id:$categoryId,page:$page,limit:$limit}){status{code message}result{items{movie_type movie_uuid movie_name episode_uuid episode_name poster_v poster_h title description match year rate_code user_rate is_favorite link runtime current_time progress_bar}}}}` ,
        items: itemsSeries
    };
    section.push(sectionSeries);
    // End Section Series

    return {
        status: {
            code: 1 ,
            message: context.lang == '_en' ? "Success" : "สำเร็จ"
        } ,
        result: section
    };
};

module.exports = home;