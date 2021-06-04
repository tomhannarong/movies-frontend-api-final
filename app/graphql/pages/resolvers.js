const pageHome = require('./home');
const pagePreview = require('./preview');
const pageSearch = require('./search');
const pageComingSoon = require('./comingSoon');
const pageDownload = require('./download');
const pageFavorite = require('./favorites');
const pageProfile = require('./profile');
const pagePackage = require('./package');
const pageAccount = require('./account');
const pageMoreLikeThis = require('./moreLikeThis');
const pageHelpcenter = require('./helpcenter');

const resolvers = {
    Query: {
        getPages: async (_, { input }, { context }) => {
            const page = input.page;
            const limit = input.limit;
            const movieType = input.movie_type;
            const movieUuid = input.movie_uuid;
            const seasonUuid = input.season_uuid;
            const categoryId = input.category_id;
            const keyword = input.keyword;

            try {
                if (context.status.code != 1) {
                    return {
                        status: {
                            code: context.status.code,
                            message: context.status.message
                        },
                        result: []
                    };
                }

                switch (page) {
                    case 1: return pageHome(categoryId, context);
                    case 2: return pagePreview(movieType, movieUuid, seasonUuid, context);
                    case 3: return pageSearch(keyword, limit, context);
                    case 4: return pageComingSoon(context);
                    case 5: return pageDownload(seasonUuid, context);
                    case 6: return pageFavorite(limit, context);
                    case 7: return pageProfile(context);
                    case 8: return pagePackage(context);
                    case 9: return pageAccount(context);
                    case 10: return pageMoreLikeThis(movieType, movieUuid, context);
                    case 11: return pageHelpcenter(context);

                    default: return {
                        status: {
                            code: 2,
                            message: "Page not found!"
                        },
                        result: []
                    }
                }
            } catch (error) {
                return {
                    status: {
                        code: 4,
                        message: "Server error"
                    },
                    result: []
                }
            }
        }
    }
};

module.exports = resolvers;