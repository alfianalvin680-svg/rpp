import { useState } from "react";
import { Identitas, SyllabusData } from "./types";
import { IdentitasForm } from "./components/IdentitasForm";
import { SyllabusPreview } from "./components/SyllabusPreview";
import { RPPGenerator } from "./components/RPPGenerator";
import { ProtaPreview } from "./components/ProtaPreview";
import { ProsemPreview } from "./components/ProsemPreview";
import { BookOpen, Sparkles, CalendarRange, CalendarDays, GraduationCap, ArrowRight } from "lucide-react";

const defaultIdentitas: Identitas = {
  namaGuru: "",
  nIP: "",
  namaSekolah: "",
  tahunPelajaran: "2025/2026",
  mataPelajaran: "",
  fase: "Fase A",
  kelas: "Kelas 1",
  semester: "Ganjil",
  kurikulum: "Kurikulum Merdeka",
};

const defaultSyllabus: SyllabusData = {
  capaianPembelajaran: "",
  kompetensiAwalDefault: "",
  profilPancasilaDefault: [],
  saranaPrasaranaDefault: [],
  targetPesertaDidikDefault: "",
  modelMetodeDefault: "",
  chapters: [],
  mingguEfektifDetailGanjil: [
    { bulan: "Juli", jmlMinggu: 4, mingguTidakEfektif: 2, mingguEfektif: 2, keterangan: "Libur Semester 2 & ASTS" },
    { bulan: "Agustus", jmlMinggu: 5, mingguTidakEfektif: 1, mingguEfektif: 4, keterangan: "HUT RI" },
    { bulan: "September", jmlMinggu: 4, mingguTidakEfektif: 1, mingguEfektif: 3, keterangan: "ASTS Ganjil" },
    { bulan: "Oktober", jmlMinggu: 4, mingguTidakEfektif: 0, mingguEfektif: 4, keterangan: "KBM Efektif" },
    { bulan: "November", jmlMinggu: 5, mingguTidakEfektif: 0, mingguEfektif: 5, keterangan: "KBM Efektif" },
    { bulan: "Desember", jmlMinggu: 4, mingguTidakEfektif: 3, mingguEfektif: 1, keterangan: "ASAS Ganjil & Libur" }
  ],
  mingguEfektifDetailGenap: [
    { bulan: "Januari", jmlMinggu: 4, mingguTidakEfektif: 1, mingguEfektif: 3, keterangan: "Libur Tahun Baru" },
    { bulan: "Februari", jmlMinggu: 4, mingguTidakEfektif: 0, mingguEfektif: 4, keterangan: "KBM Efektif" },
    { bulan: "Maret", jmlMinggu: 5, mingguTidakEfektif: 2, mingguEfektif: 3, keterangan: "ASTS Genap & Libur Ramadhan" },
    { bulan: "April", jmlMinggu: 4, mingguTidakEfektif: 2, mingguEfektif: 2, keterangan: "Libur Idul Fitri" },
    { bulan: "Mei", jmlMinggu: 5, mingguTidakEfektif: 1, mingguEfektif: 4, keterangan: "Hari Raya Waisak" },
    { bulan: "Juni", jmlMinggu: 4, mingguTidakEfektif: 3, mingguEfektif: 1, keterangan: "ASAS Genap & Kelulusan" }
  ]
};

export default function App() {
  const [identitas, setIdentitas] = useState<Identitas>(defaultIdentitas);
  const [syllabus, setSyllabus] = useState<SyllabusData>(defaultSyllabus);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"syllabus" | "rpp" | "prota" | "prosem">("syllabus");

  const handleRecommendSyllabus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/recommend-syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mataPelajaran: identitas.mataPelajaran,
          fase: identitas.fase,
          kelas: identitas.kelas,
          tahunPelajaran: identitas.tahunPelajaran,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperoleh saran silabus.");
      }

      const data = await response.json();
      setSyllabus(data);
    } catch (error) {
      console.error(error);
      alert("Gagal memanggil AI. Silakan periksa koneksi atau setelan kunci API Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans" id="app-container">
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm print:hidden" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-200">
              <GraduationCap size={24} id="logo-cap" />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-extrabold text-slate-900 tracking-tight">Administrasi Kurikulum Merdeka</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Pembuat Modul Ajar, Prota, dan Prosem Otomatis</p>
            </div>
          </div>

          {/* Tab buttons */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl" id="nav-tabs">
            <button
              onClick={() => setActiveTab("syllabus")}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "syllabus"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              id="tab-btn-syllabus"
            >
              <BookOpen size={14} />
              <span>Syllabus & Profil</span>
            </button>

            <button
              onClick={() => setActiveTab("rpp")}
              disabled={syllabus.chapters.length === 0}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === "rpp"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              id="tab-btn-rpp"
            >
              <Sparkles size={14} />
              <span>Modul Ajar (RPP) AI</span>
            </button>

            <button
              onClick={() => setActiveTab("prota")}
              disabled={syllabus.chapters.length === 0}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === "prota"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              id="tab-btn-prota"
            >
              <CalendarRange size={14} />
              <span>Prota</span>
            </button>

            <button
              onClick={() => setActiveTab("prosem")}
              disabled={syllabus.chapters.length === 0}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === "prosem"
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              id="tab-btn-prosem"
            >
              <CalendarDays size={14} />
              <span>Prosem</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="main-content">
        {/* Step-by-Step Interactive Flow Header */}
        {syllabus.chapters.length === 0 && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 shadow-xl text-center space-y-4 max-w-4xl mx-auto print:hidden" id="welcome-banner">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-bold text-[10px] rounded-full uppercase tracking-wider">Asisten Guru Digital</span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Buat Modul Ajar, Prota, & Prosem dalam Hitungan Detik</h2>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto">
              Cukup masukkan identitas mengajar Anda dan biarkan AI merancang seluruh kurikulum, alokasi JP, rincian minggu efektif, matriks semesteran, hingga modul ajar lengkap yang dapat diunduh!
            </p>
            <div className="pt-2 flex justify-center">
              <a
                href="#identitas-form"
                className="py-2 px-5 bg-blue-500 text-white font-semibold rounded-lg text-sm hover:bg-blue-600 flex items-center space-x-1 transition-all"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        )}

        {/* Tab rendering */}
        <div className="space-y-8">
          {activeTab === "syllabus" && (
            <div className="space-y-8" id="syllabus-tab-view">
              <IdentitasForm
                identitas={identitas}
                onChange={setIdentitas}
                onRecommend={handleRecommendSyllabus}
                loading={loading}
              />

              {syllabus.chapters.length > 0 && (
                <SyllabusPreview
                  syllabus={syllabus}
                  onChange={setSyllabus}
                />
              )}
            </div>
          )}

          {activeTab === "rpp" && syllabus.chapters.length > 0 && (
            <div id="rpp-tab-view">
              <RPPGenerator
                identitas={identitas}
                chapters={syllabus.chapters}
              />
            </div>
          )}

          {activeTab === "prota" && syllabus.chapters.length > 0 && (
            <div id="prota-tab-view">
              <ProtaPreview
                identitas={identitas}
                capaianPembelajaran={syllabus.capaianPembelajaran}
                chapters={syllabus.chapters}
                ganjilWeeks={syllabus.mingguEfektifDetailGanjil}
                genapWeeks={syllabus.mingguEfektifDetailGenap}
                onGanjilWeeksChange={(weeks) => setSyllabus({ ...syllabus, mingguEfektifDetailGanjil: weeks })}
                onGenapWeeksChange={(weeks) => setSyllabus({ ...syllabus, mingguEfektifDetailGenap: weeks })}
              />
            </div>
          )}

          {activeTab === "prosem" && syllabus.chapters.length > 0 && (
            <div id="prosem-tab-view">
              <ProsemPreview
                identitas={identitas}
                chapters={syllabus.chapters}
                onChaptersChange={(ch) => setSyllabus({ ...syllabus, chapters: ch })}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 print:hidden text-center text-xs text-slate-400" id="app-footer">
        <p>© 2026 Generator Administrasi Guru Kurikulum Merdeka. Membantu memudahkan tugas administrasi pengajar Indonesia.</p>
      </footer>
    </div>
  );
}
