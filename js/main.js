/**
 * ============================================================
 * MAIN.JS - Logik Utama (load data, edit, salin, hantar borang)
 * ============================================================
 */

// Muat rekod penceramah dari Google Sheet
async function loadData() {
  const tbody = document.getElementById("penceramahTableBody");
  tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400"><i class="fa-solid fa-spinner fa-spin text-blue-900 text-sm mb-1"></i><br>Menyegerak rekod dari Google Sheet...</td></tr>`;

  try {
    const res = await fetch(`${SCRIPT_URL}?_=${Date.now()}`, { credentials: "omit" });
    if (!res.ok) throw new Error("Gagal menyambung");
    const data = await res.json();
    speakerList = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Ralat pangkalan data:", e);
    speakerList = [];
  }
  renderFilterButtons();
  renderTable();
}

// Isi borang untuk kemaskini rekod sedia ada
function editMaklumat(index) {
  const s = speakerList[index];
  if (!s) return;

  document.getElementById("editRowIndex").value = s.rowIndex || "";
  document.getElementById("nama").value = s.nama;
  document.getElementById("jawatan").value = s.jawatan;
  document.getElementById("noTelPenceramah").value = s.telPenceramah;
  document.getElementById("noTelPA").value = (s.telPA === '-' ? '' : s.telPA);
  document.getElementById("existingGambarUrl").value = s.gambarUrl || "";

  const sediaList = (s.sediaTempat || "").split(',').map(x => x.trim());
  document.querySelectorAll('input[name="sediaTempat"]').forEach(cb => {
    cb.checked = sediaList.includes(cb.value);
  });

  // Pulihkan tickbox tarikh (sokongan format baharu & lama)
  const tarikhList = (s.tarikh || "").split(/,|→|->/).map(p => {
    const m = p.trim().match(/\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : null;
  }).filter(Boolean);
  document.querySelectorAll('input[name="pilihTarikh"]').forEach(cb => {
    cb.checked = tarikhList.includes(cb.value);
  });

  const gLabel = document.getElementById("fileExistingGambarLabel");
  if (isSafeDriveUrl(s.gambarUrl)) {
    gLabel.innerHTML = `<i class="fa-solid fa-check text-emerald-600 mr-1"></i> <a href="${encodeURI(s.gambarUrl)}" target="_blank" rel="noopener noreferrer" class="underline font-bold">Gambar HD Sedia Ada</a> (Pilih fail baharu jika mahu ganti).`;
    gLabel.classList.remove("hidden");
  } else {
    gLabel.classList.add("hidden");
  }

  document.getElementById("formTitle").innerText = `Kemaskini Rekod: ${s.nama}`;
  document.getElementById("formSubtitle").innerText = "Sila buat pindaan yang diperlukan dan klik 'Kemaskini Maklumat'.";
  document.getElementById("btnHantar").innerText = "Kemaskini Maklumat";
  document.getElementById("btnHantar").className = "bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold px-8 py-2.5 rounded-xl shadow transition active:scale-95";
  document.getElementById("cancelEditBtn").classList.remove("hidden");

  document.getElementById("formContainer").scrollIntoView({ behavior: 'smooth' });
}

// Kosongkan borang ke mod pendaftaran baharu
function resetFormToNew() {
  document.getElementById("penceramahForm").reset();
  document.getElementById("editRowIndex").value = "";
  document.getElementById("existingGambarUrl").value = "";
  document.getElementById("fileExistingGambarLabel").classList.add("hidden");

  document.querySelectorAll('input[name="sediaTempat"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="pilihTarikh"]').forEach(cb => cb.checked = false);

  document.getElementById("formTitle").innerText = "Daftar Jadual & Maklumat Penceramah";
  document.getElementById("formSubtitle").innerText = "Sila isi maklumat dengan lengkap dan tepat untuk tujuan penjadualan ceramah serta muat naik gambar penceramah untuk tujuan penghasilan poster.";
  document.getElementById("btnHantar").innerText = "Hantar";
  document.getElementById("btnHantar").className = "bg-[#173059] hover:bg-[#0f213d] text-white text-xs font-bold px-8 py-2.5 rounded-xl shadow transition active:scale-95";
  document.getElementById("cancelEditBtn").classList.add("hidden");
}

// Salin maklumat ke clipboard tanpa mendedahkan sebarang maklumat sulit
function salinMaklumat(index) {
  const s = speakerList[index];
  const text = `NAMA: ${s.nama}\nNO. TEL PENCERAMAH: ${s.telPenceramah}\nNO. TEL PA: ${s.telPA || '-'}\nJAWATAN: ${s.jawatan}\nTARIKH: ${(s.tarikh || '').replace(/\n/g, ' ')}\nSEDIA CERAMAH DI DUN: ${s.sediaTempat || '-'}\nLINK GAMBAR HD: ${s.gambarUrl || 'Tiada'}`;
  navigator.clipboard.writeText(text);
  alert(`Maklumat rasmi ${s.nama} telah disalin!`);
}

// Hantar borang (daftar baru atau kemaskini)
async function handleSubmit(e) {
  e.preventDefault();

  // Keselamatan: cooldown antara hantaran (elak spam)
  const now = Date.now();
  if (now - lastSubmitTime < SUBMIT_COOLDOWN_MS) {
    alert("Sila tunggu sebentar sebelum menghantar semula.");
    return;
  }

  // 1. Validasi Tarikh (sekurang-kurangnya satu tarikh dipilih)
  const checkedDates = Array.from(document.querySelectorAll('input[name="pilihTarikh"]:checked')).map(cb => cb.value);
  if (checkedDates.length === 0) {
    alert("Sila pilih sekurang-kurangnya satu tarikh ceramah!");
    return;
  }
  checkedDates.sort();
  const tarikhGabung = checkedDates.join(", ");

  // 2. Validasi DUN
  const checkedBoxes = Array.from(document.querySelectorAll('input[name="sediaTempat"]:checked')).map(cb => cb.value);
  if (checkedBoxes.length === 0) {
    alert("Sila pilih sekurang-kurangnya satu DUN di bahagian 'Sedia Ceramah Di DUN'!");
    return;
  }
  const sediaTempatVal = checkedBoxes.join(', ');

  // 3. Validasi Format No KP (Mesti 12 Angka)
  const rawIC = document.getElementById("noKP").value.replace(/[^0-9]/g, "");
  if (rawIC.length !== 12) {
    alert("Sila pastikan Nombor Kad Pengenalan mengandungi tepat 12 digit nombor tanpa tanda sempang (-)!");
    document.getElementById("noKP").focus();
    return;
  }

  // 3b. Keselamatan: Validasi ketat nombor telefon (9-15 digit sahaja)
  const rawTel = document.getElementById("noTelPenceramah").value.replace(/[^0-9]/g, "");
  if (rawTel.length < 9 || rawTel.length > 15) {
    alert("No Telefon Penceramah mesti mengandungi 9 hingga 15 digit nombor sahaja!");
    document.getElementById("noTelPenceramah").focus();
    return;
  }
  const rawTelPA = document.getElementById("noTelPA").value.replace(/[^0-9]/g, "");
  if (rawTelPA && (rawTelPA.length < 9 || rawTelPA.length > 15)) {
    alert("No Telefon PA mesti mengandungi 9 hingga 15 digit nombor sahaja!");
    document.getElementById("noTelPA").focus();
    return;
  }

  // 4. Validasi Fail Gambar (Saiz Maksimum 5MB)
  const fileGambarInput = document.getElementById("fileGambar");
  let gambarBase64 = null, gambarName = null, gambarType = null;
  if (fileGambarInput.files.length > 0) {
    const fG = fileGambarInput.files[0];
    if (fG.size > MAX_FILE_SIZE) {
      alert(`Fail gambar ${fG.name} melebihi had saiz 5MB! Sila pilih imej yang lebih kecil.`);
      return;
    }
    gambarName = fG.name;
    gambarType = fG.type;
    try { gambarBase64 = await readFileAsBase64(fG); } catch (e) { console.warn(e); }
  }

  const btn = document.getElementById("btnHantar");
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Menyimpan Maklumat...`;

  const payload = {
    action: "save",
    rowIndex: document.getElementById("editRowIndex").value,
    nama: sanitizeText(document.getElementById("nama").value),
    jawatan: sanitizeText(document.getElementById("jawatan").value),
    ic: rawIC,
    telPenceramah: rawTel,
    telPA: rawTelPA,
    tarikh: tarikhGabung,
    sediaTempat: sediaTempatVal,
    existingGambarUrl: document.getElementById("existingGambarUrl").value,
    gambarBase64: gambarBase64,
    gambarName: gambarName,
    gambarType: gambarType
  };

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert(payload.rowIndex ? "Maklumat penceramah berjaya dikemaskini!" : "Penceramah dan fail dokumen berjaya didaftarkan!");
    resetFormToNew();
    // Keselamatan: pastikan No KP tidak kekal dalam DOM selepas hantar berjaya
    document.getElementById("noKP").value = "";
    lastSubmitTime = Date.now();
    setTimeout(loadData, 2000);
  } catch (err) {
    alert("Ralat memproses: " + err.message);
  } finally {
    btn.disabled = false;
  }
}

// ============================================================
// EVENT LISTENERS (event delegation - selamat dari XSS)
// ============================================================

// Penapis DUN (bar atas)
document.getElementById("dunFilterContainer").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (btn) setFilter(btn.dataset.filter);
});

// Butang susunan tarikh pada header jadual
document.getElementById("sortDateBtn").addEventListener("click", () => {
  dateSortAsc = !dateSortAsc;
  renderTable();
});

// Tag DUN dalam jadual + butang tindakan (Edit/Salin)
document.getElementById("penceramahTableBody").addEventListener("click", (e) => {
  const chip = e.target.closest(".tag-chip[data-filter]");
  if (chip) {
    setFilter(chip.dataset.filter);
    document.getElementById("dunFilterContainer").scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const idx = parseInt(btn.dataset.index, 10);
  if (btn.dataset.action === "edit") editMaklumat(idx);
  else if (btn.dataset.action === "copy") salinMaklumat(idx);
});

// ============================================================
// INIT
// ============================================================
renderDateCheckboxes();
renderDunCheckboxes();
loadData();