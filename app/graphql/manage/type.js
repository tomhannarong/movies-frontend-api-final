const { gql } = require('apollo-server-express');

const type = gql`
    input manage {
        movie_type: Int ,
        uuid: String ,
        rating: Int ,
        description: String ,
        current_time: Int ,
        profile_name: String ,
        avatar: String
    }

    type status {
        code: Int! ,
        message: String!
    }

    type result {
        match: Int ,
        name: String ,
        avatar: String
    }

    type response {
        status: status! ,
        result: result
    }

    type Query {
        calculateRating: response
    }

    type Mutation {
        ratingMovie(input: manage): response ,
        favoriteMovie(input: manage): response ,
        historyMovie(input: manage): response ,
        downloadMovie(input: manage): response ,
        manageProfile(input: manage): response
    }
`;

module.exports = type;