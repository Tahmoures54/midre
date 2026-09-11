import { t } from "@/lib/i18n";
import { SCHEMA_VERSION, type BackupPayload, type Medication } from "./types";
import { sanitizeMedication } from "./medication";

const DB_NAME = "MedicationReminderDB";
const DB_VERSION = SCHEMA_VERSION;
const STORE_NAME = "medications";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("nextDoseAt", "nextDoseAt", { unique: false });
      }
    };
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    let request: IDBRequest<T> | void;
    try {
      request = fn(store);
    } catch (e) {
      reject(e);
      return;
    }
    if (request) {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }
    tx.oncomplete = () => {
      if (!request) resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllMedications(): Promise<Medication[]> {
  const rows = (await withStore("readonly", (store) => store.getAll())) as Medication[] | undefined;
  return (rows || []).map((m) => sanitizeMedication(m) as Medication);
}

export async function addMedication(medication: Omit<Medication, "id">): Promise<Medication> {
  const value = sanitizeMedication(medication);
  delete (value as { id?: number }).id;
  const id = (await withStore("readwrite", (store) => store.add(value))) as number;
  return { ...(value as Omit<Medication, "id">), id };
}

export async function updateMedication(medication: Medication): Promise<void> {
  await withStore("readwrite", (store) => store.put(sanitizeMedication(medication)));
}

export async function deleteMedication(id: number): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
}

export async function exportBackup(): Promise<BackupPayload> {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: Date.now(),
    medications: await getAllMedications(),
  };
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  if (!payload || !Array.isArray(payload.medications)) {
    throw new Error(t("backupInvalid"));
  }
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const medication of payload.medications) {
      const value = sanitizeMedication({ ...medication, id: undefined });
      delete (value as { id?: number }).id;
      store.add(value);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
