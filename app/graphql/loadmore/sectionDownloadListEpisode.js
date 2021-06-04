const db = require('../../../config/db');
const sequelize = db.sequelize;
const Download = db.download;
const Movie = db.movies;
const Season = db.season;
const Episode = db.episode;

const config = require('config');
const imageUrl = config.imageUrl;

const query = require('../../helper/query');

let conditions, select, join, order;

const downloadListEpisode = async (seasonUuid, page, limit, context) => {
    conditions = {
        member_profile_id: context.memberProfileId
    };
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
    const download = await query.findAllLimitByConditions(conditions, Download, select, join, [], page, limit);
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
                movie_type: item.movie_type,
                season_uuid: item.season_uuid ? item.season_uuid : "",
                season_no: item.season_no ? item.season_no : 0,
                episode_uuid: item.episode_uuid,
                episode_name: item.episode_name,
                poster_h: posterH,
                link: item.link ? item.link : "",
                hours: `${hours}.${minutes}`,
                complete: item.complete
            };
            itemsDownload.push(tmp);
        }
    }

    return {
        status: {
            code: 1,
            message: "Success"
        },
        result: {
            items: itemsDownload
        }
    };
};

module.exports = downloadListEpisode;