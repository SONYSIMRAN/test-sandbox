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
const formatRiskScoreType = function (qualityType) {
    if (typeof qualityType !== 'string' || !qualityType.trim()) {
        return '';
    }
    return qualityType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export { serializeParams, formatRiskScoreType };