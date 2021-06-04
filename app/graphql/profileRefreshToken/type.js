const { gql } = require('apollo-server-express');

const type = gql`
    type result {
        profile_token: String,
        profile_refresh: String,
    }

    type status {
        code: Int ,
        message: String
    }

    type response {
        status: status! ,
        result: result
    }

    type Query {
        getOathClient(uuid: String): response
    }

    type Mutation {
        updateProfileToken: response
    }
`;

module.exports = type;


