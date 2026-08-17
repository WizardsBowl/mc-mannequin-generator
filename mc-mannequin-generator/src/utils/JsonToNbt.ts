const itemBeginRegex = /"([^"]+)":/g;
const arrayRegex = /"(\[[bil];.+\])"/gi;

export function jsonToNbt(json: string): string {
    return json
        .replace(itemBeginRegex, '$1:')
        .replace(arrayRegex, '$1')
}

export function objectToNbt(obj: any): string {
    const jsonString = JSON.stringify(obj);
    return jsonToNbt(jsonString);
}