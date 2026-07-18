import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint 1: Recommend Syllabus (CP, Chapters, Alokasi Waktu, Minggu Efektif)
app.post("/api/recommend-syllabus", async (req, res) => {
  try {
    const { mataPelajaran, fase, kelas, tahunPelajaran } = req.body;

    if (!mataPelajaran || !fase || !kelas) {
      return res.status(400).json({ error: "Parameter mataPelajaran, fase, dan kelas wajib diisi." });
    }

    const prompt = `
Anda adalah seorang ahli kurikulum pendidikan Indonesia, khususnya Kurikulum Merdeka.
Buatkan rekomendasi perencanaan program tahunan (PROTA) dan program semester (PROSEM) untuk identitas berikut:
- Mata Pelajaran: ${mataPelajaran}
- Fase: ${fase}
- Kelas: ${kelas}
- Tahun Pelajaran: ${tahunPelajaran || "2025/2026"}

Silakan rancang daftar materi pokok/bab yang lengkap untuk Semester 1 (Ganjil) dan Semester 2 (Genap) secara proporsional.
Umumnya berkisar antara 4 sampai 8 bab dalam setahun secara keseluruhan.
Tentukan pula Capaian Pembelajaran (CP) Fase tersebut untuk Mata Pelajaran ini secara singkat tapi resmi sesuai standar Kemendikbudristek.

Berikan juga rincian perhitungan Minggu Efektif untuk Semester 1 dan Semester 2.
- Semester 1 (Ganjil) terdiri dari bulan: Juli, Agustus, September, Oktober, November, Desember.
- Semester 2 (Genap) terdiri dari bulan: Januari, Februari, Maret, April, Mei, Juni.
Untuk setiap bulan tersebut, tentukan jumlah minggu total, perkiraan minggu tidak efektif (karena libur, PTS, PAS, dll), dan hitung minggu efektifnya.

Tentukan alokasi waktu JP (Jam Pelajaran) untuk tiap bab. Rata-rata per bab berkisar antara 4 s.d. 12 JP tergantung kedalaman materi.
Asumsikan juga perkiraan durasi minggu dan startMonthIndex (0-5) untuk visualisasi diagram Prosem di frontend:
- Untuk Semester 1 (Ganjil), bulan ke-0 adalah Juli, ke-5 adalah Desember.
- Untuk Semester 2 (Genap), bulan ke-0 adalah Januari, ke-5 adalah Juni.

Format output HARUS berupa JSON sesuai skema berikut. Jangan sertakan teks markdown di luar JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            capaianPembelajaran: {
              type: Type.STRING,
              description: "Teks lengkap Capaian Pembelajaran (CP) untuk mata pelajaran dan fase ini."
            },
            kompetensiAwalDefault: {
              type: Type.STRING,
              description: "Kompetensi awal default sebelum mulai pembelajaran mapel ini."
            },
            profilPancasilaDefault: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Kombinasi Profil Pelajar Pancasila yang relevan (misal: Beriman, Mandiri, Gotong Royong)."
            },
            saranaPrasaranaDefault: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar sarana prasarana yang umum dibutuhkan (misal: Buku teks, LCD Proyektor, Internet)."
            },
            targetPesertaDidikDefault: {
              type: Type.STRING,
              description: "Target peserta didik default (misal: Regular/Tipikal)."
            },
            modelMetodeDefault: {
              type: Type.STRING,
              description: "Model pembelajaran default (misal: Problem Based Learning)."
            },
            chapters: {
              type: Type.ARRAY,
              description: "Daftar bab/materi pokok terdistribusi di semester 1 dan semester 2.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  semester: { type: Type.INTEGER, description: "1 untuk Ganjil, 2 untuk Genap" },
                  materiPokok: { type: Type.STRING, description: "Judul Bab / Materi Pokok" },
                  alokasiWaktuJP: { type: Type.INTEGER, description: "Total Jam Pelajaran, misal 8" },
                  mingguEfektifCount: { type: Type.INTEGER, description: "Jumlah minggu efektif untuk bab ini, misal 2" },
                  tujuanPembelajaran: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Daftar Tujuan Pembelajaran (TP) singkat dari bab ini."
                  },
                  kktp: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) singkat."
                  },
                  pemahamanBermakna: {
                    type: Type.STRING,
                    description: "Pernyataan pemahaman bermakna untuk materi ini."
                  },
                  startMonthIndex: {
                    type: Type.INTEGER,
                    description: "Index bulan mulai diajarkan di semester tersebut (0 s.d. 5)."
                  },
                  durationWeeks: {
                    type: Type.INTEGER,
                    description: "Durasi pengajaran dalam minggu, misal 2 atau 3 minggu."
                  }
                },
                required: [
                  "id",
                  "semester",
                  "materiPokok",
                  "alokasiWaktuJP",
                  "mingguEfektifCount",
                  "tujuanPembelajaran",
                  "kktp",
                  "pemahamanBermakna",
                  "startMonthIndex",
                  "durationWeeks"
                ]
              }
            },
            mingguEfektifDetailGanjil: {
              type: Type.ARRAY,
              description: "6 baris data minggu efektif Semester 1 (Juli - Des).",
              items: {
                type: Type.OBJECT,
                properties: {
                  bulan: { type: Type.STRING },
                  jmlMinggu: { type: Type.INTEGER },
                  mingguTidakEfektif: { type: Type.INTEGER },
                  mingguEfektif: { type: Type.INTEGER },
                  keterangan: { type: Type.STRING }
                },
                required: ["bulan", "jmlMinggu", "mingguTidakEfektif", "mingguEfektif", "keterangan"]
              }
            },
            mingguEfektifDetailGenap: {
              type: Type.ARRAY,
              description: "6 baris data minggu efektif Semester 2 (Jan - Jun).",
              items: {
                type: Type.OBJECT,
                properties: {
                  bulan: { type: Type.STRING },
                  jmlMinggu: { type: Type.INTEGER },
                  mingguTidakEfektif: { type: Type.INTEGER },
                  mingguEfektif: { type: Type.INTEGER },
                  keterangan: { type: Type.STRING }
                },
                required: ["bulan", "jmlMinggu", "mingguTidakEfektif", "mingguEfektif", "keterangan"]
              }
            }
          },
          required: [
            "capaianPembelajaran",
            "kompetensiAwalDefault",
            "profilPancasilaDefault",
            "saranaPrasaranaDefault",
            "targetPesertaDidikDefault",
            "modelMetodeDefault",
            "chapters",
            "mingguEfektifDetailGanjil",
            "mingguEfektifDetailGenap"
          ]
        }
      }
    });

    const resultText = response.text;
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error recommending syllabus:", error);
    res.status(500).json({ error: error.message || "Gagal mendapatkan rekomendasi kurikulum dari AI." });
  }
});

// Endpoint 2: Generate RPP / Modul Ajar lengkap untuk materi tertentu
app.post("/api/generate-rpp", async (req, res) => {
  try {
    const {
      mataPelajaran,
      fase,
      kelas,
      semester,
      tahunPelajaran,
      materiPokok,
      alokasiWaktu,
      tujuanPembelajaran,
      kktp,
      pemahamanBermakna,
      identitasModul
    } = req.body;

    if (!materiPokok) {
      return res.status(400).json({ error: "Materi Pokok wajib ditentukan." });
    }

    const prompt = `
Rancanglah MODUL AJAR (RPP) KURIKULUM MERDEKA yang sangat lengkap, profesional, dan detail untuk:
- Mata Pelajaran: ${mataPelajaran}
- Fase/Kelas: ${fase} / Kelas ${kelas}
- Semester: ${semester}
- Tahun Penyusunan: ${tahunPelajaran || "2025/2026"}
- Materi Pokok: ${materiPokok}
- Alokasi Waktu: ${alokasiWaktu} JP
- Penyusun: ${identitasModul?.penyusun || "Nama Guru"}
- Nama Madrasah/Sekolah: ${identitasModul?.namaSekolah || "Nama Sekolah/Madrasah"}

Detail Rencana Awal (Gunakan ini jika tersedia, kembangkan jadi lebih rinci):
- Tujuan Pembelajaran: ${JSON.stringify(tujuanPembelajaran || [])}
- KKTP: ${JSON.stringify(kktp || [])}
- Pemahaman Bermakna: ${pemahamanBermakna || ""}

Modul ajar ini HARUS memiliki semua komponen berikut dalam bahasa Indonesia yang baku, mendalam, dan aplikatif.
Struktur output yang dihasilkan harus berupa JSON dengan komponen-komponen berikut:
1. kompetensiAwal (Deskripsi kompetensi prasyarat yang harus dimiliki siswa sebelum mempelajari materi ini)
2. profilPelajarPancasila (Daftar dimensi Profil Pelajar Pancasila beserta sub-elemen penjelasnya secara detail)
3. saranaPrasarana (Daftar sarana, prasarana, media pembelajaran, dan sumber belajar yang digunakan secara konkret)
4. targetPesertaDidik (Deskripsi target peserta didik, misal reguler, pencapaian tinggi, kesulitan belajar, dsb)
5. modelMetodePembelajaran (Model pembelajaran misal PBL, PJBL, Inkuiri, Discovery, beserta metode pembelajarannya secara eksplisit)
6. persiapanBelajar (Daftar langkah konkret persiapan guru sebelum masuk kelas, minimal 3 poin terperinci)
7. kegiatanPembelajaran (Pembagian langkah pembelajaran yang interaktif dan mendalam:
   - pendahuluan: minimal 4 langkah pembuka (apersepsi, motivasi, pertanyaan pemantik, penyampaian tujuan)
   - inti: minimal 6 langkah bermodel sesuai model pembelajaran yang dipilih (aktivitas eksplorasi, diskusi kelompok, presentasi, penguatan konsep)
   - penutup: minimal 3 langkah penutup (kesimpulan bersama, refleksi bersama, info materi berikutnya/doa)
8. refleksiGuru (Daftar pertanyaan refleksi guru untuk mengevaluasi proses pembelajaran yang telah berlangsung, minimal 4 pertanyaan)
9. asesmenPenilaian (Teks rubrik/penilaian yang konkret:
   - sikap: teknik (observasi, jurnal) dan contoh indikator penilaian sikap
   - performa/keterampilan: rubrik penilaian kinerja (misal presentasi, kerja kelompok)
   - tertulis: minimal 3 soal pilihan ganda / uraian HOTS yang relevan dengan tujuan pembelajaran lengkap dengan kunci jawaban)
10. pengayaanRemedial (Rancangan aktivitas pengayaan bagi siswa yang telah tuntas, dan program remedial yang disederhanakan bagi siswa yang belum tuntas)
11. interaksiOrangTua (Saran kegiatan kolaborasi guru, siswa, dan orang tua/wali untuk mendukung pembelajaran ini di rumah)
12. lampiranMateri (Ringkasan materi ajar yang komprehensif, padat, dan informatif untuk dipelajari siswa, minimal 2 paragraf berbobot)
13. daftarPustaka (Daftar referensi buku, modul, jurnal, atau situs web resmi yang digunakan sebagai rujukan)

Sajikan respon dalam format JSON murni tanpa menyertakan teks markdown di luar blok JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kompetensiAwal: { type: Type.STRING },
            profilPelajarPancasila: { type: Type.ARRAY, items: { type: Type.STRING } },
            saranaPrasarana: { type: Type.ARRAY, items: { type: Type.STRING } },
            targetPesertaDidik: { type: Type.STRING },
            modelMetodePembelajaran: { type: Type.STRING },
            persiapanBelajar: { type: Type.ARRAY, items: { type: Type.STRING } },
            kegiatanPembelajaran: {
              type: Type.OBJECT,
              properties: {
                pendahuluan: { type: Type.ARRAY, items: { type: Type.STRING } },
                inti: { type: Type.ARRAY, items: { type: Type.STRING } },
                penutup: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["pendahuluan", "inti", "penutup"]
            },
            refleksiGuru: { type: Type.ARRAY, items: { type: Type.STRING } },
            asesmenPenilaian: {
              type: Type.OBJECT,
              properties: {
                sikap: { type: Type.STRING, description: "Instruksi/metode penilaian sikap" },
                performa: { type: Type.STRING, description: "Instruksi/rubrik penilaian kinerja atau keterampilan" },
                tertulis: { type: Type.STRING, description: "Kumpulan soal evaluasi tertulis beserta kunci jawaban" },
              },
              required: ["sikap", "performa", "tertulis"]
            },
            pengayaanRemedial: { type: Type.STRING },
            interaksiOrangTua: { type: Type.STRING },
            lampiranMateri: { type: Type.STRING },
            daftarPustaka: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            "kompetensiAwal",
            "profilPelajarPancasila",
            "saranaPrasarana",
            "targetPesertaDidik",
            "modelMetodePembelajaran",
            "persiapanBelajar",
            "kegiatanPembelajaran",
            "refleksiGuru",
            "asesmenPenilaian",
            "pengayaanRemedial",
            "interaksiOrangTua",
            "lampiranMateri",
            "daftarPustaka"
          ]
        }
      }
    });

    const resultText = response.text;
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error generating RPP:", error);
    res.status(500).json({ error: error.message || "Gagal menghasilkan RPP/Modul Ajar dari AI." });
  }
});

// Vite Middleware & Static Serves
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
