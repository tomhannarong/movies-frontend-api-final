const { gql } = require('apollo-server-express');

const type = gql`
    input getPage {
        page: Int! ,
        movie_type: Int ,
        movie_uuid: String ,
        season_uuid: String ,
        category_id: Int ,
        keyword: String ,
        limit: Int
    }

    type status {
        code: Int! ,
        message: String!
    }

    type season {
        season_no: Int ,
        season_uuid: String
    }

    type categories {
        category_id: ID ,
        category_name: String
    }
    
    type listTopic {
        title: String ,
        description: String
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
        categories: [categories] ,
        member_profile_uuid: String ,
        member_profile_name: String ,
        avatar: String ,
        is_me: Boolean ,
        email: String ,
        card_number: String ,
        next_billing_date: String ,
        topic: String ,
        list_topic: [listTopic] ,
        
        my_package: package,
        ohter_package:[package]
    }
    type package {
        package_uuid: String ,
        package_name: String ,
        price: Int ,
        days: Int ,
        max_quality : String ,
        limit_device: Int
    }

    type result {
        group_type: Int ,
        group_name: String ,
        section: Int ,
        loadmore: String ,
        season: [season] ,
        season_no: Int ,
        items: [items]
    }

    type response {
        status: status! ,
        result: [result]
    }

    type Query {
        getPages(input: getPage!): response
    }
`;

module.exports = type;