module.exports = (sequelize, Sequelize) => {
    const Movies = sequelize.define(
        'movies',
        {
            id: {
                type: Sequelize.INTEGER,
                field: 'id',
                autoIncrement: true,
                primaryKey: true
            },
            uuid: {
                type: Sequelize.STRING(255),
                field: 'uuid'
            },
            type: {
                type: Sequelize.BOOLEAN,
                field: 'type'
            },
            name: {
                type: Sequelize.STRING(100),
                field: 'name'
            },
            name_en: {
                type: Sequelize.STRING(100),
                field: 'name_en'
            },
            poster: {
                type: Sequelize.STRING(255),
                field: 'poster'
            },
            title: {
                type: Sequelize.STRING(255),
                field: 'title'
            },
            title_en: {
                type: Sequelize.STRING(255),
                field: 'title_en'
            },
            description: {
                type: Sequelize.TEXT,
                field: 'description'
            },
            description_en: {
                type: Sequelize.TEXT,
                field: 'description_en'
            },
            actors: {
                type: Sequelize.STRING(100),
                field: 'actors'
            },
            actors_en: {
                type: Sequelize.STRING(100),
                field: 'actors_en'
            },
            directors: {
                type: Sequelize.STRING(100),
                field: 'directors'
            },
            directors_en: {
                type: Sequelize.STRING(100),
                field: 'directors_en'
            },
            authors: {
                type: Sequelize.STRING(100),
                field: 'authors'
            },
            authors_en: {
                type: Sequelize.STRING(100),
                field: 'authors_en'
            },
            link: {
                type: Sequelize.STRING(255),
                field: 'link'
            },
            trailer: {
                type: Sequelize.STRING(255),
                field: 'trailer'
            },
            runtime: {
                type: Sequelize.INTEGER(3),
                field: 'runtime'
            },
            release_date: {
                type: Sequelize.DATE,
                field: 'release_date'
            },
            views: {
                type: Sequelize.INTEGER,
                field: 'views'
            },
            customer_id: {
                type: Sequelize.INTEGER,
                field: 'customer_id'
            },
            rate_id: {
                type: Sequelize.INTEGER,
                field: 'rate_id'
            },
            status_delete: {
                type: Sequelize.BOOLEAN,
                field: 'status_delete'
            },
            created_by: {
                type: Sequelize.INTEGER,
                field: 'created_by'
            },
            updated_by: {
                type: Sequelize.INTEGER,
                field: 'updated_by'
            },
            deleted_by: {
                type: Sequelize.INTEGER,
                field: 'deleted_by'
            },
            created_at: {
                type: Sequelize.DATE,
                field: 'created_at'
            },
            updated_at: {
                type: Sequelize.DATE,
                field: 'updated_at'
            },
            deleted_at: {
                type: Sequelize.DATE,
                field: 'deleted_at'
            }
        },
        {
            timestamps: false,
            freezeTableName: true
        }
    );
    return Movies;
};