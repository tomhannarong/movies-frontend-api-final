const { gql } = require('apollo-server-express');

const type = gql`
    type interest {
        id: Int,
    }

    type status {
        code: Int ,
        message: String
    }

    type result {
        is_interested: Boolean
    }

    type resultInterest {
        category_id: Int ,
        poster_v: String
    }

    type response {
        status: status! ,
        result: result
    }

    type responseInterest {
        status: status! ,
        result: [resultInterest]
    }

    type Query {
        getInterested: responseInterest
    }

    type Mutation {
        createInterested(interest: [Int]): response
    }
`;

module.exports = type;


