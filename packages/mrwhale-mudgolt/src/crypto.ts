import * as crypto from "crypto";

export const GENERATE_ALGORITHM: RsaHashedKeyGenParams = {
  name: "RSA-PSS",
  modulusLength: 512,
  publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
  hash: "SHA-256",
};

export const IMPORT_ALGORITHM: RsaHashedImportParams = {
  name: "RSASSA-PKCS1-v1_5",
  hash: "SHA-256",
};

export const ALGORITHM_IDENTIFIER: RsaPssParams = {
  name: "RSASSA-PKCS1-v1_5",
  saltLength: 4,
};

export function ab2str(buffer: ArrayBuffer): string {
  return String.fromCharCode.apply(
    null,
    (new Uint8Array(buffer) as unknown) as number[]
  );
}

export function str2ab(string: string): ArrayBuffer {
  const buffer = new ArrayBuffer(string.length);
  const bufferView = new Uint8Array(buffer);

  for (let i = 0, strLen = string.length; i < strLen; i++) {
    bufferView[i] = string.charCodeAt(i);
  }

  return buffer;
}


export function generateRSAKeypair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(GENERATE_ALGORITHM, true, [
    "sign",
    "verify",
  ]);
}

export async function importRSAKey(
  base64: string,
  format: "pkcs8" | "spki",
  usages: KeyUsage[]
): Promise<CryptoKey> {
  const keyBuffer = str2ab(atob(base64));

  return await crypto.subtle.importKey(
    format,
    keyBuffer,
    IMPORT_ALGORITHM,
    true,
    usages
  );
}

export async function exportRSAKey(
  key: CryptoKey,
  format: "pkcs8" | "spki"
): Promise<string> {
  const keyBuffer = await crypto.subtle.exportKey(format, key);
  const base64 = btoa(ab2str(keyBuffer));

  return base64;
}
