export interface StoredSettings {
  apiKey: string | null;
}

export async function getApiKey(): Promise<string | null> {
  const result = await chrome.storage.local.get("apiKey");
  return result.apiKey ?? null;
}

export async function setApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ apiKey: key });
}

export async function clearApiKey(): Promise<void> {
  await chrome.storage.local.remove("apiKey");
}
