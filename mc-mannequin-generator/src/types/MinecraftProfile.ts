export interface Properties {
    name: string;
    value: string;
    signature?: string;
}

export default interface MinecraftProfile {
    id?: string;
    name: string;
    properties?: Properties[];
    cape?: string;
    elytra?: string;
    model?: string;
    texture?: string;
}