import React, { useState, useEffect } from "react";
import { Identitas, Chapter } from "../types";
import { generateProsemDoc, downloadFile } from "../lib/exporter";
import { Download, Printer, CalendarDays, MousePointerClick } from "lucide-react";

interface ProsemPreviewProps {
  identitas: Identitas;
  chapters: Chapter[];
  onChaptersChange: (chapters: Chapter[]) => void;
}

export const ProsemPreview: React.FC<ProsemPreviewProps> = ({
  identitas,
  chapters,
  onChaptersChange,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);

  const months = selectedSemester === 1
    ? ["Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    : ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];

  const currentChapters = chapters.filter((c) => c.semester === selectedSemester);

  // Initialize scheduleData for each chapter if not already present
  useEffect(() => {
    let needsUpdate = false;
    const initialized = chapters.map((c) => {
      if (!c.scheduleData) {
        needsUpdate = true;
        const initialSchedule = Array(24).fill(false); // 6 months * 4 weeks = 24 weeks
        // Pre-fill based on startMonthIndex and duration
        const startIdx = (c.startMonthIndex * 4);
        const endIdx = Math.min(24, startIdx + c.durationWeeks);
        for (let i = startIdx; i < endIdx; i++) {
          initialSchedule[i] = true;
        }
        return { ...c, scheduleData: initialSchedule };
      }
      return c;
    });

    if (needsUpdate) {
      onChaptersChange(initialized);
    }
  }, [chapters, onChaptersChange]);

  // Click on cell to toggle week schedule
  const handleToggleCell = (chapterId: string, cellIndex: number) => {
    const updated = chapters.map((c) => {
      if (c.id === chapterId && c.scheduleData) {
        const sched = [...c.scheduleData];
        sched[cellIndex] = !sched[cellIndex];
        return { ...c, scheduleData: sched };
      }
      return c;
    });
    onChaptersChange(updated);
  };

  const handleDownloadProsem = () => {
    // Generate document with exact color indicators
    const htmlContent = generateProsemDoc(identitas, chapters, selectedSemester);
    const filename = `PROSEM_S${selectedSemester}_${identitas.mataPelajaran.replace(/\s+/g, "_")}_${identitas.tahunPelajaran.replace(/\//g, "-")}.doc`;
    downloadFile(htmlContent, filename, "application/msword");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto space-y-6" id="prosem-preview">
      {/* Top Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <CalendarDays size={22} id="calendar-days-icon" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Program Semester (PROSEM)</h2>
            <p className="text-xs text-slate-500">Matriks perencanaan pengajaran rinci tiap bab per minggu dalam enam bulan semester.</p>
          </div>
        </div>

        <div className="flex space-x-2 print:hidden">
          <button
            onClick={handleDownloadProsem}
            className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow transition-all"
            id="btn-download-prosem"
          >
            <Download size={14} />
            <span>Unduh PROSEM (.doc)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="py-1.5 px-3.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow transition-all"
            id="btn-print-prosem"
          >
            <Printer size={14} />
            <span>Cetak PROSEM</span>
          </button>
        </div>
      </div>

      {/* Semester Selector Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 print:hidden">
        <button
          onClick={() => setSelectedSemester(1)}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
            selectedSemester === 1
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          id="tab-semester-1"
        >
          SEMESTER 1 (GANJIL)
        </button>
        <button
          onClick={() => setSelectedSemester(2)}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
            selectedSemester === 2
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          id="tab-semester-2"
        >
          SEMESTER 2 (GENAP)
        </button>
      </div>

      <div className="border border-slate-300 rounded-lg p-8 bg-white max-w-[21cm] mx-auto shadow-lg print:border-0 print:p-0 print:shadow-none font-sans leading-relaxed text-slate-800" id="prosem-sheet">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-slate-200 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">PROGRAM SEMESTER (PROSEM)</h1>
          <h2 className="text-md font-semibold text-slate-500 uppercase mt-0.5">
            SEMESTER {selectedSemester === 1 ? "1 (GANJIL)" : "2 (GENAP)"} — TAHUN AJARAN {identitas.tahunPelajaran}
          </h2>
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

        {/* B. MATERI POKOK */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 text-sm mb-2 uppercase border-b border-slate-100 pb-1">B. MATERI POKOK DAN ALOKASI WAKTU</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-12">No</th>
                  <th className="border border-slate-300 p-2 text-left font-bold text-slate-700">Materi Pokok / Bab</th>
                  <th className="border border-slate-300 p-2 text-center font-bold text-slate-700 w-32">Alokasi Waktu (JP)</th>
                </tr>
              </thead>
              <tbody>
                {currentChapters.map((c, i) => (
                  <tr key={c.id}>
                    <td className="border border-slate-300 p-2 text-center text-slate-500">{i + 1}</td>
                    <td className="border border-slate-300 p-2 font-medium text-slate-800">{c.materiPokok}</td>
                    <td className="border border-slate-300 p-2 text-center text-slate-600">{c.alokasiWaktuJP} JP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* C. INTERACTIVE MATRIX */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 text-sm mb-2 uppercase border-b border-slate-100 pb-1">C. MATRIKS PROGRAM SEMESTER</h3>
          
          <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg flex items-center space-x-2.5 mb-4 print:hidden">
            <MousePointerClick size={16} className="text-indigo-600 flex-shrink-0" />
            <p className="text-xs text-indigo-800 leading-normal">
              <strong>Interactive Grid:</strong> Klik sel kotak minggu di bawah ini untuk mengaktifkan/menonaktifkan jadwal pengajaran bab secara langsung!
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-[10px] min-w-[650px]">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th rowSpan={2} className="border border-slate-300 p-1 text-center w-8">No</th>
                  <th rowSpan={2} className="border border-slate-300 p-1 text-left w-64">Materi Pokok / Kegiatan</th>
                  <th rowSpan={2} className="border border-slate-300 p-1 text-center w-12">JP</th>
                  {months.map((m, idx) => (
                    <th key={idx} colSpan={4} className="border border-slate-300 p-1 text-center text-xs tracking-wider">
                      {m}
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-700 text-white">
                  {/* Generate 24 week cells headers (1-4 repeated for 6 months) */}
                  {Array(24)
                    .fill(null)
                    .map((_, i) => (
                      <th key={i} className="border border-slate-300 p-0.5 text-center text-[9px] w-6">
                        {(i % 4) + 1}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {currentChapters.length === 0 ? (
                  <tr>
                    <td colSpan={27} className="border border-slate-300 p-6 text-center text-slate-400">
                      Belum ada bab/materi. Buat struktur kurikulum dengan AI terlebih dahulu.
                    </td>
                  </tr>
                ) : (
                  currentChapters.map((chapter, idx) => (
                    <tr key={chapter.id} className="hover:bg-slate-50 transition-colors">
                      <td className="border border-slate-300 p-1.5 text-center text-slate-500">{idx + 1}</td>
                      <td className="border border-slate-300 p-1.5 font-semibold text-slate-700 max-w-xs truncate">
                        {chapter.materiPokok}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-center font-bold text-slate-600">
                        {chapter.alokasiWaktuJP} JP
                      </td>
                      {/* Interactive Week Toggle Cells */}
                      {Array(24)
                        .fill(null)
                        .map((_, i) => {
                          const isFilled = chapter.scheduleData ? chapter.scheduleData[i] : false;
                          return (
                            <td
                              key={i}
                              onClick={() => handleToggleCell(chapter.id, i)}
                              className={`border border-slate-300 p-1 text-center cursor-pointer select-none transition-all print:cursor-default ${
                                isFilled
                                  ? "bg-indigo-500 text-white font-bold"
                                  : "bg-white hover:bg-indigo-50"
                              }`}
                              title={`Semester ${selectedSemester} - ${months[Math.floor(i / 4)]} Minggu ${(i % 4) + 1}`}
                            >
                              {isFilled ? "✓" : ""}
                            </td>
                          );
                        })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend / Keterangan warna */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-indigo-500 border border-slate-400 rounded"></div>
            <span className="text-xs text-slate-600 font-medium">Jam Pelajaran / Pengajaran Efektif</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-white border border-slate-300 rounded"></div>
            <span className="text-xs text-slate-600 font-medium">Kosong / Kegiatan Lain</span>
          </div>
        </div>

        {/* D. KETERANGAN TAMBAHAN */}
        <div className="mb-6">
          <h3 className="font-bold text-slate-800 text-sm mb-2 uppercase border-b border-slate-100 pb-1">D. KETERANGAN TAMBAHAN</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify">
            Waktu pelaksanaan pengajaran di atas dirancang fleksibel. Apabila terjadi hari libur nasional di luar perkiraan kalender akademik atau kegiatan madrasah yang mendesak, guru berhak menyesuaikan alokasi waktu JP tanpa mengurangi materi pokok esensial.
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
