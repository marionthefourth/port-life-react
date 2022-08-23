
function getFile(fileName: string) {
    var Promise = require('bluebird');
    var fs = Promise.promisifyAll(require('fs'));
    return fs.readFileAsync(fileName);
}

function standardizeDate(date) {
    const dateFormat = new Date(date);
    const standardizedDate = `${dateFormat.getMonth()+1}/${dateFormat.getDate()}/${dateFormat.getFullYear()}`
    return standardizedDate
}