import { StorageProvider } from "../storage/storage-provider";

export type StorageProviderConstructor = new (name: string) => StorageProvider;
