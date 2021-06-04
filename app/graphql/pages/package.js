const db = require('../../../config/db');
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const Member = db.member;
const Package = db.packages;
const query = require('../../helper/query');

let conditions, select, join, order;

const package = async (context) => {
    let packages = [];
    const customerId = context.customerId;
    const memberId = context.memberId;

    conditions = {
        id: memberId,
        customer_id: customerId,
        is_verified: 1,
        is_paymented: 1,
        status_member_id: 1,
    };
    select = [
        [sequelize.col('member.package_id'), 'package_id'],
        [sequelize.col('package.name'), 'package_name'],
        [sequelize.col('package.uuid'), 'package_uuid'],
        [sequelize.col('package.price'), 'price'],
        [sequelize.col('package.days'), 'days'],
        [sequelize.col('package.max_quality'), 'max_quality'],
        [sequelize.col('package.limit_device'), 'limit_device'],
    ];
    join = [
        { model: Package, attributes: [], require: true }
    ];
    const yourPackage = await query.findOneByConditions(conditions, Member, select, join);
    if (!yourPackage) {
        return {
            status: {
                code: 2,
                message: "Not found in database"
            },
            result: []
        };
    }

    conditions = {
        status_delete: 0,
        customer_id: customerId,
        id: { [Op.ne]: yourPackage.package_id }
    };
    select = [
        [sequelize.col('packages.name'), 'package_name'],
        [sequelize.col('packages.uuid'), 'package_uuid'],
        [sequelize.col('packages.price'), 'price'],
        [sequelize.col('packages.days'), 'days'],
        [sequelize.col('packages.max_quality'), 'max_quality'],
        [sequelize.col('packages.limit_device'), 'limit_device'],
    ];
    const ohterPackages = await query.findAllLimitByConditions(conditions, Package, select);
    if (!ohterPackages) {
        return {
            status: {
                code: 2,
                message: "Not found in database"
            },
            result: []
        };
    }

    let dataPackage = [];
    let listData = {};
    listData.my_package = yourPackage;
    listData.ohter_package = ohterPackages;
    dataPackage.push(listData);
    const data = {
        group_type: 7,
        group_name: "Package",
        section: 10,
        loadmore: "",
        items: dataPackage
    };
    packages.push(data);

    return {
        status: {
            code: 1,
            message: "Success"
        },
        result: packages
    }
};

module.exports = package;