const { gql } = require('apollo-server-express');

const type = gql`
    type dataPayment {
        is_paymented: Boolean,
    }

    type status {
        code: Int ,
        message: String
    }

    type responsePayment {
        status: status! ,
        result: dataPayment
    }

    type Query {
        getProfile: responsePayment
    }

    type Mutation {
        payment(package_uuid: String!): responsePayment
    }

`;

module.exports = type;


