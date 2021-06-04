const { gql } = require('apollo-server-express');

const type = gql`
    type result {
        name: String,
        is_verified: Boolean,
        is_paymented: Boolean,
        is_new_password: Boolean,
        token: String ,
        refresh: String ,
    }

    type resultDelete {
        logout: String,
    }

    type status {
        code: Int ,
        message: String
    }

    type response {
        status: status! ,
        result: result
    }

    type responseDelete {
        status: status! ,
        result: resultDelete
    }

    type Query {
        getOathClient(uuid: String): response
    }

    type Mutation {
        createOath: response,
        deleteOath: responseDelete
    }
`;

module.exports = type;


