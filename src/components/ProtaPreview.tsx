import React from "react";
import { Identitas, Chapter, MingguEfektifDetail } from "../types";
import { generateProtaDoc, downloadFile } from "../lib/exporter";
import { Download, Printer, CalendarRange, Info } from "lucide-react";

interface ProtaPreviewProps {
  identitas: Identitas;
  capaianPembelajaran: string;
  chapters: Chapter[];
  ganjilWeeks: MingguEfektifDetail[];
  genapWeeks: MingguEfektifDetail[];
  onGanjilWeeksChange: (weeks: MingguEfektifDetail[]) => void;
  onGenapWeeksChange: (weeks: MingguEfektifDetail[]) => void;
}

export const ProtaPreview: React.FC<ProtaPreviewProps> = ({
  identitas,
  capaianPembelajaran,
  chapters,
  ganjilWeeks,
  genapWeeks,
  onGanjilWeeksChange,
  onGenapWeeksChange,
}) => {
  const ganjilChapters = chapters.filter((c) => c.semester === 1);
  const genapChapters = chapters.filter((c) => c.semester === 2);

  // Totals calculation
  const totalGanjilWeeks = ganjilWeeks.reduce((sum, curr) => sum + curr.mingguEfektif, 0);
  const totalGenapWeeks = genapWeeks.reduce((sum, curr) => sum + curr.mingguEfektif, 0);

  const handleWeekValueChange = (
    semester: 1 | 2,
    index: number,
    field: "jmlMinggu" | "mingguTidakEfektif",
    val: number
  ) => {
    const targetList = semester === 1 ? [...ganjilWeeks] : [...genapWeeks];
    const item = { ...targetList[index] };
    item[field] = val;
    // Recalculate mingguEfektif
    item.mingguEfektif = Math.max(0, item.jmlMinggu - item.mingguTidakEfektif);
    targetList[index] = item;

    if (semester === 1) {
      onGanjilWeeksChange(targetList);
    } else {
      onGenapWeeksChange(targetList);
    }
  };

  const handleKeteranganChange = (semester: 1 | 2, index: number, val: string) => {
    const targetList = semester === 1 ? [...ganjilWeeks] : [...genapWeeks];
    const item = { ...targetList[index] };
    item.keterangan = val;
    targetList[index] = item;

    if (semester === 1) {
      onGanjilWeeksChange(targetList);
    } else {
      onGenapWeeksChange(targetList);
    }
  };

  const handleDownloadProta = () => {
    const htmlContent = generateProtaDoc(identitas, capaianPembelajaran, chapters, ganjilWeeks, genapWeeks);
    const filename = `PROTA_${identitas.mataPelajaran.replace(/\s+/g, "_")}_${identitas.tahunPelajaran.replace(/\//g, "-")}.doc`;
    downloadFile(htmlContent, filename, "application/msword");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto space-y-6" id="prota-preview">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <CalendarRange size={22} id="calendar-icon" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Program Tahunan (PROTA)</h2>
            <p className="text-xs text-slate-500">Rekapitulasi distribusi bab dan perhitungan alokasi jam mengajar dalam satu tahun pelajaran.</p>
          </div>
        </div>

        <div className="flex space-x-2 print:hidden">
          <button
            onClick={handleDownloadProta}
            className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow transition-all"
            id="btn-download-prota"
          >
            <Download size={14} />
            <span>Unduh PROTA (.doc)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="py-1.5 px-3.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow transition-all"
            id="btn-print-prota"
          >
            <Printer size={14} />
            <span>Cetak PROTA</span>
          </button>
        </div>
      </div>

      <div className="border border-slate-300 rounded-lg p-8 bg-white max-w-[21cm] mx-auto shadow-lg print:border-0 print:p-0 print:shadow-none font-sans leading-relaxed text-slate-800" id="prota-sheet">
        {/* PROTA Header */}
        <div className="text-center mb-8 border-b-2 border-slate-200 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">PROGRAM TAHUNAN (PROTA)</h1>
          <h2 className="text-md font-semibold text-slate-500 uppercase mt-0.5">KURIKULUM MERDEKA</h2>
        </div>

        {/* A. IDENTITAS */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 text-sm mb-2 uppercase border-b border-slate-100 pb-1">A. IDENTITAS</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-none mb-4">
              <tbody>
                <tr className="border-none">
                  <td className="border-none py-1.5 w-1/3 font-semibold text-slate-600">Satuan Pendidikan</td>
                  <td className="border-none py-1.5 w-4">:</td>
                  <td className="border-none py-1.5 text-slate-800">{identitas.namaSekolah}</td>
                </tr>
                <tr className="border-none">
                  <td className="border-none py-1.5 font-semibold text-slate-600">Mata Pelajaran</td>
                  <td className="border-none py-1.5">:</td>
                  <td className="border-none py-1.5 text-slate-800">{identitas.mataPelajaran}</td>
                </tr>
                <tr className="border-none">
                  <td className="border-none py-1.5 font-semibold text-slate-600">Fase / Kelas</td>
                  <td className="border-none py-1.5">:</td>
                  <td className="border-none py-1.5 text-slate-800">{identitas.fase} / {identitas.kelas}</td>
                </tr>
                <tr className="border-none">
                  <td className="border-none py-1.5 font-semibold text-slate-600">Tahun Pelajaran</td>
                  <td className="border-none py-1.5">:</td>
                  <td className="border-none py-1.5 text-slate-800">{identitas.tahunPelajaran}</td>
                </tr>
                <tr className="border-none">
                  <td className="border-none py-1.5 font-semibold text-slate-600">Kurikulum</td>
                  <td className="border-none py-1.5">:</td>
                  <td className="border-none py-1.5 text-slate-800">{identitas.kurikulum}</td>
                </tr>
                <tr className="border-none">
                  <td className="border-none py-1.5 font-semibold text-slate-600">Nama Guru</td>
                  <td className="border-none py-1.5">:</td>
                  <td className="border-none py-1.5 text-slate-800">{identitas.namaGuru}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* B. CAPAIAN PEMBELAJARAN */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 text-sm mb-2 uppercase border-b border-slate-100 pb-1">B. CAPAIAN PEMBELAJARAN (FASE {identitas.fase})</h3>
          <p className="text-slate-700 text-sm text-justify leading-relaxed bg-slate-50 p-3.5 border border-slate-200 rounded-lg italic">
            "{capaianPembelajaran || "Syllabus belum dimuat. Mohon klik tombol Rekomendasi AI di atas."}"
          </p>
        </div>

        {/* C. TUJUAN PEMBELAJARAN PER SEMESTER (RINGKASAN) */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 text-sm mb-2 uppercase border-b border-slate-100 pb-1">C. TUJUAN PEMBELAJARAN PER SEMESTER (RINGKASAN)</h3>
          <p className="text-slate-700 text-sm leading-relaxed">
            Materi ajar diorganisir secara tematik untuk menguatkan pemahaman konseptual dan aplikasi keterampilan siswa secara kontekstual sesuai dengan karakter dan tuntutan Kurikulum Merdeka.
          </p>
        </div>

        {/* D. DISTRIBUSI PROGRAM TAHUNAN */}
        <div className="mb-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase border-b border-slate-100 pb-1">D. DISTRIBUSI PROGRAM TAHUNAN</h3>
          
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">1. Semester 1 (Ganjil)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-12">No</th>
                    <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Materi Pokok / Bab</th>
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-32">Alokasi Waktu</th>
                    <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Tujuan Pembelajaran Utama</th>
                  </tr>
                </thead>
                <tbody>
                  {ganjilChapters.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="border border-slate-300 p-4 text-center text-slate-400">Belum ada materi terdaftar</td>
                    </tr>
                  ) : (
                    ganjilChapters.map((c, idx) => (
                      <tr key={c.id}>
                        <td className="border border-slate-300 p-2 text-center text-slate-600">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-medium text-slate-800">{c.materiPokok}</td>
                        <td className="border border-slate-300 p-2 text-center text-slate-600">{c.alokasiWaktuJP} JP</td>
                        <td className="border border-slate-300 p-2 text-slate-600 text-justify">{c.tujuanPembelajaran[0] || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">2. Semester 2 (Genap)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-12">No</th>
                    <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Materi Pokok / Bab</th>
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-32">Alokasi Waktu</th>
                    <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Tujuan Pembelajaran Utama</th>
                  </tr>
                </thead>
                <tbody>
                  {genapChapters.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="border border-slate-300 p-4 text-center text-slate-400">Belum ada materi terdaftar</td>
                    </tr>
                  ) : (
                    genapChapters.map((c, idx) => (
                      <tr key={c.id}>
                        <td className="border border-slate-300 p-2 text-center text-slate-600">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-medium text-slate-800">{c.materiPokok}</td>
                        <td className="border border-slate-300 p-2 text-center text-slate-600">{c.alokasiWaktuJP} JP</td>
                        <td className="border border-slate-300 p-2 text-slate-600 text-justify">{c.tujuanPembelajaran[0] || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* E. RINCIAN MINGGU EFEKTIF */}
        <div className="mb-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase border-b border-slate-100 pb-1">E. RINCIAN MINGGU EFEKTIF</h3>
          
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-start space-x-2.5 print:hidden">
            <Info size={16} className="text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-800 leading-normal">
              <strong>Tips Guru:</strong> Anda dapat mengedit jumlah minggu total, minggu tidak efektif, dan keterangan bulan langsung pada tabel di bawah ini. Nilai minggu efektif dan total semester akan terhitung secara otomatis!
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">1. Semester 1 (Ganjil)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-12">No</th>
                    <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Bulan</th>
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-24">Jml Minggu</th>
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-24">Minggu Tidak Efektif</th>
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-24">Minggu Efektif</th>
                    <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {ganjilWeeks.map((w, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-300 p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-semibold text-slate-700">{w.bulan}</td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        <input
                          type="number"
                          value={w.jmlMinggu}
                          onChange={(e) => handleWeekValueChange(1, idx, "jmlMinggu", parseInt(e.target.value) || 0)}
                          className="w-14 px-1 py-0.5 text-center border border-slate-200 rounded text-xs print:border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        <input
                          type="number"
                          value={w.mingguTidakEfektif}
                          onChange={(e) => handleWeekValueChange(1, idx, "mingguTidakEfektif", parseInt(e.target.value) || 0)}
                          className="w-14 px-1 py-0.5 text-center border border-slate-200 rounded text-xs print:border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-600">{w.mingguEfektif}</td>
                      <td className="border border-slate-300 p-1.5">
                        <input
                          type="text"
                          value={w.keterangan}
                          onChange={(e) => handleKeteranganChange(1, idx, e.target.value)}
                          className="w-full px-2 py-0.5 border border-slate-200 rounded text-xs print:border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/50 font-bold">
                    <td colSpan={2} className="border border-slate-300 p-2.5 text-center text-slate-700">Total Minggu Efektif Semester Ganjil</td>
                    <td colSpan={4} className="border border-slate-300 p-2.5 text-center text-emerald-700 text-md">{totalGanjilWeeks} Minggu Efektif</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">2. Semester 2 (Genap)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-12">No</th>
                    <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Bulan</th>
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-24">Jml Minggu</th>
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-24">Minggu Tidak Efektif</th>
                    <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-24">Minggu Efektif</th>
                    <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {genapWeeks.map((w, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-300 p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-semibold text-slate-700">{w.bulan}</td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        <input
                          type="number"
                          value={w.jmlMinggu}
                          onChange={(e) => handleWeekValueChange(2, idx, "jmlMinggu", parseInt(e.target.value) || 0)}
                          className="w-14 px-1 py-0.5 text-center border border-slate-200 rounded text-xs print:border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center">
                        <input
                          type="number"
                          value={w.mingguTidakEfektif}
                          onChange={(e) => handleWeekValueChange(2, idx, "mingguTidakEfektif", parseInt(e.target.value) || 0)}
                          className="w-14 px-1 py-0.5 text-center border border-slate-200 rounded text-xs print:border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-indigo-600">{w.mingguEfektif}</td>
                      <td className="border border-slate-300 p-1.5">
                        <input
                          type="text"
                          value={w.keterangan}
                          onChange={(e) => handleKeteranganChange(2, idx, e.target.value)}
                          className="w-full px-2 py-0.5 border border-slate-200 rounded text-xs print:border-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-indigo-50/50 font-bold">
                    <td colSpan={2} className="border border-slate-300 p-2.5 text-center text-slate-700">Total Minggu Efektif Semester Genap</td>
                    <td colSpan={4} className="border border-slate-300 p-2.5 text-center text-indigo-700 text-md">{totalGenapWeeks} Minggu Efektif</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* F. ALOKASI WAKTU KEGIATAN NON-TATAP MUKA */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 text-sm mb-2 uppercase border-b border-slate-100 pb-1">F. ALOKASI WAKTU KEGIATAN NON-TATAP MUKA</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-12">No</th>
                  <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Kegiatan Akademik Non-Tatap Muka</th>
                  <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-32">Semester 1 (Ganjil)</th>
                  <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-32">Semester 2 (Genap)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-2 text-center text-slate-500">1</td>
                  <td className="border border-slate-300 p-2 font-medium text-slate-800">Asesmen Sumatif Tengah Semester (ASTS)</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-600">1 Minggu</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-600">1 Minggu</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center text-slate-500">2</td>
                  <td className="border border-slate-300 p-2 font-medium text-slate-800">Asesmen Sumatif Akhir Semester (ASAS) / Kelulusan</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-600">1 Minggu</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-600">1 Minggu</td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-2 text-center text-slate-500">3</td>
                  <td className="border border-slate-300 p-2 font-medium text-slate-800">Cadangan Waktu & Pembagian Rapor</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-600">1 Minggu</td>
                  <td className="border border-slate-300 p-2 text-center text-slate-600">1 Minggu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* G. KETERANGAN TAMBAHAN */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 text-sm mb-2 uppercase border-b border-slate-100 pb-1">G. KETERANGAN TAMBAHAN</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Rincian Program Tahunan ini dibuat sebagai panduan kerja instruksional guru selama periode 1 tahun pelajaran untuk menjaga keteraturan dan proporsionalitas pengajaran kompetensi kurikuler nasional.
          </p>
        </div>

        {/* SIGNATURES SECTION */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 text-xs sm:text-sm">
          <div>
            <p>Mengetahui,</p>
            <p className="font-semibold text-slate-700">Kepala Madrasah / Sekolah</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-800">__________________________</p>
            <p className="text-slate-500">NIP.</p>
          </div>
          <div className="text-right">
            <p>Yogyakarta, {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
            <p className="font-semibold text-slate-700">Guru Mata Pelajaran</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-800">{identitas.namaGuru}</p>
            <p className="text-slate-500">NIP. {identitas.nIP || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
