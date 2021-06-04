const sectionContinueWatching = require('./sectionContinueWatching');
const sectionTopViews = require('./sectionTopViews');
const sectionSeries = require('./sectionSeries');
const sectionSuggest = require('./sectionSuggest');
const sectionListEpisode = require('./sectionListEpisode');
const sectionSearch = require('./sectionSearch');
const sectionDownload = require('./sectionDownload');
const sectionDownloadListEpisode = require('./sectionDownloadListEpisode');
const sectionFavorite = require('./sectionFavorite');
const sectionMoreLikeThis = require('./sectionMoreLikeThis');
const sectionComingSoon = require('./sectionComingSoon');


const resolvers = {
    Query: {
        loadmoreItems: async (_, { input }, { context }) => {
            let page = 2;
            let limit = 10;
            if ( input.page ) page = input.page;
            if ( input.limit ) limit = input.limit;

            const section = input.section;
            const movieType = input.movie_type;
            const movieUuid = input.movie_uuid;
            const seasonUuid = input.season_uuid;
            const categoryId = input.category_id;
            const keyword = input.keyword;

            try {
                if ( context.status.code != 1 ) {
                    return {
                        status: {
                            code: context.status.code,
                            message: context.status.message
                        },
                        result: {}
                    };
                }

                switch ( section ) {
                    case 2: return sectionContinueWatching(page, limit, context);
                    case 3: return sectionTopViews(categoryId, page, limit, context);
                    case 4: return sectionSeries(categoryId, page, limit, context);
                    case 6: return sectionSuggest(movieUuid, page, limit, context);
                    case 8: return sectionListEpisode(seasonUuid, page, limit, context);
                    case 9: return sectionSearch(keyword, page, limit, context);
                    case 11: return sectionDownload(page, limit, context);
                    case 12: return sectionDownloadListEpisode(seasonUuid, page, limit, context);
                    case 13: return sectionFavorite(page, limit, context);
                    case 14: return sectionMoreLikeThis(movieType, movieUuid, page, limit, context);
                    case 15: return sectionComingSoon(page, limit, context);
                    default: return {
                        status: {
                            code: 2 ,
                            message: "Page not found!"
                        } ,
                        result: {}
                    };
                }
            } catch (error) {
                return {
                    status: {
                        code: 4 ,
                        message: "Server error"
                    } ,
                    result: []
                };
            }
        }
    }
};

module.exports = resolvers;