export async function downloadBlob(url: string | URL): Promise<Blob> {
    console.log(`Downloading blob from URL: ${url.toString()}`);
    const response = await fetch(url);
    return response.blob();
}