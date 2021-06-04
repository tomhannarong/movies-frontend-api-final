const { gql } = require('apollo-server-express');

const type = gql`
    type status {
        code: Int! ,
        message: String!
    }

    type result {
        category_id: Int ,
        category_name: String
    }

    type response {
        status: status! ,
        result: [result]
    }

    type Query {
        categoriesList: response
    }
`;

module.exports = type;