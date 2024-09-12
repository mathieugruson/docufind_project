export function splitArrayIntoParts(array: string[], parts: number): string[][] {

    let result: string[][] = [];
    let partSize = Math.ceil(array.length / parts);

    for (let i = 0; i < parts; i++) {
        let start = i * partSize;
        let end = start + partSize;
        result.push(array.slice(start, end));
    }

    return result;
}

