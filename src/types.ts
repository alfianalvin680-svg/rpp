export interface Identitas {
  namaGuru: string;
  nIP: string;
  namaSekolah: string;
  tahunPelajaran: string;
  mataPelajaran: string;
  fase: string;
  kelas: string;
  semester: "Ganjil" | "Genap" | "Kedua";
  kurikulum: string;
}

export interface Chapter {
  id: string;
  semester: number; // 1 = Ganjil, 2 = Genap
  materiPokok: string;
  alokasiWaktuJP: number;
  mingguEfektifCount: number;
  tujuanPembelajaran: string[];
  kktp: string[];
  pemahamanBermakna: string;
  startMonthIndex: number; // 0-5
  durationWeeks: number; // e.g. 2
  scheduleData?: boolean[]; // 24 columns representing weeks (e.g. 4 weeks * 6 months = 24 weeks)
}

export interface MingguEfektifDetail {
  bulan: string;
  jmlMinggu: number;
  mingguTidakEfektif: number;
  mingguEfektif: number;
  keterangan: string;
}

export interface RPPData {
  kompetensiAwal: string;
  profilPelajarPancasila: string[];
  saranaPrasarana: string[];
  targetPesertaDidik: string;
  modelMetodePembelajaran: string;
  persiapanBelajar: string[];
  kegiatanPembelajaran: {
    pendahuluan: string[];
    inti: string[];
    penutup: string[];
  };
  refleksiGuru: string[];
  asesmenPenilaian: {
    sikap: string;
    performa: string;
    tertulis: string;
  };
  pengayaanRemedial: string;
  interaksiOrangTua: string;
  lampiranMateri: string;
  daftarPustaka: string[];
}

export interface SyllabusData {
  capaianPembelajaran: string;
  kompetensiAwalDefault: string;
  profilPancasilaDefault: string[];
  saranaPrasaranaDefault: string[];
  targetPesertaDidikDefault: string;
  modelMetodeDefault: string;
  chapters: Chapter[];
  mingguEfektifDetailGanjil: MingguEfektifDetail[];
  mingguEfektifDetailGenap: MingguEfektifDetail[];
}
