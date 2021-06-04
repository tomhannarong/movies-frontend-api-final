const db = require('../../../config/db');
const sequelize = db.sequelize;
const Movie = db.movies;
const Season = db.season;
const Episode = db.episode;
const Review = db.reviews;
const Favorite = db.favorites;
const ContinueWatching = db.continue_watching;
const Download = db.download;
const MemberProfile = db.member_profiles;

const generatePassword = require('password-generator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const config = require('config');
const baseUrl = config.baseUrl;
const rootPath = config.rootPath;

const query = require('../../helper/query');
const functions = require('../../helper/functions');

let conditions, select, join, data;

const resolvers = {
    Query: {
        
    } ,
    Mutation: {
        ratingMovie: async (_, { input }, { context } ) => {
            try {
                if ( context.status.code != 1 ) {
                    return {
                        status: {
                            code: context.status.code ,
                            message: context.status.message
                        } ,
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0 ,
                    uuid: input.uuid
                };
                select = ['id'];
                const movie = await query.findOneByConditions(conditions, Movie, select);
                if ( !movie ) {
                    return {
                        status: {
                            code: 2 ,
                            message: "Not found in database"
                        } ,
                        result: {}
                    };
                }

                conditions = {
                    movie_id: movie.id ,
                    member_profile_id: context.memberProfileId
                };
                const review = await query.countDataRows(conditions, Review);
                if ( review > 0 ) {
                    if ( input.rating == -1 ) {
                        await Review.destroy({ where: conditions });
                    } else {
                        data = {
                            rating: input.rating ,
                            updated_at: functions.dateTimeNow()
                        };
                        await Review.update(data, { where: conditions });
                    }
                } else {
                    data = {
                        movie_id: movie.id ,
                        member_profile_id: context.memberProfileId ,
                        rating: input.rating
                    };
                    await Review.create(data);
                }

                conditions = {
                    movie_id: movie.id ,
                    rating: 1
                };
                const rate = await query.countDataRows(conditions, Review);

                conditions = {
                    movie_id: movie.id ,
                    rating: 0
                };
                const disRate = await query.countDataRows(conditions, Review);

                const sumMatch = rate + disRate;
                const match = Math.ceil((rate/sumMatch) * 100);

                return {
                    status: {
                        code: 1 ,
                        message: "Success"
                    } ,
                    result: {
                        match: match ? match : 0
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 4 ,
                        message: "Server error"
                    } ,
                    result: {}
                };
            }
        } ,
        favoriteMovie: async (_, { input }, { context }) => {
            try {
                if ( context.status.code != 1 ) {
                    return {
                        status: {
                            code: context.status.code ,
                            message: context.status.message
                        }
                    };
                }

                conditions = {
                    status_delete: 0 ,
                    uuid: input.uuid
                };
                select = ['id'];
                const movie = await query.findOneByConditions(conditions, Movie, select);
                if ( !movie ) {
                    return {
                        status: {
                            code: 2 ,
                            message: "Not found in database"
                        } ,
                        result: {}
                    };
                }

                conditions = {
                    movie_id: movie.id ,
                    member_profile_id: context.memberProfileId
                };
                const checkFavorite = await query.countDataRows(conditions, Favorite);
                if ( checkFavorite > 0 ) {
                    await Favorite.destroy({ where: conditions });
                } else {
                    data = {
                        movie_id: movie.id ,
                        member_profile_id: context.memberProfileId
                    };
                    await Favorite.create(data);
                }

                return {
                    status: {
                        code: 1 ,
                        message: "Success"
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 4 ,
                        message: "Server error"
                    }
                };
            }
        } ,
        historyMovie: async (_, { input }, { context }) => {
            try {
                if ( context.status.code != 1 ) {
                    return {
                        status: {
                            code: context.status.code ,
                            message: context.status.message
                        }
                    };
                }

                conditions = {
                    status_delete: 0 ,
                    uuid: input.uuid
                };
                if ( input.movie_type == 0 ) {
                    select = ['id', 'views'];
                    const movie = await query.findOneByConditions(conditions, Movie, select);
                    if ( !movie ) {
                        return {
                            status: {
                                code: 2 ,
                                message: "Not found in database"
                            }
                        };
                    }

                    conditions = {
                        movie_id: movie.id ,
                        member_profile_id: context.memberProfileId
                    };
                    const checkContinueWatching = await query.countDataRows(conditions, ContinueWatching);
                    if ( checkContinueWatching > 0 ) {
                        data = {
                            current_time: input.current_time ,
                            updated_at: functions.dateTimeNow()
                        };
                        await ContinueWatching.update(data, { where: conditions });
                    } else {
                        data = {
                            movie_id: movie.id ,
                            member_profile_id: context.memberProfileId ,
                            current_time: input.current_time ,
                            updated_at: functions.dateTimeNow()
                        };
                        await ContinueWatching.create(data);
                    }

                    data = {
                        views: movie.views + 1
                    };
                    await Movie.update(data, { where: { id: movie.id } });
                } else {
                    select = ['id', 'season_id', 'views'];
                    const episode = await query.findOneByConditions(conditions, Episode, select);

                    conditions = {
                        id: episode.season_id
                    };
                    select = [
                        [sequelize.col('movie.id'), 'movie_id'] ,
                        [sequelize.col('movie.views'), 'movie_views'] ,
                        [sequelize.col('season.id'), 'season_id'] ,
                        [sequelize.col('season.views'), 'season_views']
                    ];
                    join = [
                        { model: Movie, attributes: [], required: true }
                    ];
                    const season = await query.findOneByConditions(conditions, Season, select, join);
                    if ( !episode && !season ) {
                        return {
                            status: {
                                code: 2 ,
                                message: "Not found in database"
                            }
                        };
                    }

                    conditions = {
                        movie_id: season.movie_id ,
                        member_profile_id: context.memberProfileId
                    };
                    const checkContinueWatching = await query.countDataRows(conditions, ContinueWatching);
                    if ( checkContinueWatching > 0 ) {
                        data = {
                            episode_id: episode.id ,
                            current_time: input.current_time ,
                            updated_at: functions.dateTimeNow()
                        };
                        await ContinueWatching.update(data, { where: conditions });
                    } else {
                        data = {
                            movie_id: season.movie_id ,
                            episode_id: episode.id ,
                            member_profile_id: context.memberProfileId ,
                            current_time: input.current_time ,
                            updated_at: functions.dateTimeNow()
                        };
                        await ContinueWatching.create(data);
                    }

                    data = {
                        views: episode.views + 1
                    };
                    await Episode.update(data, { where: { id: episode.id } });
                    
                    data = {
                        views: season.season_views + 1
                    };
                    await Season.update(data, { where: { id: season.season_id } });

                    data = {
                        views: season.movie_views + 1
                    };
                    await Movie.update(data, { where: { id: season.movie_id } });
                }

                return {
                    status: {
                        code: 1 ,
                        message: "Success"
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 4 ,
                        message: "Server error"
                    }
                };
            }
        } ,
        downloadMovie: async (_, { input }, { context }) => {
            try {
                if ( context.status.code != 1 ) {
                    return {
                        status: {
                            code: context.status.code ,
                            message: context.status.message
                        }
                    };
                }

                conditions = {
                    status_delete: 0 ,
                    uuid: input.uuid
                };
                select = ['id'];
                const downloadUuid = uuidv4();
                if ( input.movie_type == 0 ) {
                    const movie = await query.findOneByConditions(conditions, Movie, select);
                    if ( !movie ) {
                        return {
                            status: {
                                code: 2 ,
                                message: "Not found in database"
                            } ,
                            result: {}
                        };
                    }

                    conditions = {
                        movie_id: movie.id ,
                        member_profile_id: context.memberProfileId
                    };
                    const checkDownload = await query.countDataRows(conditions, Download);
                    if ( checkDownload > 0 ) {
                        await Download.destroy({ where: conditions });
                    } else {
                        data = {
                            uuid: downloadUuid ,
                            movie_id: movie.id ,
                            member_profile_id: context.memberProfileId
                        };
                        await Download.create(data);
                    }
                } else {
                    select = ['id', 'season_id'];
                    const series = await query.findOneByConditions(conditions, Episode, select);
                    
                    conditions = {
                        id: series.season_id
                    };
                    select = ['movie_id'];
                    const season = await query.findOneByConditions(conditions, Season, select);
                    if ( !series && !season ) {
                        return {
                            status: {
                                code: 2 ,
                                message: "Not found in database"
                            }
                        };
                    }

                    conditions = {
                        episode_id: series.id ,
                        member_profile_id: context.memberProfileId
                    };
                    const checkDownload = await query.countDataRows(conditions, Download);
                    if ( checkDownload > 0 ) {
                        await Download.destroy({ where: conditions });
                    } else {
                        data = {
                            uuid: downloadUuid ,
                            movie_id: season.movie_id ,
                            season_id: series.season_id ,
                            episode_id: series.id ,
                            member_profile_id: context.memberProfileId
                        };
                        await Download.create(data);
                    }
                }

                return {
                    status: {
                        code: 1 ,
                        message: "Success"
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 4 ,
                        message: "Server error"
                    }
                };
            }
        } ,
        manageProfile: async (_, { input }, { context }) => {
            const profileName = input.profile_name;
            const avatar = input.avatar;

            try {
                if ( context.status.code != 1 ) {
                    return {
                        status: {
                            code: context.status.code ,
                            message: context.status.message
                        } ,
                        result: {}
                    };
                }

                const checkBase64 = await functions.checkBase64(avatar);
                if ( avatar && !checkBase64 ) {
                    return {
                        status: {
                            code: 2 ,
                            message: "Wrong format base64!"
                        } ,
                        result: {}
                    };
                }

                conditions = {
                    id: context.memberProfileId
                };
                select = ['uuid', 'name', 'avatar'];
                const memberProfile = await query.findOneByConditions(conditions, MemberProfile, select);
                
                if (memberProfile.name == profileName && !avatar) {
                    return {
                        status: {
                            code: 2 ,
                            message: "No data change!"
                        } ,
                        result: {}
                    };
                }

                let subPath, fileName;
                if ( avatar ) {
                    const matches = avatar.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                    const type = matches[1];
                    const imageBuffer = new Buffer(matches[2], 'base64');
                    subPath = `avatar/${memberProfile.uuid.substr(0, 8)}`;
                    fileName = `${generatePassword(10, false)}.${type}`;
                    if (memberProfile.avatar) fs.unlinkSync(`${rootPath}/${memberProfile.avatar}`);
                    if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                    fs.writeFileSync(`${rootPath}/${subPath}/${fileName}`, imageBuffer);
                }

                data = {
                    name: profileName
                };
                if ( avatar ) data.avatar = `${subPath}/${fileName}`;
                await MemberProfile.update(data, { where: { id: context.memberProfileId } });

                return {
                    status: {
                        code: 1 ,
                        message: "Success"
                    } ,
                    result: {
                        name: profileName ? profileName : memberProfile.name ,
                        avatar: avatar ? `${baseUrl}/${subPath}/${fileName}` : memberProfile.avatar ? `${baseUrl}/${oldUser.avatar}` : `${baseUrl}/img/no-avatar.jpg`
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 4 ,
                        message: "Server error"
                    } ,
                    result: {}
                };
            }
        }
    }
};

module.exports = resolvers;