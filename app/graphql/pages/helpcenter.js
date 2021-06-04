const db = require('../../../config/db');
const sequelize = db.sequelize;

const topic = db.help_topics;
const helpList = db.help_lists

const config = require('config');
const baseUrl = config.baseUrl;

const query = require('../../helper/query');

let conditions, select, join;

const helpcenter = async (context) => {
    let helps = [];

    conditions = {
        status_delete: 0,
        customer_id: context.customerId,
    };
    select = [
        [sequelize.col('help_topics.id'), 'id'],
        [sequelize.col(`help_topics.topic${context.lang}`), 'topic'],
    ];
    const helpTopics = await query.findAllByConditions(conditions, topic, select);

    if (!helpTopics) {
        return {
            status: {
                code: 2,
                message: "Not found in database"
            },
            result: []
        };
    }

    let dataHelp = [];
    for (const item of helpTopics) {
        conditions = {
            status_delete: 0,
            help_topic_id: item.id,
        };
        select = [
            [sequelize.col('help_lists.id'), 'id'],
            [sequelize.col(`help_lists.title${context.lang}`), 'title'],
            [sequelize.col(`help_lists.description${context.lang}`), 'description'],
        ];
        const helpLists = await query.findAllByConditions(conditions, helpList, select);
        if (helpLists) {
            item.help_center_list = helpLists;
        } else {
            item.helpcenterList = [];
        }

        let listData = {};
        listData.topic = item.topic;
        listData.list_topic = item.help_center_list;
        dataHelp.push(listData);
    }

    const data = {
        group_type: 6,
        group_name: "Help Center",
        section: 16,
        loadmore: "",
        items: dataHelp
    };
    helps.push(data);

    return {
        status: {
            code: 1,
            message: "Success"
        },
        result: helps
    };
};
module.exports = helpcenter;
