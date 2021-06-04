const { gql } = require('apollo-server-express');

const type = gql`
    type result {
        is_verified: Boolean
    }

    type status {
        code: Int ,
        message: String
    }

    type resultSelectPackage {
        package_uuid: String ,
        package_name: String ,
        price: Int ,
        days: Int ,
        max_quality: String ,
        limit_device: Int
    }

    type resultSendVerifyEmail {
        email: String ,
        success: Boolean
    }

    type resultSignout {
        signOut: Boolean
    }
    
    type response {
        status: status! ,
        result: result
    }

    type responseSelectPackage {
        status: status! ,
        result: [resultSelectPackage]
    }

    type responsePackageByUuid {
        status: status! ,
        result: resultSelectPackage
    }

    type responseSendVerifyEmail {
        status: status! ,
        result: resultSendVerifyEmail
    }

    type responseMemberSignout {
        status: status! ,
        result: resultSignout
    }

    type Query {
        getSelectPackage: responseSelectPackage ,
        getPackageByUuid(package_uuid: String): responsePackageByUuid
    }

    type Mutation {
        updateVerifyEmail(code: Int): response ,
        updateTokenEmail: responseSendVerifyEmail ,
        deleteOathMember: responseMemberSignout
    }
`;

module.exports = type;