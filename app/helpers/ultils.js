
let createFilterStatus = async (currentStatus,collection) => {
    const currentModel = require(__path_schemas + collection);

    let statusFilter = [
        { name: "all", count: 1, link: "#", class: "default" },
        { name: "active", count: 2, link: "#", class: "default" },
        { name: "inactive", count: 3, link: "#", class: "default" },
    ]

    // statusFilter.forEach((item, index) => {
    for (let index = 0;index < statusFilter.length;index++) {
        let item = statusFilter[index];
        let condition = (item.name !== 'all') ? {status:item.name}:{};
        if (item.name === currentStatus) statusFilter[index].class = "success"
        await currentModel.count(condition).then((data) => {
            statusFilter[index].count = data
        })
    }

    return statusFilter;
}

module.exports = {
    createFilterStatus:createFilterStatus,
}