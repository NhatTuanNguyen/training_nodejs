let getParams = (params,property,defaultValue) => {
    if (params[property] !== undefined) {
        return params[property];
    }

    return defaultValue;
}

module.exports = {
    getParams
}