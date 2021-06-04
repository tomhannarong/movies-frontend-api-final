const { gql } = require('apollo-server-express');

const type = gql`
    type dataProfile{
        uuid: String,
        name: String,
        avatar: String,
    }

    type status {
        code: Int ,
        message: String
    }

    type responseProfile {
        status: status! ,
        result: [dataProfile]
    }

    type Query {
        getProfile: responseProfile
    }

    type Mutation {
        getProfile: responseProfile
    }

`;

module.exports = type;


