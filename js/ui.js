/**
 * ============================================================
 * UI.JS - Fungsi Render & Paparan (checkboxes, penapis, jadual)
 * ============================================================
 */

// State global paparan
let speakerList = [];
let activeDunFilter = "ALL";
let dateSortAsc = true; // true = terawal dulu (menaik), false = terkini dulu (menurun)

function formatDateLabel(iso) {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(y, m - 1, day);
  return `${HARI_MS[d.getDay()]} ${day}/${m}`;
}

// Render tickbox tarikh ceramah
function renderDateCheckboxes() {
  const container = document.getElementById("dateCheckboxContainer");
  container.innerHTML = CAMPAIGN_DATES.map(iso => `
    <label class="flex items-center gap-2 cursor-pointer hover:text-blue-900 transition font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
      <input type="checkbox" name="pilihTarikh" value="${iso}" class="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-800" />
      <span>${formatDateLabel(iso)}</span>
    </label>
  `).join("");
}

// Render tickbox DUN (dikumpulkan mengikut parti)
function renderDunCheckboxes() {
  const container = document.getElementById("dunCheckboxContainer");
  const groups = ["UMNO", "MCA", "MIC", "PAS", "WAWASAN", "GERAKAN"];
  const groupColors = {
    UMNO: "bg-red-50 text-red-800 border-red-300",
    MCA: "bg-blue-50 text-blue-800 border-blue-300",
    MIC: "bg-purple-50 text-purple-800 border-purple-300",
    PAS: "bg-emerald-50 text-emerald-800 border-emerald-300",
    WAWASAN: "bg-indigo-50 text-indigo-800 border-indigo-300",
    GERAKAN: "bg-amber-50 text-amber-800 border-amber-300"
  };

  container.innerHTML = groups.map(g => {
    const items = DUN_LIST.filter(d => d.parti === g);
    if (items.length === 0) return "";
    return `
      <div>
        <div class="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold mb-1.5 ${groupColors[g]}">
          ${g} (${items.length} DUN)
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
          ${items.map(d => `
            <label class="flex items-center gap-2 cursor-pointer hover:text-blue-900 transition font-medium">
              <input type="checkbox" name="sediaTempat" value="${escapeHTML(DUN_LABEL(d))}" class="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-800" />
              <span>${escapeHTML(DUN_LABEL(d))}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");
}

function getTagStyle(rawName) {
  const lower = rawName.toLowerCase();
  if (lower.includes("umno")) {
    return "bg-red-50 text-red-800 border-red-300 hover:bg-red-100";
  } else if (lower.includes("mca")) {
    return "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100";
  } else if (lower.includes("mic")) {
    return "bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100";
  } else if (lower.includes("pas")) {
    return "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100";
  } else if (lower.includes("wawasan")) {
    return "bg-indigo-50 text-indigo-800 border-indigo-300 hover:bg-indigo-100";
  } else if (lower.includes("gerakan")) {
    return "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100";
  }
  return "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200";
}

function renderFilterButtons() {
  const container = document.getElementById("dunFilterContainer");

  const counts = {};
  DUN_LIST.forEach(d => counts[d.dun] = 0);
  let totalCount = speakerList.length;

  speakerList.forEach(s => {
    const dunStr = s.sediaTempat || "";
    DUN_LIST.forEach(d => {
      // Padan ikut nama DUN sahaja - serasi dengan format label lama & baharu
      if (dunStr.includes(d.dun)) counts[d.dun]++;
    });
  });

  let html = `
    <button data-filter="ALL" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
      activeDunFilter === 'ALL'
        ? 'bg-[#173059] text-white border-[#173059] shadow-sm'
        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
    }">
      Semua DUN (${totalCount})
    </button>
  `;

  DUN_LIST.forEach(d => {
    const isSelected = activeDunFilter === d.dun;
    const style = isSelected
      ? 'bg-[#173059] text-white border-[#173059] shadow-sm'
      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50';

    html += `
      <button data-filter="${escapeHTML(d.dun)}" title="${escapeHTML(DUN_LABEL(d))}" class="px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${style}">
        ${escapeHTML(d.dun)} <span class="ml-1 opacity-75">(${counts[d.dun]})</span>
      </button>
    `;
  });

  container.innerHTML = html;
}

function setFilter(dun) {
  activeDunFilter = dun;
  renderFilterButtons();
  renderTable();
}

function renderTags(sediaTempatString) {
  if (!sediaTempatString || sediaTempatString.trim() === "-" || sediaTempatString.trim() === "") {
    return `<span class="text-slate-400 text-[11px]">-</span>`;
  }

  const tags = sediaTempatString.split(',').map(t => t.trim()).filter(Boolean);
  return `
    <div class="flex flex-wrap gap-1.5 py-1">
      ${tags.map(tag => {
        const style = getTagStyle(tag);
        return `
          <span data-filter="${escapeHTML(tag)}" title="Klik untuk tapis penceramah bagi ${escapeHTML(tag)}" class="tag-chip inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer transition select-none shadow-xs ${style}">
            <i class="fa-solid fa-tag text-[9px] opacity-70"></i>
            ${escapeHTML(tag)}
          </span>`;
      }).join('')}
    </div>
  `;
}

function renderTable() {
  const tbody = document.getElementById("penceramahTableBody");

  const filteredList = speakerList.filter(item => {
    if (activeDunFilter === "ALL") return true;
    // Padan ikut nama DUN sahaja - serasi dengan format label lama & baharu
    return (item.sediaTempat || "").includes(activeDunFilter);
  });

  // Susun penceramah ikut tarikh (terawal atau terkini)
  const getEarliestDate = (t) => {
    const dates = (t || "").match(/\d{4}-\d{2}-\d{2}/g);
    return dates ? dates.slice().sort()[0] : "9999-12-31"; // rekod tanpa tarikh di hujung
  };
  const getLatestDate = (t) => {
    const dates = (t || "").match(/\d{4}-\d{2}-\d{2}/g);
    return dates ? dates.slice().sort().pop() : "0000-01-01"; // rekod tanpa tarikh di hujung
  };
  const dateKeyFn = dateSortAsc ? getEarliestDate : getLatestDate;
  filteredList.sort((a, b) => {
    const cmp = dateKeyFn(a.tarikh).localeCompare(dateKeyFn(b.tarikh));
    return dateSortAsc ? cmp : -cmp;
  });

  if (filteredList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-12 text-slate-400">
          <i class="fa-regular fa-folder-open text-2xl text-slate-300 mb-2"></i>
          <p>Tiada rekod penceramah dijumpai ${activeDunFilter !== "ALL" ? `bagi DUN <b>${escapeHTML(activeDunFilter)}</b>` : "di Google Sheet"}.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredList.map((item) => {
    // Kemas kini ikon arah susunan tarikh
    const sortIcon = document.getElementById("sortDateIcon");
    if (sortIcon) {
      sortIcon.className = dateSortAsc
        ? "fa-solid fa-arrow-down-short-wide text-[10px]"
        : "fa-solid fa-arrow-up-wide-short text-[10px]";
    }
    const originalIndex = speakerList.indexOf(item);
    const cleanTel = (item.telPenceramah || "").replace(/[^0-9]/g, '');
    const cleanPA = (item.telPA || "").replace(/[^0-9]/g, '');

    // Papar tarikh sebagai cip yang mudah dibaca (sokongan format lama & baharu)
    const dateChips = (item.tarikh || "")
      .split(/,|→|->/)
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => {
        const isoMatch = t.match(/\d{4}-\d{2}-\d{2}/);
        const label = isoMatch ? formatDateLabel(isoMatch[0]) : t;
        return `<span class="inline-block bg-slate-100 text-slate-700 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-semibold mb-1">${escapeHTML(label)}</span>`;
      })
      .join("");

    let gambarBtn = `<span class="text-slate-400 text-[11px]">Tiada</span>`;
    if (isSafeDriveUrl(item.gambarUrl)) {
      gambarBtn = `
        <a href="${encodeURI(item.gambarUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[11px] font-bold hover:bg-emerald-100 transition shadow-sm">
          <i class="fa-solid fa-image text-emerald-600"></i> Lihat
        </a>`;
    }

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-3.5 px-4 font-semibold text-slate-900 align-top">${escapeHTML(item.nama)}</td>
        <td class="py-3.5 px-4 text-slate-600 align-top leading-relaxed">${escapeHTML(item.jawatan)}</td>
        <td class="py-3.5 px-4 font-mono text-slate-700 align-top">
          <a href="tel:${cleanTel}" class="hover:underline text-blue-900 font-semibold">${escapeHTML(item.telPenceramah)}</a>
        </td>
        <td class="py-3.5 px-4 font-mono text-slate-600 align-top">
          ${cleanPA ? `<a href="tel:${cleanPA}" class="hover:underline text-slate-700">${escapeHTML(item.telPA)}</a>` : '-'}
        </td>
        <td class="py-3 px-4 text-center align-top"><div class="flex flex-col items-center">${dateChips}</div></td>
        <td class="py-3 px-4 align-top">${renderTags(item.sediaTempat)}</td>
        <td class="py-3.5 px-3 text-center align-top">${gambarBtn}</td>
        <td class="py-3.5 px-4 text-center align-top">
          <div class="flex items-center justify-center gap-2">
            <button data-action="edit" data-index="${originalIndex}" class="text-blue-700 hover:text-blue-900 font-bold">Edit</button>
            <span class="text-slate-300">|</span>
            <button data-action="copy" data-index="${originalIndex}" class="text-slate-600 hover:text-slate-800 font-medium">Salin</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}