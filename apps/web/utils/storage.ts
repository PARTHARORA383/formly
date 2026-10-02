// Thin wrapper over localStorage. It never throws: storage is missing during
// server rendering and can be blocked or full in the browser, and none of
// those should break the page. Values are stored as JSON.

function isBrowser() {
  return typeof window !== "undefined"
}

/** Returns the stored value, or null if there is none or it can't be read. */
function getStored<T>(key: string): T | null {
  if (!isBrowser()) return null

  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

function setStored(key: string, value: unknown) {
  if (!isBrowser()) return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage blocked. The draft just won't survive a reload.
  }
}

function removeStored(key: string) {
  if (!isBrowser()) return

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Nothing to clean up if storage isn't reachable.
  }
}

export { getStored, setStored, removeStored }
