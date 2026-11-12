/**
 * Payment slips uploaded by customers who pay by bank transfer.
 * Checked on the server: only images and PDFs, small enough to travel in one request.
 */

export const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

export interface ReceiptUploadInput {
  fileName?: string;
  contentType?: string;
  /** Base64 of the file, with or without a data: URL prefix. */
  dataBase64?: string;
}

export interface ValidReceipt {
  fileName: string;
  contentType: string;
  dataBase64: string;
}

/** Does the start of the file match what its content type claims? */
function matchesSignature(contentType: string, bytes: Buffer): boolean {
  switch (contentType) {
    case "image/jpeg":
      return bytes[0] === 0xff && bytes[1] === 0xd8;
    case "image/png":
      return bytes.subarray(0, 4).toString("hex") === "89504e47";
    case "image/webp":
      return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
    case "application/pdf":
      return bytes.subarray(0, 4).toString("ascii") === "%PDF";
    default:
      return false;
  }
}

/** Returns the cleaned receipt, or throws an error message that is safe to show the customer. */
export function validateReceiptUpload(input: ReceiptUploadInput | undefined | null): ValidReceipt {
  if (!input || typeof input.dataBase64 !== "string" || !input.dataBase64) {
    throw new Error("Please upload your bank payment receipt.");
  }

  let contentType = typeof input.contentType === "string" ? input.contentType.toLowerCase() : "";
  let data = input.dataBase64;
  const prefix = data.match(/^data:([^;,]+);base64,/i);
  if (prefix) {
    contentType = contentType || prefix[1].toLowerCase();
    data = data.slice(prefix[0].length);
  }

  if (!(ALLOWED_TYPES as readonly string[]).includes(contentType)) {
    throw new Error("The receipt must be a photo (JPG, PNG, WebP) or a PDF.");
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
    throw new Error("We couldn't read that receipt file. Please try uploading it again.");
  }

  const bytes = Buffer.from(data, "base64");
  if (bytes.length === 0) {
    throw new Error("That receipt file is empty. Please choose another file.");
  }
  if (bytes.length > MAX_RECEIPT_BYTES) {
    throw new Error("The receipt file is too large. Please upload a file under 3 MB.");
  }
  if (!matchesSignature(contentType, bytes)) {
    throw new Error("The receipt file doesn't look like a valid image or PDF.");
  }

  const fileName =
    (typeof input.fileName === "string" ? input.fileName : "receipt")
      .replace(/[^\w.\- ]+/g, "_")
      .trim()
      .slice(0, 80) || "receipt";

  return { fileName, contentType, dataBase64: data };
}
