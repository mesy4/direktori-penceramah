/**
 * ============================================================
 * CONFIG.JS - Konfigurasi & Data Tetapan Portal Penceramah
 * Direktori Penceramah PRN Melaka ke-16 (Gabungan PN-BN)
 * ============================================================
 */

// URL Apps Script Web App (jangan kongsi versi /dev, guna /exec sahaja)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwjCH4oGq9g21PGu6Mu5jPIgeVU-dbbXkcbkVhBtI9MPuqrDaTVhjui7uGiDRN-j89W/exec";

// Had saiz fail muat naik (gambar penceramah)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Senarai 28 DUN Melaka - PRN ke-16 (Format: Nama DUN - Calon - Parti)
const DUN_LIST = [
  { dun: "Kuala Linggi",    calon: "Calon BN", parti: "UMNO" },
  { dun: "Tanjung Bidara",  calon: "Calon BN", parti: "UMNO" },
  { dun: "Ayer Limau",      calon: "Calon BN", parti: "UMNO" },
  { dun: "Lendu",           calon: "Calon BN", parti: "UMNO" },
  { dun: "Taboh Naning",    calon: "Calon BN", parti: "UMNO" },
  { dun: "Rembia",          calon: "Calon BN", parti: "UMNO" },
  { dun: "Gadek",           calon: "Calon BN", parti: "MIC" },
  { dun: "Machap Jaya",     calon: "Calon BN", parti: "MCA" },
  { dun: "Durian Tunggal",  calon: "Calon BN", parti: "UMNO" },
  { dun: "Asahan",          calon: "Calon BN", parti: "UMNO" },
  { dun: "Sungai Udang",    calon: "Calon BN", parti: "UMNO" },
  { dun: "Pantai Kundor",   calon: "Calon BN", parti: "UMNO" },
  { dun: "Paya Rumput",     calon: "Calon PN", parti: "PAS" },
  { dun: "Kelebang",        calon: "Calon BN", parti: "MCA" },
  { dun: "Pengkalan Batu",  calon: "Calon BN", parti: "UMNO" },
  { dun: "Ayer Keroh",      calon: "Calon PN", parti: "GERAKAN" },
  { dun: "Bukit Katil",     calon: "Calon PN", parti: "PAS" },
  { dun: "Ayer Molek",      calon: "Calon BN", parti: "UMNO" },
  { dun: "Kesidang",        calon: "Calon PN", parti: "WAWASAN" },
  { dun: "Kota Laksamana",  calon: "Calon BN", parti: "MCA" },
  { dun: "Duyong",          calon: "Calon BN", parti: "UMNO" },
  { dun: "Bandar Hilir",    calon: "Calon BN", parti: "MCA" },
  { dun: "Telok Mas",       calon: "Calon BN", parti: "UMNO" },
  { dun: "Bemban",          calon: "Calon PN", parti: "WAWASAN" },
  { dun: "Rim",             calon: "Calon BN", parti: "UMNO" },
  { dun: "Serkam",          calon: "Calon BN", parti: "UMNO" },
  { dun: "Merlimau",        calon: "Calon BN", parti: "UMNO" },
  { dun: "Sungai Rambai",   calon: "Calon BN", parti: "UMNO" }
];

const DUN_LABEL = (d) => `${d.dun} - ${d.calon} - ${d.parti}`;

// Tempoh berkempen: 6 Nov 2026 hingga 13 Nov 2026
const CAMPAIGN_DATES = (() => {
  const dates = [];
  const d = new Date(2026, 10, 6); // Bulan 10 = November
  const end = new Date(2026, 10, 13);
  while (d <= end) {
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    d.setDate(d.getDate() + 1);
  }
  return dates;
})();

const HARI_MS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];