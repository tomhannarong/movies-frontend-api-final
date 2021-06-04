const { gql } = require('apollo-server-express');

const type = gql`
    type result {
        member_token: String,
        member_refresh: String,
        is_verified: Boolean
        is_paymented: Boolean,
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
        updateMemberToken: response
    }
`;

module.exports = type;


