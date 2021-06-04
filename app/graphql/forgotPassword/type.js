const { gql } = require('apollo-server-express');

const type = gql`
    type result {
        verify_success: Boolean,
        new_password_token: String
    }

    type status {
        code: Int ,
        message: String
    }

    type responseVerifyOTP {
        status: status! ,
        result: result
    }

    type resultSendVerifyEmail {
        email: String
        success: Boolean,
    }

    type responseSendVerifyEmail {
        status: status! ,
        result: resultSendVerifyEmail
    }

    type Query {
        getOathClient(uuid: String): responseVerifyOTP
    }

    type Mutation {
        validateOTP(code: Int): responseVerifyOTP,
        updateTokenForgot: responseSendVerifyEmail
    }
`;

module.exports = type;


