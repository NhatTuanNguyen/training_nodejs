const { check } = require('express-validator');

const util = require('util');
const notify = require(__path_configs + 'notify');

const options = {
    name: { min: 5, max: 30 },
    ordering: { min: 0, max: 100 },
    status: { value: 'novalue' },
    content: { min: 5, max: 30 },
    group_id: { value: 'novalue' },
}


module.exports = {
    validator: () => {
        return [
            // NAME
            check('name', util.format(notify.ERROR_NAME, options.name.min, options.name.max))
                .isLength({ min: options.name.min, max: options.name.max }),

            // ORDERING
            check('ordering', util.format(notify.ERROR_ORDERING, options.ordering.min, options.ordering.max))
                .isInt({ gt: options.ordering.min, lt: options.ordering.max }),

            // STATUS
            check('status', notify.ERROR_STATUS).custom(value => {
                // console.log(value);
              return value !== options.status.value;
            }),
            // CONTENT
            check('content', util.format(notify.ERROR_NAME, options.content.min, options.content.max))
                .isLength({ min: options.content.min, max: options.content.max }),
                // STATUS
            check('group_id', notify.ERROR_STATUS).custom(value => {
                return value !== options.group_id.value;
              }),
        ]
    }
}