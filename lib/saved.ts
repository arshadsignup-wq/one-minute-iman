"use client";

/**
 * Saving an entry, without an account.
 *
 * Someone who finds the right words at a bad moment should be able to keep
 * them. Requiring registration first would put a form between a person and
 * that, so this is device storage only: it never leaves the browser, it is not
 * sent anywhere, and it does not follow the reader to another device. The
 * saved page says so plainly rather than letting people assume otherwise.
 */

const KEY = "omi.saved.v1";
const EVENT = "omi:saved-changed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
  } catch {
    // private browsing, a full quota, or a corrupted value: saving is a
    // convenience and must never break the page it sits on
    return [];
  }
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    return;
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function getSaved() {
  return read();
}

export function isSaved(id: string) {
  return read().includes(id);
}

/** Adds or removes, and returns whether the entry is saved afterwards. */
export function toggleSaved(id: string) {
  const list = read();
  const at = list.indexOf(id);
  if (at >= 0) list.splice(at, 1);
  else list.unshift(id);
  write(list);
  return at < 0;
}

export function removeSaved(id: string) {
  write(read().filter((x) => x !== id));
}

/** Fires for same-tab changes, which the storage event does not cover. */
export function onSavedChange(fn: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", fn);
  };
}
