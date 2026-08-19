export async function getApprunsCount(appName: string): Promise<number> {
    const response = await fetch(`https://api.wizardsbowl.com/app-runs?app-name=${appName}`, {
        method: 'GET'
    });
    const data = await response.json();
    if (data && typeof data.count === 'number') {
        return data.count;
    }
    else {
        return -1;
    }
}

export async function addApprunsCount(appName: string): Promise<number> {
    const response = await fetch(`https://api.wizardsbowl.com/app-runs?app-name=${appName}`, {
        method: 'POST'
    });
    const data = await response.json();
    if (data && typeof data.code === 'number') {
        return data.code;
    }
    else {
        return -1;
    }
}