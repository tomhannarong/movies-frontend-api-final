const { gql } = require('apollo-server-express');

const type = gql`
    input getItems {
        section: Int! ,
        movie_type: Int ,
        movie_uuid: String ,
        season_uuid: String ,
        category_id: Int ,
        keyword: String ,
        page: Int ,
        limit: Int
    }

    type status {
        code: Int! ,
        message: String!
    }

    type categories {
        category_id: ID ,
        category_name: String
    }

    type items {
        movie_uuid: String ,
        movie_type: Int ,
        movie_name: String ,
        season_uuid: String ,
        season_no: Int ,
        episode_uuid: String ,
        episode_name: String ,
        poster_v: String ,
        poster_h: String ,
        title: String ,
        description: String ,
        actors: String ,
        match: Int ,
        year: String ,
        release_date: String ,
        rate_code: String ,
        user_rate: Int ,
        is_favorite: Boolean ,
        is_download: Boolean ,
        trailer: String ,
        link: String ,
        hours: String ,
        runtime: Int ,
        current_time: Int ,
        progress_bar: String ,
        download_uuid: String ,
        complete: Boolean ,
        categories: [categories]
    }

    type result {
        items: [items]
    }

    type response {
        status: status! ,
        result: result
    }

    type Query {
        loadmoreItems(input: getItems!): response
    }
`;

module.exports = type;