const Sequelize = require('sequelize');
const dbconfig = require('./env');
const sequelize = new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password, {
    host: dbconfig.host,
    dialect: dbconfig.dialect,
    operatorsAliases: 0,
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci'
    },
    pool: {
        max: dbconfig.max,
        min: dbconfig.pool.min,
        acquire: dbconfig.pool.acquire,
        idle: dbconfig.pool.idle
    }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// import model
db.amphures = require('../app/models/amphures')(sequelize, Sequelize);
db.categories = require('../app/models/categories')(sequelize, Sequelize);
db.continue_watching = require('../app/models/continue_watching')(sequelize, Sequelize);
db.customers = require('../app/models/customers')(sequelize, Sequelize);
db.download = require('../app/models/download')(sequelize, Sequelize);
db.episode = require('../app/models/episode')(sequelize, Sequelize);
db.favorites = require('../app/models/favorites')(sequelize, Sequelize);
db.help_lists = require('../app/models/help_lists')(sequelize, Sequelize);
db.help_topics = require('../app/models/help_topics')(sequelize, Sequelize);
db.histories = require('../app/models/histories')(sequelize, Sequelize);
db.impose_menus = require('../app/models/impose_menus')(sequelize, Sequelize);
db.manage_categories = require('../app/models/manage_categories')(sequelize, Sequelize);
db.member = require('../app/models/member')(sequelize, Sequelize);
db.member_profiles = require('../app/models/member_profiles')(sequelize, Sequelize);
db.movies = require('../app/models/movies')(sequelize, Sequelize);
db.movie_categories = require('../app/models/movie_categories')(sequelize, Sequelize);
db.movie_packages = require('../app/models/movie_packages')(sequelize, Sequelize);
db.packages = require('../app/models/packages')(sequelize, Sequelize);
db.permissions = require('../app/models/permissions')(sequelize, Sequelize);
db.provinces = require('../app/models/provinces')(sequelize, Sequelize);
db.rates = require('../app/models/rates')(sequelize, Sequelize);
db.reviews = require('../app/models/reviews')(sequelize, Sequelize);
db.roles = require('../app/models/roles')(sequelize, Sequelize);
db.season = require('../app/models/season')(sequelize, Sequelize);
db.status_members = require('../app/models/status_members')(sequelize, Sequelize);
db.users = require('../app/models/users')(sequelize, Sequelize);
db.oath_user_clients = require('../app/models/oath_user_clients')(sequelize, Sequelize);
db.oath_member_clients = require('../app/models/oath_member_clients')(sequelize, Sequelize);
db.oath_profile_clients = require('../app/models/oath_profile_clients')(sequelize, Sequelize);
db.user_refresh_tokens = require('../app/models/user_refresh_tokens')(sequelize, Sequelize);
db.member_refresh_tokens = require('../app/models/member_refresh_tokens')(sequelize, Sequelize);
db.profile_refresh_tokens = require('../app/models/profile_refresh_tokens')(sequelize, Sequelize);
db.interested_categories = require('../app/models/interested_categories')(sequelize, Sequelize);

// association amphures
db.amphures.hasMany(db.customers, { foreignKey: 'amphure_id' });
db.customers.belongsTo(db.amphures, { foreignKey: 'amphure_id' });

// association categories
db.categories.hasOne(db.manage_categories, { foreignKey: 'category_id' });
db.manage_categories.belongsTo(db.categories, { foreignKey: 'category_id' });

db.categories.hasOne(db.movie_categories, { foreignKey: 'category_id' });
db.movie_categories.belongsTo(db.categories, { foreignKey: 'category_id' });


// association continue watching
db.continue_watching.hasMany(db.member, { foreignKey: 'member_id' });
db.member.belongsTo(db.continue_watching, { foreignKey: 'member_id' });

db.continue_watching.hasMany(db.episode, { foreignKey: 'episode_id' });
db.episode.belongsTo(db.continue_watching, { foreignKey: 'episode_id' });

db.continue_watching.hasMany(db.member_profiles, { foreignKey: 'member_profile_id' });
db.member_profiles.belongsTo(db.continue_watching, { foreignKey: 'member_profile_id' });

// association customer
db.customers.hasOne(db.manage_categories, { foreignKey: 'customer_id' });
db.manage_categories.belongsTo(db.customers, { foreignKey: 'customer_id' });

db.customers.hasOne(db.users, { foreignKey: 'customer_id' });
db.users.belongsTo(db.customers, { foreignKey: 'customer_id' });

db.customers.hasOne(db.movies, { foreignKey: 'customer_id' });
db.movies.belongsTo(db.customers, { foreignKey: 'customer_id' });

db.customers.hasOne(db.member, { foreignKey: 'customer_id' });
db.member.belongsTo(db.customers, { foreignKey: 'customer_id' });

db.customers.hasOne(db.packages, { foreignKey: 'customer_id' });
db.packages.belongsTo(db.customers, { foreignKey: 'customer_id' });

// association episode
db.episode.hasOne(db.season, { foreignKey: 'season_id' });
db.season.belongsTo(db.episode, { foreignKey: 'season_id' });

db.episode.hasOne(db.download, { foreignKey: 'episode_id' });
db.download.belongsTo(db.episode, { foreignKey: 'episode_id' });

// association favorites
db.favorites.hasOne(db.member_profiles, { foreignKey: 'member_profile_id' });
db.member_profiles.belongsTo(db.favorites, { foreignKey: 'member_profile_id' });

// association histories
db.histories.hasOne(db.member_profiles, { foreignKey: 'member_profile_id' });
db.member_profiles.belongsTo(db.histories, { foreignKey: 'member_profile_id' });

// association impose_menus
db.impose_menus.hasMany(db.permissions, { foreignKey: 'impose_menu_id' });
db.permissions.belongsTo(db.impose_menus, { foreignKey: 'impose_menu_id' });

// association members
db.member.hasMany(db.favorites, { foreignKey: 'member_id' });
db.favorites.belongsTo(db.member, { foreignKey: 'member_id' });

db.member.hasMany(db.histories, { foreignKey: 'member_id' });
db.histories.belongsTo(db.member, { foreignKey: 'member_id' });

db.member.hasMany(db.member_profiles, { foreignKey: 'member_id' });
db.member_profiles.belongsTo(db.member, { foreignKey: 'member_id' });

db.member.hasMany(db.reviews, { foreignKey: 'member_id' });
db.reviews.belongsTo(db.member, { foreignKey: 'member_id' });

// association member
db.member.hasMany(db.member_profiles, { foreignKey: 'member_id' });
db.member_profiles.belongsTo(db.member, { foreignKey: 'member_id' });

// association member_profiles
db.member_profiles.hasMany(db.download, { foreignKey: 'member_profile_id' });
db.download.belongsTo(db.member_profiles, { foreignKey: 'member_profile_id' });

db.member_profiles.hasMany(db.reviews, { foreignKey: 'member_profile_id' });
db.reviews.belongsTo(db.member_profiles, { foreignKey: 'member_profile_id' });

db.member_profiles.hasMany(db.oath_profile_clients, { foreignKey: 'profile_id' });
db.oath_profile_clients.belongsTo(db.member_profiles, { foreignKey: 'profile_id' });

// association movies
db.movies.hasMany(db.continue_watching, { foreignKey: 'movie_id' });
db.continue_watching.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.download, { foreignKey: 'movie_id' });
db.download.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.favorites, { foreignKey: 'movie_id' });
db.favorites.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.movie_categories, { foreignKey: 'movie_id' });
db.movie_categories.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.movie_packages, { foreignKey: 'movie_id' });
db.movie_packages.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.reviews, { foreignKey: 'movie_id' });
db.reviews.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.season, { foreignKey: 'movie_id' });
db.season.belongsTo(db.movies, { foreignKey: 'movie_id' });

// association package
db.packages.hasMany(db.movie_packages, { foreignKey: 'package_id' });
db.movie_packages.belongsTo(db.packages, { foreignKey: 'package_id' });

// association provices
db.provinces.hasMany(db.customers, { foreignKey: 'province_id' });
db.customers.belongsTo(db.provinces, { foreignKey: 'province_id' });

db.provinces.hasMany(db.amphures, { foreignKey: 'province_id' });
db.amphures.belongsTo(db.provinces, { foreignKey: 'province_id' });

// association rates
db.rates.hasOne(db.movies, { foreignKey: 'rate_id' });
db.movies.belongsTo(db.rates, { foreignKey: 'rate_id' });

// association season
db.season.hasOne(db.episode, { foreignKey: 'season_id' });
db.episode.belongsTo(db.season, { foreignKey: 'season_id' });

db.season.hasOne(db.download, { foreignKey: 'season_id' });
db.download.belongsTo(db.season, { foreignKey: 'season_id' });

// association status_members
db.status_members.hasMany(db.member, { foreignKey: 'status_member_id' });
db.member.belongsTo(db.status_members, { foreignKey: 'status_member_id' });

//
db.oath_user_clients.hasOne(db.user_refresh_tokens, { foreignKey: 'client_id' });
db.user_refresh_tokens.belongsTo(db.oath_user_clients, { foreignKey: 'client_id' });

db.oath_member_clients.hasOne(db.member_refresh_tokens, { foreignKey: 'member_client_id' });
db.member_refresh_tokens.belongsTo(db.oath_member_clients, { foreignKey: 'member_client_id' });

db.member.hasMany(db.oath_member_clients, { foreignKey: 'member_id' });
db.oath_member_clients.belongsTo(db.member, { foreignKey: 'member_id' });

db.oath_profile_clients.hasOne(db.profile_refresh_tokens, { foreignKey: 'profile_client_id' });
db.profile_refresh_tokens.belongsTo(db.oath_profile_clients, { foreignKey: 'profile_client_id' });

// help coming soon
db.help_topics.hasMany(db.help_lists, { foreignKey: 'help_topic_id' });
db.help_lists.belongsTo(db.help_topics, { foreignKey: 'help_topic_id' });

db.customers.hasMany(db.help_topics, { foreignKey: 'customer_id' });
db.help_topics.belongsTo(db.customers, { foreignKey: 'customer_id' });

// association package
db.packages.hasOne(db.member, { foreignKey: 'package_id' });
db.member.belongsTo(db.packages, { foreignKey: 'package_id' });

module.exports = db;