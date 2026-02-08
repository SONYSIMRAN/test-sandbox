//Format API params
const serializeParams = function (obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    console.log('API params : ', str.join('&'));
    return str.join("&");
}

const removeBeforeUnderline = function (val) {
    if (val) {
        return val.substring(val.indexOf("_") + 1).replace(/\b\w/g, l => l.toUpperCase());
    }
}
/*Replace underscore with space*/
const replaceUnderscoreBySpace = function (val) {
    if (val) {
        return val.replace(/_/g, ' ');
    }
}
const convertToPerc = function (value, maxValue) {
    return (value && maxValue) ? (value / maxValue * 100).toFixed() : ''
}
const insertSpaceBeforeCapital = function (getStr) {
    if (getStr) {
        return getStr.replace(/([A-Z])/g, ' $1').trim()
    }
    else {
        return '';
    }
}
//Format and sort data
const formatData = function (data) {
    let sortMatrix = ['TEST', 'LOAD', 'PROD'];
    let environmentsData = JSON.parse(JSON.stringify(data));
    console.log('Environments Data', environmentsData);
    let response = environmentsData.sort((a, b) => {
        return sortMatrix.indexOf(a.Name) - sortMatrix.indexOf(b.Name);
    });

    response = response.map(env => {
        let dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
        let sortedReleases = env.Releases.sort((a, b) => {
            let nameA = new Date(dateRegex.test(a.Name) ? a.Name : '01/01/1970').getTime();
            let nameB = new Date(dateRegex.test(b.Name) ? b.Name : '01/01/1970').getTime();
            return nameB - nameA;
        });
        return Object.assign({}, env, { Releases: sortedReleases });
    });
    console.log('Response', response);
    return response;
}

export { serializeParams, removeBeforeUnderline, replaceUnderscoreBySpace, convertToPerc, insertSpaceBeforeCapital, formatData };