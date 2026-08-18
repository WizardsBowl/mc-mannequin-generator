export default interface ResourcePackMcmeta {
    pack: Pack;
}

export interface Pack {
    description: string;
    min_format: number;
    max_format: number;
}