const { gql } = require('apollo-server-express');

const type = gql`
    type result {
        name_profile: String,
        avatar: String,
        token_profile: String ,
        refresh_profile: String ,
        is_interested: Boolean
    }

    type resultSignout {
        signOut: Boolean
    }

    type status {
        code: Int ,
        message: String
    }

    type response {
        status: status! ,
        result: result
    }
    
    type responseProfileSignout {
        status: status! ,
        result: resultSignout
    }

    type Query {
        getOathClient(uuid: String): response
    }

    type Mutation {
        createOathProfile(uuid: String): response,
        deleteOathProfile: responseProfileSignout
    }
`;

module.exports = type;


