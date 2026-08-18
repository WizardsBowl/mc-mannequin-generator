export default interface GeneratingOptions {
    playerName: string;
    profileOrigin: 'realtime' | 'stored' | 'url' | 'pack';
    modelType: 'wide' | 'slim';
    skinUrl?: string;
    capeUrl?: string;
    skinFile?: File | null;
    capeFile?: File | null;
}