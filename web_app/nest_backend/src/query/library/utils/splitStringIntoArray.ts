export function splitStringIntoArray(str : string, parts : number) {
    let result = [];
    let partSize = Math.ceil(str.length / parts);

    for (let i = 0; i < parts; i++) {
        let start = i * partSize;
        let end = start + partSize;
        result.push(str.substring(start, end));
    }

    return result;
}
