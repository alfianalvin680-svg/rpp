import { Identitas, Chapter, MingguEfektifDetail, RPPData } from "../types";

// Function to download an HTML string as a file
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Styling wrapper that ensures Word loads styles beautifully
const wordStyles = `
  <style>
    body {
      font-family: "Calibri", "Arial", sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333333;
      margin: 1in;
    }
    h1 {
      font-size: 18pt;
      text-align: center;
      margin-bottom: 24pt;
      font-weight: bold;
      color: #1e3a8a;
    }
    h2 {
      font-size: 14pt;
      margin-top: 18pt;
      margin-bottom: 8pt;
      font-weight: bold;
    }
    /* Banner styles matching RPP PDFs */
    .red-banner {
      background-color: #ff0000;
      color: #ffffff;
      font-size: 12pt;
      font-weight: bold;
      padding: 6px 12px;
      margin-top: 15px;
      margin-bottom: 10px;
      text-transform: uppercase;
      border: 1px solid #cc0000;
    }
    .green-banner {
      background-color: #008000;
      color: #ffffff;
      font-size: 11pt;
      font-weight: bold;
      padding: 5px 10px;
      margin-top: 10px;
      margin-bottom: 8px;
      border: 1px solid #006600;
    }
    /* Tables styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 10.5pt;
    }
    th {
      background-color: #1e3a8a;
      color: #ffffff;
      font-weight: bold;
      text-align: left;
      padding: 8px;
      border: 1px solid #cbd5e1;
    }
    td {
      padding: 8px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }
    .bg-light {
      background-color: #f8fafc;
    }
    .bg-blue-light {
      background-color: #eff6ff;
    }
    .text-center {
      text-align: center;
    }
    ul, ol {
      margin-top: 5px;
      margin-bottom: 10px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
    }
    .identitas-table td {
      border: none;
      padding: 4px 8px;
    }
    .identitas-table {
      margin-bottom: 15px;
      border: none;
    }
    /* Prosem matrix specific styling */
    .matrix-table {
      font-size: 8pt;
    }
    .matrix-table th {
      background-color: #1e3a8a;
      font-weight: bold;
      text-align: center;
      padding: 4px;
      font-size: 8.5pt;
    }
    .matrix-table td {
      padding: 4px;
      text-align: center;
    }
    .fill-color {
      background-color: #93c5fd !important; /* blue scheduling fill */
    }
    .legend-box {
      display: inline-block;
      width: 20px;
      height: 15px;
      margin-right: 8px;
      vertical-align: middle;
      border: 1px solid #94a3b8;
    }
  </style>
`;

export function generateRPPDoc(identitas: Identitas, chapter: Chapter, rpp: RPPData): string {
  const ppppList = rpp.profilPelajarPancasila.map(p => `<li>${p}</li>`).join("");
  const sarprasList = rpp.saranaPrasarana.map(s => `<li>${s}</li>`).join("");
  const persiapanList = rpp.persiapanBelajar.map(p => `<li>${p}</li>`).join("");
  
  const pendahuluanList = rpp.kegiatanPembelajaran.pendahuluan.map(p => `<li>${p}</li>`).join("");
  const intiList = rpp.kegiatanPembelajaran.inti.map(i => `<li>${i}</li>`).join("");
  const penutupList = rpp.kegiatanPembelajaran.penutup.map(p => `<li>${p}</li>`).join("");
  
  const refleksiList = rpp.refleksiGuru.map(r => `<li>${r}</li>`).join("");
  const pustakaList = rpp.daftarPustaka.map(d => `<li>${d}</li>`).join("");
  
  const tpList = chapter.tujuanPembelajaran.map(t => `<li>${t}</li>`).join("");
  const kktpList = chapter.kktp.map(k => `<li>${k}</li>`).join("");

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Modul Ajar - ${chapter.materiPokok}</title>
      ${wordStyles}
    </head>
    <body>
      <h1>MODUL AJAR KURIKULUM MERDEKA</h1>
      
      <div class="red-banner">INFORMASI UMUM</div>
      
      <div class="green-banner">A. IDENTITAS MODUL</div>
      <table class="identitas-table">
        <tr>
          <td style="width: 200px; font-weight: bold;">Penyusun</td>
          <td style="width: 15px;">:</td>
          <td>${identitas.namaGuru}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Nama Madrasah / Sekolah</td>
          <td>:</td>
          <td>${identitas.namaSekolah}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Tahun Penyusunan</td>
          <td>:</td>
          <td>${identitas.tahunPelajaran}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Mata Pelajaran</td>
          <td>:</td>
          <td>${identitas.mataPelajaran}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Fase / Kelas</td>
          <td>:</td>
          <td>${identitas.fase} / ${identitas.kelas}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Semester</td>
          <td>:</td>
          <td>${chapter.semester === 1 ? "Ganjil" : "Genap"}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Materi</td>
          <td>:</td>
          <td>${chapter.materiPokok}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Alokasi Waktu</td>
          <td>:</td>
          <td>${chapter.alokasiWaktuJP} JP</td>
        </tr>
      </table>

      <div class="green-banner">B. KOMPETENSI AWAL</div>
      <p>${rpp.kompetensiAwal}</p>

      <div class="green-banner">C. PROFIL PELAJAR PANCASILA</div>
      <ul>${ppppList}</ul>

      <div class="green-banner">D. SARANA DAN PRASARANA</div>
      <ul>${sarprasList}</ul>

      <div class="green-banner">E. TARGET PESERTA DIDIK</div>
      <p>${rpp.targetPesertaDidik}</p>

      <div class="green-banner">F. MODEL DAN METODE PEMBELAJARAN</div>
      <p>${rpp.modelMetodePembelajaran}</p>

      <div class="red-banner">KOMPONEN INTI</div>

      <div class="green-banner">A. TUJUAN PEMBELAJARAN</div>
      <ul>${tpList}</ul>

      <div class="green-banner">B. KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN</div>
      <ul>${kktpList}</ul>

      <div class="green-banner">C. PEMAHAMAN BERMAKNA</div>
      <p>${chapter.pemahamanBermakna}</p>

      <div class="green-banner">E. PERSIAPAN BELAJAR</div>
      <ul>${persiapanList}</ul>

      <div class="green-banner">F. KEGIATAN PEMBELAJARAN</div>
      <h3 style="margin-top: 8px; font-weight: bold; color: #1e3a8a;">1. Kegiatan Pendahuluan</h3>
      <ul>${pendahuluanList}</ul>
      
      <h3 style="margin-top: 8px; font-weight: bold; color: #1e3a8a;">2. Kegiatan Inti</h3>
      <ul>${intiList}</ul>
      
      <h3 style="margin-top: 8px; font-weight: bold; color: #1e3a8a;">3. Kegiatan Penutup</h3>
      <ul>${penutupList}</ul>

      <div class="green-banner">G. REFLEKSI GURU</div>
      <ul>${refleksiList}</ul>

      <div class="green-banner">H. ASESMEN / PENILAIAN</div>
      <table style="border: 1px solid #cbd5e1;">
        <tr class="bg-blue-light">
          <th style="width: 30%;">Jenis Asesmen</th>
          <th>Deskripsi & Kriteria Penilaian</th>
        </tr>
        <tr>
          <td style="font-weight: bold;">Asesmen Sikap</td>
          <td>${rpp.asesmenPenilaian.sikap}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Asesmen Performa / Keterampilan</td>
          <td>${rpp.asesmenPenilaian.performa}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Asesmen Tertulis / Evaluasi</td>
          <td>${rpp.asesmenPenilaian.tertulis.replace(/\n/g, "<br>")}</td>
        </tr>
      </table>

      <div class="green-banner">H. KEGIATAN PENGAYAAN DAN REMEDIAL</div>
      <p>${rpp.pengayaanRemedial}</p>

      <div class="green-banner">I. INTERAKSI GURU DENGAN ORANG TUA/WALI</div>
      <p>${rpp.interaksiOrangTua}</p>

      <div class="red-banner">LAMPIRAN</div>

      <div class="green-banner">MATERI</div>
      <p>${rpp.lampiranMateri.replace(/\n/g, "<br>")}</p>

      <div class="green-banner">DAFTAR PUSTAKA</div>
      <ul>${pustakaList}</ul>
      
      <br><br>
      <table style="border: none; margin-top: 40px; width: 100%;">
        <tr style="border: none;">
          <td style="border: none; width: 50%;">
            Mengetahui,<br>
            Kepala Madrasah / Sekolah<br><br><br><br>
            _______________________<br>
            NIP.
          </td>
          <td style="border: none; width: 50%; text-align: right;">
            Guru Mata Pelajaran<br><br><br><br>
            ${identitas.namaGuru}<br>
            NIP. ${identitas.nIP || "-"}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generateProtaDoc(identitas: Identitas, cp: string, chapters: Chapter[], ganjilWeeks: MingguEfektifDetail[], genapWeeks: MingguEfektifDetail[]): string {
  const ganjilRows = chapters
    .filter(c => c.semester === 1)
    .map((c, i) => `
      <tr>
        <td class="text-center">${i + 1}</td>
        <td>${c.materiPokok}</td>
        <td class="text-center">${c.alokasiWaktuJP} JP</td>
        <td>${c.tujuanPembelajaran[0] || "-"}</td>
      </tr>
    `).join("");

  const genapRows = chapters
    .filter(c => c.semester === 2)
    .map((c, i) => `
      <tr>
        <td class="text-center">${i + 1}</td>
        <td>${c.materiPokok}</td>
        <td class="text-center">${c.alokasiWaktuJP} JP</td>
        <td>${c.tujuanPembelajaran[0] || "-"}</td>
      </tr>
    `).join("");

  const ganjilWeeksRows = ganjilWeeks.map((w, i) => `
    <tr>
      <td class="text-center">${i + 1}</td>
      <td>${w.bulan}</td>
      <td class="text-center">${w.jmlMinggu}</td>
      <td class="text-center">${w.mingguTidakEfektif}</td>
      <td class="text-center">${w.mingguEfektif}</td>
    </tr>
  `).join("");

  const genapWeeksRows = genapWeeks.map((w, i) => `
    <tr>
      <td class="text-center">${i + 1}</td>
      <td>${w.bulan}</td>
      <td class="text-center">${w.jmlMinggu}</td>
      <td class="text-center">${w.mingguTidakEfektif}</td>
      <td class="text-center">${w.mingguEfektif}</td>
    </tr>
  `).join("");

  const totalGanjilWeeks = ganjilWeeks.reduce((acc, curr) => acc + curr.mingguEfektif, 0);
  const totalGenapWeeks = genapWeeks.reduce((acc, curr) => acc + curr.mingguEfektif, 0);

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Program Tahunan - PROTA</title>
      ${wordStyles}
    </head>
    <body>
      <h1>PROGRAM TAHUNAN (PROTA)</h1>
      <h3 style="text-align: center; font-size: 12pt; margin-top: -15px; margin-bottom: 25px; color: #475569;">KURIKULUM MERDEKA</h3>

      <h2>A. IDENTITAS</h2>
      <table class="identitas-table">
        <tr>
          <td style="width: 200px; font-weight: bold;">Satuan Pendidikan</td>
          <td style="width: 15px;">:</td>
          <td>${identitas.namaSekolah}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Mata Pelajaran</td>
          <td>:</td>
          <td>${identitas.mataPelajaran}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Fase / Kelas</td>
          <td>:</td>
          <td>${identitas.fase} / ${identitas.kelas}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Tahun Pelajaran</td>
          <td>:</td>
          <td>${identitas.tahunPelajaran}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Kurikulum</td>
          <td>:</td>
          <td>${identitas.kurikulum}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Nama Guru</td>
          <td>:</td>
          <td>${identitas.namaGuru}</td>
        </tr>
      </table>

      <h2>B. CAPAIAN PEMBELAJARAN (FASE ${identitas.fase})</h2>
      <p style="text-align: justify; background-color: #f8fafc; padding: 12px; border: 1px solid #e2e8f0; border-radius: 4px;">
        ${cp}
      </p>

      <h2>C. TUJUAN PEMBELAJARAN PER SEMESTER (RINGKASAN)</h2>
      <p>Pembelajaran mata pelajaran ${identitas.mataPelajaran} diorientasikan pada pemahaman materi pokok, pembentukan karakter Profil Pelajar Pancasila, dan penguasaan kompetensi dasar Kurikulum Merdeka secara kontekstual.</p>

      <h2>D. DISTRIBUSI PROGRAM TAHUNAN</h2>
      
      <h3 style="color: #1e3a8a; font-weight: bold; margin-top: 15px;">1. Semester 1 (Ganjil)</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 8%; text-align: center;">No</th>
            <th style="width: 45%;">Materi Pokok</th>
            <th style="width: 15%; text-align: center;">Alokasi Waktu</th>
            <th>Tujuan Pembelajaran (Utama)</th>
          </tr>
        </thead>
        <tbody>
          ${ganjilRows || '<tr><td colspan="4" class="text-center">Belum ada materi untuk Semester 1</td></tr>'}
        </tbody>
      </table>

      <h3 style="color: #1e3a8a; font-weight: bold; margin-top: 15px;">2. Semester 2 (Genap)</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 8%; text-align: center;">No</th>
            <th style="width: 45%;">Materi Pokok</th>
            <th style="width: 15%; text-align: center;">Alokasi Waktu</th>
            <th>Tujuan Pembelajaran (Utama)</th>
          </tr>
        </thead>
        <tbody>
          ${genapRows || '<tr><td colspan="4" class="text-center">Belum ada materi untuk Semester 2</td></tr>'}
        </tbody>
      </table>

      <h2>E. RINCIAN MINGGU EFEKTIF</h2>
      
      <h3 style="color: #1e3a8a; font-weight: bold; margin-top: 15px;">1. Semester 1 (Ganjil)</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 8%; text-align: center;">No</th>
            <th style="width: 32%;">Bulan</th>
            <th style="width: 20%; text-align: center;">Jml Minggu</th>
            <th style="width: 20%; text-align: center;">Minggu Tidak Efektif</th>
            <th style="width: 20%; text-align: center;">Minggu Efektif</th>
          </tr>
        </thead>
        <tbody>
          ${ganjilWeeksRows}
          <tr class="bg-blue-light" style="font-weight: bold;">
            <td colspan="2" class="text-center">Total Minggu Efektif Semester Ganjil</td>
            <td colspan="3" class="text-center">${totalGanjilWeeks} Minggu</td>
          </tr>
        </tbody>
      </table>

      <h3 style="color: #1e3a8a; font-weight: bold; margin-top: 15px;">2. Semester 2 (Genap)</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 8%; text-align: center;">No</th>
            <th style="width: 32%;">Bulan</th>
            <th style="width: 20%; text-align: center;">Jml Minggu</th>
            <th style="width: 20%; text-align: center;">Minggu Tidak Efektif</th>
            <th style="width: 20%; text-align: center;">Minggu Efektif</th>
          </tr>
        </thead>
        <tbody>
          ${genapWeeksRows}
          <tr class="bg-blue-light" style="font-weight: bold;">
            <td colspan="2" class="text-center">Total Minggu Efektif Semester Genap</td>
            <td colspan="3" class="text-center">${totalGenapWeeks} Minggu</td>
          </tr>
        </tbody>
      </table>

      <h2>F. ALOKASI WAKTU KEGIATAN NON-TATAP MUKA</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 8%; text-align: center;">No</th>
            <th style="width: 52%;">Kegiatan</th>
            <th style="width: 20%; text-align: center;">Semester 1</th>
            <th style="width: 20%; text-align: center;">Semester 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td>Asesmen Sumatif Tengah Semester (ASTS)</td>
            <td class="text-center">1 Minggu</td>
            <td class="text-center">1 Minggu</td>
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td>Asesmen Sumatif Akhir Semester (ASAS)</td>
            <td class="text-center">1 Minggu</td>
            <td class="text-center">1 Minggu</td>
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td>Cadangan Waktu Pembelajaran</td>
            <td class="text-center">1 Minggu</td>
            <td class="text-center">1 Minggu</td>
          </tr>
        </tbody>
      </table>

      <h2>G. KETERANGAN TAMBAHAN</h2>
      <p>Distribusi ini direncanakan secara ideal untuk mengcover seluruh indikator capaian kurikulum nasional.</p>

      <br><br>
      <table style="border: none; margin-top: 40px; width: 100%;">
        <tr style="border: none;">
          <td style="border: none; width: 50%;">
            Mengetahui,<br>
            Kepala Madrasah / Sekolah<br><br><br><br>
            _______________________<br>
            NIP.
          </td>
          <td style="border: none; width: 50%; text-align: right;">
            Guru Mata Pelajaran<br><br><br><br>
            ${identitas.namaGuru}<br>
            NIP. ${identitas.nIP || "-"}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generateProsemDoc(identitas: Identitas, chapters: Chapter[], semesterNum: 1 | 2): string {
  const currentSemesterChapters = chapters.filter(c => c.semester === semesterNum);
  const months = semesterNum === 1 
    ? ["Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    : ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];
  
  // Create table rows representing Chapters and scheduled weeks
  const chapterRows = currentSemesterChapters.map((c, idx) => {
    // Determine cell classes based on duration and start month
    const cells: string[] = [];
    const totalCols = 24; // 6 months * 4 weeks
    const startCol = (c.startMonthIndex * 4);
    const endCol = startCol + c.durationWeeks;

    for (let col = 0; col < totalCols; col++) {
      const isFilled = col >= startCol && col < endCol;
      cells.push(`
        <td style="border: 1px solid #cbd5e1; width: 3%; text-align: center; ${isFilled ? "background-color: #93c5fd;" : ""}">
          ${isFilled ? "X" : ""}
        </td>
      `);
    }

    return `
      <tr>
        <td style="text-align: center; border: 1px solid #cbd5e1;">${idx + 1}</td>
        <td style="border: 1px solid #cbd5e1; font-weight: bold;">${c.materiPokok}</td>
        <td style="text-align: center; border: 1px solid #cbd5e1;">${c.alokasiWaktuJP} JP</td>
        ${cells.join("")}
      </tr>
    `;
  }).join("");

  // Build Month headers spanning 4 weeks each
  const monthHeaders = months.map(m => `
    <th colspan="4" style="border: 1px solid #cbd5e1; text-align: center; background-color: #1e3a8a; color: white;">${m}</th>
  `).join("");

  // Build week columns (1 to 24)
  const weekCols: string[] = [];
  for (let i = 1; i <= 24; i++) {
    weekCols.push(`<th style="border: 1px solid #cbd5e1; text-align: center; background-color: #3b82f6; color: white; font-size: 7.5pt;">${(i - 1) % 4 + 1}</th>`);
  }

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Program Semester - PROSEM Semester ${semesterNum}</title>
      ${wordStyles}
    </head>
    <body>
      <h1>PROGRAM SEMESTER (PROSEM)</h1>
      <h3 style="text-align: center; font-size: 12pt; margin-top: -15px; margin-bottom: 25px; color: #475569;">
        SEMESTER ${semesterNum === 1 ? "1 (GANJIL)" : "2 (GENAP)"} — TAHUN AJARAN ${identitas.tahunPelajaran}
      </h3>

      <h2>A. IDENTITAS</h2>
      <table class="identitas-table">
        <tr>
          <td style="width: 200px; font-weight: bold;">Satuan Pendidikan</td>
          <td style="width: 15px;">:</td>
          <td>${identitas.namaSekolah}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Mata Pelajaran</td>
          <td>:</td>
          <td>${identitas.mataPelajaran}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Fase / Kelas</td>
          <td>:</td>
          <td>${identitas.fase} / ${identitas.kelas}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Tahun Pelajaran</td>
          <td>:</td>
          <td>${identitas.tahunPelajaran}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Kurikulum</td>
          <td>:</td>
          <td>${identitas.kurikulum}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Nama Guru</td>
          <td>:</td>
          <td>${identitas.namaGuru}</td>
        </tr>
      </table>

      <h2>B. MATERI POKOK DAN ALOKASI WAKTU</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 8%; text-align: center;">No</th>
            <th style="width: 62%;">Materi Pokok</th>
            <th style="width: 30%; text-align: center;">Alokasi Waktu (JP)</th>
          </tr>
        </thead>
        <tbody>
          ${currentSemesterChapters.map((c, i) => `
            <tr>
              <td class="text-center">${i + 1}</td>
              <td>${c.materiPokok}</td>
              <td class="text-center">${c.alokasiWaktuJP} JP</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <h2>C. MATRIKS PROGRAM SEMESTER ${semesterNum === 1 ? "1 (GANJIL)" : "2 (GENAP)"}</h2>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
        <thead>
          <tr>
            <th rowspan="2" style="border: 1px solid #cbd5e1; text-align: center; background-color: #1e3a8a; color: white; width: 3%;">No</th>
            <th rowspan="2" style="border: 1px solid #cbd5e1; text-align: center; background-color: #1e3a8a; color: white; width: 25%;">Materi Pokok / Kegiatan</th>
            <th rowspan="2" style="border: 1px solid #cbd5e1; text-align: center; background-color: #1e3a8a; color: white; width: 6%;">JP</th>
            ${monthHeaders}
          </tr>
          <tr>
            ${weekCols.join("")}
          </tr>
        </thead>
        <tbody>
          ${chapterRows}
        </tbody>
      </table>

      <div style="margin-top: 15px;">
        <span class="legend-box" style="background-color: #93c5fd;"></span> 
        <span style="font-size: 9.5pt; font-weight: bold;">Keterangan:</span> 
        <span style="font-size: 9.5pt;">Kegiatan Tatap Muka & Pembelajaran Efektif di Kelas</span>
      </div>

      <h2>D. KETERANGAN TAMBAHAN</h2>
      <p>Pembagian per minggu dapat bergeser menyesuaikan dinamika kalender pendidikan madrasah / sekolah.</p>

      <br><br>
      <table style="border: none; margin-top: 40px; width: 100%;">
        <tr style="border: none;">
          <td style="border: none; width: 50%;">
            Mengetahui,<br>
            Kepala Madrasah / Sekolah<br><br><br><br>
            _______________________<br>
            NIP.
          </td>
          <td style="border: none; width: 50%; text-align: right;">
            Guru Mata Pelajaran<br><br><br><br>
            ${identitas.namaGuru}<br>
            NIP. ${identitas.nIP || "-"}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
