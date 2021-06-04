const dateTimeNow = () => {
    let now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    now = now.split(' ');
    date = now[0];
    time = now[1];
    timeSplit = time.split(':');
    timeSplit[0] = Number(timeSplit[0]) + 7;
    if ( timeSplit[0] > 24 ) timeSplit[0] = timeSplit[0] - 24;
    if ( timeSplit[0] < 10 ) timeSplit[0] = `0${timeSplit[0]}`;
    return `${date} ${timeSplit[0]}:${timeSplit[1]}:${timeSplit[2]}`;
};

const compareArrayNumber = (arrayA, arrayB) => {
    if ( arrayA.length != arrayB.length ) return false;
    arrayA = arrayA.sort();
    arrayB = arrayB.sort();
    
    for ( let i = 0; i < arrayA.length; i++ ) {
        if ( arrayA[i] != arrayB[i] ) return false;
    }
    return true;
};

const checkBase64 = (base64) => {
    const pattern = /^data:image\/([A-Za-z-+\/]+);base64,(.+)$/;
    return pattern.test(base64);
};

module.exports = {
    dateTimeNow ,
    compareArrayNumber ,
    checkBase64
};