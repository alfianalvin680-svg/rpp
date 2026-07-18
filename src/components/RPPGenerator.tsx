import React, { useState } from "react";
import { Identitas, Chapter, RPPData } from "../types";
import { generateRPPDoc, downloadFile } from "../lib/exporter";
import { Sparkles, Download, Printer, Edit3, Check, FileText } from "lucide-react";

interface RPPGeneratorProps {
  identitas: Identitas;
  chapters: Chapter[];
}

export const RPPGenerator: React.FC<RPPGeneratorProps> = ({ identitas, chapters }) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [rppData, setRppData] = useState<RPPData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Find selected chapter
  const currentChapter = chapters.find((c) => c.id === selectedChapterId);

  // Trigger AI generation
  const handleGenerateRPP = async () => {
    if (!currentChapter) return;
    setLoading(true);
    setRppData(null);

    try {
      const response = await fetch("/api/generate-rpp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mataPelajaran: identitas.mataPelajaran,
          fase: identitas.fase,
          kelas: identitas.kelas,
          semester: currentChapter.semester === 1 ? "Ganjil" : "Genap",
          tahunPelajaran: identitas.tahunPelajaran,
          materiPokok: currentChapter.materiPokok,
          alokasiWaktu: currentChapter.alokasiWaktuJP,
          tujuanPembelajaran: currentChapter.tujuanPembelajaran,
          kktp: currentChapter.kktp,
          pemahamanBermakna: currentChapter.pemahamanBermakna,
          identitasModul: {
            penyusun: identitas.namaGuru,
            namaSekolah: identitas.namaSekolah,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal generate RPP dari server.");
      }

      const data = await response.json();
      setRppData(data);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menghubungi server AI untuk generate RPP. Pastikan Anda sudah mengatur API Key di Settings.");
    } finally {
      setLoading(false);
    }
  };

  // Download DOC format
  const handleDownloadDoc = () => {
    if (!rppData || !currentChapter) return;
    const htmlContent = generateRPPDoc(identitas, currentChapter, rppData);
    const filename = `RPP_${identitas.mataPelajaran.replace(/\s+/g, "_")}_${currentChapter.materiPokok.replace(/\s+/g, "_")}.doc`;
    downloadFile(htmlContent, filename, "application/msword");
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto space-y-6" id="rpp-generator">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
          <Sparkles size={22} id="sparkles-icon" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Generator Modul Ajar (RPP) AI</h2>
          <p className="text-xs text-slate-500 font-normal">Pilih bab/materi pokok untuk memicu generator bertenaga AI melengkapi seluruh isian modul ajar.</p>
        </div>
      </div>

      {/* Chapter Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 p-4 rounded-xl">
        <div className="w-full sm:flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Bab / Materi Pokok</label>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="select-rpp-chapter"
          >
            <option value="">-- Pilih Materi untuk RPP --</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                Semester {c.semester}: {c.materiPokok} ({c.alokasiWaktuJP} JP)
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateRPP}
          disabled={loading || !selectedChapterId}
          className="w-full sm:w-auto mt-4 sm:mt-0 py-2.5 px-5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium rounded-lg text-sm shadow-md hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
          id="btn-generate-rpp"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Merancang Modul Ajar AI...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Hasilkan Modul Ajar (RPP) AI</span>
            </>
          )}
        </button>
      </div>

      {/* RPP Live Preview Sheet */}
      {rppData && currentChapter && (
        <div className="space-y-4" id="rpp-preview-section">
          <div className="flex flex-wrap gap-2 justify-end print:hidden">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="py-1.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center space-x-1.5 transition-all"
              id="btn-toggle-edit-rpp"
            >
              {isEditing ? (
                <>
                  <Check size={14} className="text-green-600" />
                  <span>Selesai Mengedit</span>
                </>
              ) : (
                <>
                  <Edit3 size={14} />
                  <span>Edit Teks Langsung</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadDoc}
              className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow transition-all"
              id="btn-download-rpp-doc"
            >
              <Download size={14} />
              <span>Unduh Word (.doc)</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-1.5 px-3.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs flex items-center space-x-1.5 shadow transition-all"
              id="btn-print-rpp"
            >
              <Printer size={14} />
              <span>Cetak Modul</span>
            </button>
          </div>

          <div className="border border-slate-300 rounded-lg p-8 bg-white max-w-[21cm] mx-auto shadow-lg print:border-0 print:p-0 print:shadow-none font-sans leading-relaxed text-slate-800" id="rpp-paper-sheet">
            {/* RPP content layout styled exactly like the provided screenshot */}
            <div className="text-center mb-8 border-b-2 border-slate-200 pb-4">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">MODUL AJAR KURIKULUM MERDEKA</h1>
              <p className="text-sm font-semibold text-slate-500 mt-1">MATA PELAJARAN: {identitas.mataPelajaran.toUpperCase()}</p>
            </div>

            {/* INFORMASI UMUM */}
            <div className="mb-6">
              <div className="bg-red-600 text-white font-bold text-sm px-3.5 py-1.5 tracking-wide mb-3 uppercase">
                INFORMASI UMUM
              </div>

              {/* A. IDENTITAS */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                A. IDENTITAS MODUL
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                <table className="w-full border-none border-collapse">
                  <tbody>
                    <tr className="border-none">
                      <td className="border-none py-1 w-1/3 font-semibold text-slate-600">Penyusun</td>
                      <td className="border-none py-1 w-4 font-normal">:</td>
                      <td className="border-none py-1 text-slate-800">{identitas.namaGuru}</td>
                    </tr>
                    <tr className="border-none">
                      <td className="border-none py-1 font-semibold text-slate-600">Nama Madrasah / Sekolah</td>
                      <td className="border-none py-1">:</td>
                      <td className="border-none py-1 text-slate-800">{identitas.namaSekolah}</td>
                    </tr>
                    <tr className="border-none">
                      <td className="border-none py-1 font-semibold text-slate-600">Tahun Penyusunan</td>
                      <td className="border-none py-1">:</td>
                      <td className="border-none py-1 text-slate-800">{identitas.tahunPelajaran}</td>
                    </tr>
                    <tr className="border-none">
                      <td className="border-none py-1 font-semibold text-slate-600">Mata Pelajaran</td>
                      <td className="border-none py-1">:</td>
                      <td className="border-none py-1 text-slate-800">{identitas.mataPelajaran}</td>
                    </tr>
                    <tr className="border-none">
                      <td className="border-none py-1 font-semibold text-slate-600">Fase / Kelas</td>
                      <td className="border-none py-1">:</td>
                      <td className="border-none py-1 text-slate-800">{identitas.fase} / {identitas.kelas}</td>
                    </tr>
                    <tr className="border-none">
                      <td className="border-none py-1 font-semibold text-slate-600">Semester</td>
                      <td className="border-none py-1">:</td>
                      <td className="border-none py-1 text-slate-800">{currentChapter.semester === 1 ? "Ganjil" : "Genap"}</td>
                    </tr>
                    <tr className="border-none">
                      <td className="border-none py-1 font-semibold text-slate-600">Materi</td>
                      <td className="border-none py-1">:</td>
                      <td className="border-none py-1 text-slate-800 font-medium">{currentChapter.materiPokok}</td>
                    </tr>
                    <tr className="border-none">
                      <td className="border-none py-1 font-semibold text-slate-600">Alokasi Waktu</td>
                      <td className="border-none py-1">:</td>
                      <td className="border-none py-1 text-slate-800">{currentChapter.alokasiWaktuJP} JP</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* B. KOMPETENSI AWAL */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                B. KOMPETENSI AWAL
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <textarea
                    value={rppData.kompetensiAwal}
                    onChange={(e) => setRppData({ ...rppData, kompetensiAwal: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-700 text-justify">{rppData.kompetensiAwal}</p>
                )}
              </div>

              {/* C. PROFIL PELAJAR PANCASILA */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                C. PROFIL PELAJAR PANCASILA
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <textarea
                    value={rppData.profilPelajarPancasila.join("\n")}
                    onChange={(e) => setRppData({ ...rppData, profilPelajarPancasila: e.target.value.split("\n") })}
                    className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
                    rows={4}
                  />
                ) : (
                  <ul className="list-disc pl-5 text-slate-700 space-y-1">
                    {rppData.profilPelajarPancasila.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* D. SARANA DAN PRASARANA */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                D. SARANA DAN PRASARANA
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <textarea
                    value={rppData.saranaPrasarana.join("\n")}
                    onChange={(e) => setRppData({ ...rppData, saranaPrasarana: e.target.value.split("\n") })}
                    className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
                    rows={4}
                  />
                ) : (
                  <ul className="list-disc pl-5 text-slate-700 space-y-1">
                    {rppData.saranaPrasarana.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* E. TARGET PESERTA DIDIK */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                E. TARGET PESERTA DIDIK
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <input
                    type="text"
                    value={rppData.targetPesertaDidik}
                    onChange={(e) => setRppData({ ...rppData, targetPesertaDidik: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                ) : (
                  <p className="text-slate-700">{rppData.targetPesertaDidik}</p>
                )}
              </div>

              {/* F. MODEL DAN METODE PEMBELAJARAN */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                F. MODEL DAN METODE PEMBELAJARAN
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <input
                    type="text"
                    value={rppData.modelMetodePembelajaran}
                    onChange={(e) => setRppData({ ...rppData, modelMetodePembelajaran: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                ) : (
                  <p className="text-slate-700">{rppData.modelMetodePembelajaran}</p>
                )}
              </div>
            </div>

            {/* KOMPONEN INTI */}
            <div className="mb-6">
              <div className="bg-red-600 text-white font-bold text-sm px-3.5 py-1.5 tracking-wide mb-3 uppercase">
                KOMPONEN INTI
              </div>

              {/* A. TUJUAN PEMBELAJARAN */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                A. TUJUAN PEMBELAJARAN
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                <ul className="list-disc pl-5 text-slate-700 space-y-1">
                  {currentChapter.tujuanPembelajaran.map((tp, idx) => (
                    <li key={idx} className="text-justify">{tp}</li>
                  ))}
                </ul>
              </div>

              {/* B. KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                B. KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                <ul className="list-disc pl-5 text-slate-700 space-y-1">
                  {currentChapter.kktp.map((k, idx) => (
                    <li key={idx} className="text-justify">{k}</li>
                  ))}
                </ul>
              </div>

              {/* C. PEMAHAMAN BERMAKNA */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                C. PEMAHAMAN BERMAKNA
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                <p className="text-slate-700 text-justify italic">"{currentChapter.pemahamanBermakna}"</p>
              </div>

              {/* E. PERSIAPAN BELAJAR */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                E. PERSIAPAN BELAJAR
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <textarea
                    value={rppData.persiapanBelajar.join("\n")}
                    onChange={(e) => setRppData({ ...rppData, persiapanBelajar: e.target.value.split("\n") })}
                    className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
                    rows={3}
                  />
                ) : (
                  <ul className="list-disc pl-5 text-slate-700 space-y-1">
                    {rppData.persiapanBelajar.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* F. KEGIATAN PEMBELAJARAN */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                F. KEGIATAN PEMBELAJARAN
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase mb-1.5">1. Kegiatan Pendahuluan</h4>
                  {isEditing ? (
                    <textarea
                      value={rppData.kegiatanPembelajaran.pendahuluan.join("\n")}
                      onChange={(e) =>
                        setRppData({
                          ...rppData,
                          kegiatanPembelajaran: { ...rppData.kegiatanPembelajaran, pendahuluan: e.target.value.split("\n") },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      rows={5}
                    />
                  ) : (
                    <ul className="list-decimal pl-5 text-slate-700 space-y-1">
                      {rppData.kegiatanPembelajaran.pendahuluan.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase mb-1.5">2. Kegiatan Inti</h4>
                  {isEditing ? (
                    <textarea
                      value={rppData.kegiatanPembelajaran.inti.join("\n")}
                      onChange={(e) =>
                        setRppData({
                          ...rppData,
                          kegiatanPembelajaran: { ...rppData.kegiatanPembelajaran, inti: e.target.value.split("\n") },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      rows={10}
                    />
                  ) : (
                    <ul className="list-decimal pl-5 text-slate-700 space-y-1">
                      {rppData.kegiatanPembelajaran.inti.map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase mb-1.5">3. Kegiatan Penutup</h4>
                  {isEditing ? (
                    <textarea
                      value={rppData.kegiatanPembelajaran.penutup.join("\n")}
                      onChange={(e) =>
                        setRppData({
                          ...rppData,
                          kegiatanPembelajaran: { ...rppData.kegiatanPembelajaran, penutup: e.target.value.split("\n") },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      rows={4}
                    />
                  ) : (
                    <ul className="list-decimal pl-5 text-slate-700 space-y-1">
                      {rppData.kegiatanPembelajaran.penutup.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* G. REFLEKSI GURU */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                G. REFLEKSI GURU
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <textarea
                    value={rppData.refleksiGuru.join("\n")}
                    onChange={(e) => setRppData({ ...rppData, refleksiGuru: e.target.value.split("\n") })}
                    className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
                    rows={4}
                  />
                ) : (
                  <ul className="list-disc pl-5 text-slate-700 space-y-1">
                    {rppData.refleksiGuru.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* H. ASESMEN / PENILAIAN */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                H. ASESMEN / PENILAIAN
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm space-y-3">
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <h5 className="font-bold text-slate-800 mb-1">Asesmen Sikap</h5>
                  {isEditing ? (
                    <textarea
                      value={rppData.asesmenPenilaian.sikap}
                      onChange={(e) =>
                        setRppData({
                          ...rppData,
                          asesmenPenilaian: { ...rppData.asesmenPenilaian, sikap: e.target.value },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                      rows={2}
                    />
                  ) : (
                    <p className="text-slate-700">{rppData.asesmenPenilaian.sikap}</p>
                  )}
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <h5 className="font-bold text-slate-800 mb-1">Asesmen Performa</h5>
                  {isEditing ? (
                    <textarea
                      value={rppData.asesmenPenilaian.performa}
                      onChange={(e) =>
                        setRppData({
                          ...rppData,
                          asesmenPenilaian: { ...rppData.asesmenPenilaian, performa: e.target.value },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded text-xs"
                      rows={2}
                    />
                  ) : (
                    <p className="text-slate-700">{rppData.asesmenPenilaian.performa}</p>
                  )}
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <h5 className="font-bold text-slate-800 mb-1">Asesmen Tertulis</h5>
                  {isEditing ? (
                    <textarea
                      value={rppData.asesmenPenilaian.tertulis}
                      onChange={(e) =>
                        setRppData({
                          ...rppData,
                          asesmenPenilaian: { ...rppData.asesmenPenilaian, tertulis: e.target.value },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded text-xs font-mono"
                      rows={8}
                    />
                  ) : (
                    <p className="text-slate-700 whitespace-pre-wrap">{rppData.asesmenPenilaian.tertulis}</p>
                  )}
                </div>
              </div>

              {/* H. KEGIATAN PENGAYAAN DAN REMEDIAL */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                H. KEGIATAN PENGAYAAN DAN REMEDIAL
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <textarea
                    value={rppData.pengayaanRemedial}
                    onChange={(e) => setRppData({ ...rppData, pengayaanRemedial: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-700 text-justify">{rppData.pengayaanRemedial}</p>
                )}
              </div>

              {/* I. INTERAKSI GURU DENGAN ORANG TUA/WALI */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                I. INTERAKSI GURU DENGAN ORANG TUA/WALI
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <textarea
                    value={rppData.interaksiOrangTua}
                    onChange={(e) => setRppData({ ...rppData, interaksiOrangTua: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                    rows={3}
                  />
                ) : (
                  <p className="text-slate-700 text-justify">{rppData.interaksiOrangTua}</p>
                )}
              </div>
            </div>

            {/* LAMPIRAN */}
            <div className="mb-6">
              <div className="bg-red-600 text-white font-bold text-sm px-3.5 py-1.5 tracking-wide mb-3 uppercase">
                LAMPIRAN
              </div>

              {/* MATERI */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                MATERI
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <textarea
                    value={rppData.lampiranMateri}
                    onChange={(e) => setRppData({ ...rppData, lampiranMateri: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-sm whitespace-pre-wrap"
                    rows={10}
                  />
                ) : (
                  <p className="text-slate-700 text-justify whitespace-pre-wrap leading-relaxed">{rppData.lampiranMateri}</p>
                )}
              </div>

              {/* DAFTAR PUSTAKA */}
              <div className="bg-green-700 text-white font-semibold text-xs px-3 py-1 mb-2 uppercase">
                DAFTAR PUSTAKA
              </div>
              <div className="pl-4 mb-4 text-xs sm:text-sm">
                {isEditing ? (
                  <textarea
                    value={rppData.daftarPustaka.join("\n")}
                    onChange={(e) => setRppData({ ...rppData, daftarPustaka: e.target.value.split("\n") })}
                    className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
                    rows={4}
                  />
                ) : (
                  <ul className="list-disc pl-5 text-slate-700 space-y-1">
                    {rppData.daftarPustaka.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
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
      )}

      {!rppData && !loading && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl" id="empty-rpp-state">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500 font-medium">Pilih salah satu bab dari daftar di atas, lalu klik "Hasilkan Modul Ajar (RPP) AI" untuk membuat dokumen RPP Kurikulum Merdeka secara otomatis.</p>
        </div>
      )}
    </div>
  );
};
