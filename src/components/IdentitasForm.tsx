import React from "react";
import { Identitas } from "../types";
import { BookOpen, User, School, Calendar, Award } from "lucide-react";

interface IdentitasFormProps {
  identitas: Identitas;
  onChange: (identitas: Identitas) => void;
  onRecommend: () => void;
  loading: boolean;
}

export const IdentitasForm: React.FC<IdentitasFormProps> = ({
  identitas,
  onChange,
  onRecommend,
  loading,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({
      ...identitas,
      [name]: value,
    });
  };

  const mapelOptions = [
    "Pendidikan Agama Islam",
    "Pendidikan Pancasila",
    "Bahasa Indonesia",
    "Matematika",
    "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
    "Bahasa Inggris",
    "Seni Budaya",
    "Pendidikan Jasmani Olahraga & Kesehatan (PJOK)",
    "Informatika",
    "Fisika",
    "Kimia",
    "Biologi",
    "Sejarah",
    "Geografi",
    "Ekonomi",
    "Sosiologi",
    "Qur'an Hadist",
    "Akidah Akhlak",
    "Sejarah Kebudayaan Islam (SKI)",
    "Bahasa Arab",
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto" id="identitas-form">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <School size={22} id="school-icon" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Identitas Guru & Madrasah/Sekolah</h2>
          <p className="text-xs text-slate-500">Isi data dasar di bawah ini untuk memulai pembuatan dokumen RPP, Prota, dan Prosem.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
            <User size={15} className="mr-1 text-slate-400" /> Nama Lengkap Guru
          </label>
          <input
            type="text"
            name="namaGuru"
            value={identitas.namaGuru}
            onChange={handleChange}
            placeholder="Contoh: Budi Santoso, S.Pd."
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            id="input-nama-guru"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
            <Award size={15} className="mr-1 text-slate-400" /> NIP / NIK (Opsional)
          </label>
          <input
            type="text"
            name="nIP"
            value={identitas.nIP}
            onChange={handleChange}
            placeholder="Contoh: 198503112010121002"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            id="input-nip"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
            <School size={15} className="mr-1 text-slate-400" /> Nama Satuan Pendidikan
          </label>
          <input
            type="text"
            name="namaSekolah"
            value={identitas.namaSekolah}
            onChange={handleChange}
            placeholder="Contoh: MIN 1 Yogyakarta / SDN 02 Jakarta"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            id="input-sekolah"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
            <Calendar size={15} className="mr-1 text-slate-400" /> Tahun Pelajaran
          </label>
          <input
            type="text"
            name="tahunPelajaran"
            value={identitas.tahunPelajaran}
            onChange={handleChange}
            placeholder="Contoh: 2025/2026"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            id="input-tp"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
            <BookOpen size={15} className="mr-1 text-slate-400" /> Mata Pelajaran
          </label>
          <select
            name="mataPelajaran"
            value={identitas.mataPelajaran}
            onChange={handleChange}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            id="select-mapel"
          >
            <option value="">-- Pilih Mata Pelajaran --</option>
            {mapelOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value="custom">Mata Pelajaran Lainnya...</option>
          </select>
          {identitas.mataPelajaran === "custom" && (
            <input
              type="text"
              name="mataPelajaran"
              placeholder="Ketik mata pelajaran kustom..."
              onChange={(e) => onChange({ ...identitas, mataPelajaran: e.target.value })}
              className="mt-2 w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              id="input-custom-mapel"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Fase & Kelas</label>
          <div className="grid grid-cols-2 gap-3">
            <select
              name="fase"
              value={identitas.fase}
              onChange={handleChange}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              id="select-fase"
            >
              <option value="Fase A">Fase A (SD Kelas 1-2)</option>
              <option value="Fase B">Fase B (SD Kelas 3-4)</option>
              <option value="Fase C">Fase C (SD Kelas 5-6)</option>
              <option value="Fase D">Fase D (SMP Kelas 7-9)</option>
              <option value="Fase E">Fase E (SMA Kelas 10)</option>
              <option value="Fase F">Fase F (SMA Kelas 11-12)</option>
            </select>

            <select
              name="kelas"
              value={identitas.kelas}
              onChange={handleChange}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              id="select-kelas"
            >
              <option value="Kelas 1">Kelas 1</option>
              <option value="Kelas 2">Kelas 2</option>
              <option value="Kelas 3">Kelas 3</option>
              <option value="Kelas 4">Kelas 4</option>
              <option value="Kelas 5">Kelas 5</option>
              <option value="Kelas 6">Kelas 6</option>
              <option value="Kelas 7">Kelas 7</option>
              <option value="Kelas 8">Kelas 8</option>
              <option value="Kelas 9">Kelas 9</option>
              <option value="Kelas 10">Kelas 10</option>
              <option value="Kelas 11">Kelas 11</option>
              <option value="Kelas 12">Kelas 12</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Kurikulum</label>
          <input
            type="text"
            name="kurikulum"
            value={identitas.kurikulum}
            onChange={handleChange}
            placeholder="Contoh: Kurikulum Merdeka"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            id="input-kurikulum"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onRecommend}
            disabled={loading || !identitas.mataPelajaran || !identitas.namaSekolah}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg text-sm shadow-md hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
            id="btn-recommend-syllabus"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Menganalisis Kurikulum & Membuat Syllabus...</span>
              </>
            ) : (
              <>
                <span>Rekomendasikan Struktur Kurikulum (AI)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
