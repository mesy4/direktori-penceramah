/**
 * ============================================================
 * SECURITY.JS - Fungsi Keselamatan & Sanitasi
 * ============================================================
 */

// Sanitasi XSS (Cross-Site Scripting) untuk paparan HTML
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Keselamatan: sanitasi input teks - buang aksara kawalan & aksara berbahaya
function sanitizeText(str) {
  return String(str || "")
    .replace(/[<>`$]/g, "")          // buang < > ` $
    .replace(/[\x00-\x1F\x7F]/g, "") // buang aksara kawalan
    .trim();
}

// Pengesahan URL Google Drive Sah (elak link berbahaya)
function isSafeDriveUrl(url) {
  if (!url || typeof url !== "string") return false;
  return /^https:\/\/(drive|docs)\.google\.com\//i.test(url.trim());
}

// Keselamatan: hadkan kekerapan hantar borang (elak spam/abuse)
let lastSubmitTime = 0;
const SUBMIT_COOLDOWN_MS = 3000;

// Baca fail sebagai Base64 (untuk muat naik gambar)
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}