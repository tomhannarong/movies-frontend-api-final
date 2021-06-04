const db = require('../../../config/db');
const sequelize = db.sequelize;
const Download = db.download;
const Movie = db.movies;
const Season = db.season;
const Episode = db.episode;

const config = require('config');
const baseUrl = config.baseUrl;
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, join, order, group;

const download = async (seasonUuid, context) => {
    let section = [];

    let download = [];
    conditions = {
        member_profile_id: context.memberProfileId
    };

    if (!seasonUuid) {
        select = [
            [sequelize.col('download.uuid'), 'download_uuid'],
            [sequelize.col('download.complete'), 'complete'],
            [sequelize.col('movie.uuid'), 'movie_uuid'],
            [sequelize.col('movie.type'), 'movie_type'],
            [sequelize.col(`movie.name${context.lang}`), 'movie_name'],
            [sequelize.col('movie.poster_horizontal'), 'poster_h'],
            [sequelize.col('movie.link'), 'link'],
            [sequelize.col('movie.runtime'), 'runtime'],
            [sequelize.col('season.uuid'), 'season_uuid'],
            [sequelize.col('season.season_no'), 'season_no']
        ];
        join = [
            { model: Movie, where: { status_delete: 0, is_comingsoon: 0 }, attributes: [], required: true } ,
            { model: Season, where: { status_delete: 0 }, attributes: [], required: false }
        ];
        order = [
            ['id', 'DESC']
        ];
        group = ['movie.id', 'season.id'];
        download = await query.findAllByConditions(conditions, Download, select, join, order, group);
    } else {
        select = [
            [sequelize.col('download.uuid'), 'download_uuid'],
            [sequelize.col('download.complete'), 'complete'],
            [sequelize.col('movie.type'), 'movie_type'],
            [sequelize.col(`movie.name${context.lang}`), 'movie_name'],
            [sequelize.col('season.uuid'), 'season_uuid'],
            [sequelize.col('season.season_no'), 'season_no'],
            [sequelize.col('season.poster_horizontal'), 'poster_h'],
            [sequelize.col('episode.uuid'), 'episode_uuid'],
            [sequelize.col(`episode.name${context.lang}`), 'episode_name'],
            [sequelize.col('episode.link'), 'link'],
            [sequelize.col('episode.runtime'), 'runtime']
        ];
        join = [
            { model: Movie, where: { status_delete: 0, is_comingsoon: 0 }, attributes: [], required: true } ,
            { model: Season, where: { uuid: seasonUuid, status_delete: 0 }, attributes: [], required: true } ,
            { model: Episode, attributes: [], required: true }
        ];
        download = await query.findAllByConditions(conditions, Download, select, join);
    }

    let groupName = "";
    let itemsDownload = [];
    if (download.length > 0) {
        for (const item of download) {
            const hours = Math.floor(item.runtime / 60);
            const minutes = item.runtime % 60;
            let posterH = `${imageUrl}/img/no-poster-h.jpg`;
            if (item.poster_h) {
                posterH = item.poster_h.split('/');
                posterH = `${imageUrl}/${posterH[0]}/sm/${posterH[1]}/${posterH[2]}`;
            }

            let tmp = {
                download_uuid: item.download_uuid ,
                movie_type: item.movie_type ,
                season_uuid: item.season_uuid ? item.season_uuid : "" ,
                season_no: item.season_no ? item.season_no : 0 ,
                poster_h: posterH,
                link: item.link ? item.link : "",
                hours: `${hours}.${minutes}`,
                complete: item.complete
            };
            if (!seasonUuid) {
                tmp.movie_uuid = item.movie_uuid;
                tmp.movie_name = item.movie_name;
            } else {
                groupName = `${item.movie_name} ${item.season_no}`;
                tmp.episode_uuid = item.episode_uuid;
                tmp.episode_name = item.episode_name;
            }

            itemsDownload.push(tmp);
        }
    }

    if (!seasonUuid) {
        const sectionDownload = {
            group_type: 4,
            group_name: "Download",
            section: 11,
            loadmore: `${baseUrl}/loadmore?query=query{loadmoreItems(input:{section:$section,page:$page,limit:$limit}){status{code message}result{items{download_uuid movie_type movie_uuid movie_name season_uuid season_no poster_h link hours complete}}}}`,
            items: itemsDownload
        };
        section.push(sectionDownload);
    } else {
        const sectionDownload = {
            group_type: 4,
            group_name: `Download ${groupName}`,
            section: 12,
            loadmore: `${baseUrl}/loadmore?query=query{loadmoreItems(input:{section:$section,movie_uuid:"$movieUuid",page:$page,limit:$limit}){status{code message}result{items{download_uuid movie_type season_uuid season_no episode_uuid episode_name poster_h link hours complete}}}}`,
            items: itemsDownload
        };
        section.push(sectionDownload);
    }

    return {
        status: {
            code: 1,
            message: "Success"
        },
        result: section
    };
};

module.exports = download;