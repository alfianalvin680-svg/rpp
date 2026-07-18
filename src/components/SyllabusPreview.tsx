import React, { useState } from "react";
import { SyllabusData, Chapter } from "../types";
import { Edit, Trash, Plus, Check, X, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface SyllabusPreviewProps {
  syllabus: SyllabusData;
  onChange: (syllabus: SyllabusData) => void;
}

export const SyllabusPreview: React.FC<SyllabusPreviewProps> = ({ syllabus, onChange }) => {
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Chapter>>({});
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

  // Add chapter
  const handleAddChapter = (semesterNum: number) => {
    const newId = `chapter-${Date.now()}`;
    const newChapter: Chapter = {
      id: newId,
      semester: semesterNum,
      materiPokok: "Bab Baru / Materi Pokok Baru",
      alokasiWaktuJP: 8,
      mingguEfektifCount: 2,
      tujuanPembelajaran: ["Siswa mampu mendeskripsikan dasar materi pokok baru ini."],
      kktp: ["Mengidentifikasi karakteristik utama materi."],
      pemahamanBermakna: "Pemahaman penting yang diperoleh setelah mempelajari materi ini.",
      startMonthIndex: 0,
      durationWeeks: 2,
    };

    onChange({
      ...syllabus,
      chapters: [...syllabus.chapters, newChapter],
    });
    setExpandedChapterId(newId);
    handleStartEdit(newChapter);
  };

  // Delete chapter
  const handleDeleteChapter = (id: string) => {
    const filtered = syllabus.chapters.filter((c) => c.id !== id);
    onChange({
      ...syllabus,
      chapters: filtered,
    });
  };

  // Start Editing
  const handleStartEdit = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditForm({ ...chapter });
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingChapterId(null);
    setEditForm({});
  };

  // Save Edit
  const handleSaveEdit = () => {
    if (!editingChapterId) return;
    const updated = syllabus.chapters.map((c) => {
      if (c.id === editingChapterId) {
        return { ...c, ...editForm } as Chapter;
      }
      return c;
    });

    onChange({
      ...syllabus,
      chapters: updated,
    });
    setEditingChapterId(null);
    setEditForm({});
  };

  // Input changes in edit form
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "alokasiWaktuJP" || name === "mingguEfektifCount" || name === "startMonthIndex" || name === "durationWeeks") {
      setEditForm({ ...editForm, [name]: parseInt(value) || 0 });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  // Handle List Changes (TP & KKTP)
  const handleListChange = (field: "tujuanPembelajaran" | "kktp", index: number, value: string) => {
    const list = [...(editForm[field] || [])];
    list[index] = value;
    setEditForm({ ...editForm, [field]: list });
  };

  // Add Item to TP or KKTP
  const handleAddListItem = (field: "tujuanPembelajaran" | "kktp") => {
    const list = [...(editForm[field] || [])];
    list.push("");
    setEditForm({ ...editForm, [field]: list });
  };

  // Remove Item from TP or KKTP
  const handleRemoveListItem = (field: "tujuanPembelajaran" | "kktp", index: number) => {
    const list = (editForm[field] || []).filter((_, i) => i !== index);
    setEditForm({ ...editForm, [field]: list });
  };

  const renderSemesterTable = (semesterNum: number) => {
    const semChapters = syllabus.chapters.filter((c) => c.semester === semesterNum);

    return (
      <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm" id={`sem-table-container-${semesterNum}`}>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/12">No</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-5/12">Materi Pokok / Bab</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/12">Alokasi Waktu (JP)</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/12">Minggu Efektif</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-2/12">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-150">
            {semChapters.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                  Belum ada materi terdaftar untuk semester ini. Klik tambah materi di bawah.
                </td>
              </tr>
            ) : (
              semChapters.map((chapter, idx) => {
                const isEditing = editingChapterId === chapter.id;
                const isExpanded = expandedChapterId === chapter.id;

                return (
                  <React.Fragment key={chapter.id}>
                    <tr className={`hover:bg-slate-50 ${isExpanded ? "bg-slate-50/50" : ""}`} id={`row-${chapter.id}`}>
                      <td className="px-4 py-3.5 text-sm text-slate-500 text-center">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input
                            type="text"
                            name="materiPokok"
                            value={editForm.materiPokok || ""}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            id={`edit-materiPokok-${chapter.id}`}
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                              className="text-slate-400 hover:text-slate-600 focus:outline-none"
                              id={`toggle-expand-${chapter.id}`}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            <span className="font-medium text-slate-700">{chapter.materiPokok}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center text-sm text-slate-600">
                        {isEditing ? (
                          <input
                            type="number"
                            name="alokasiWaktuJP"
                            value={editForm.alokasiWaktuJP || 0}
                            onChange={handleEditChange}
                            className="w-16 px-1.5 py-0.5 text-center text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            id={`edit-alokasiWaktuJP-${chapter.id}`}
                          />
                        ) : (
                          <span>{chapter.alokasiWaktuJP} JP</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center text-sm text-slate-600">
                        {isEditing ? (
                          <input
                            type="number"
                            name="mingguEfektifCount"
                            value={editForm.mingguEfektifCount || 0}
                            onChange={handleEditChange}
                            className="w-16 px-1.5 py-0.5 text-center text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            id={`edit-mingguEfektifCount-${chapter.id}`}
                          />
                        ) : (
                          <span>{chapter.mingguEfektifCount} Minggu</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Simpan Perubahan"
                                id={`btn-save-${chapter.id}`}
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                title="Batal"
                                id={`btn-cancel-${chapter.id}`}
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setExpandedChapterId(chapter.id);
                                  handleStartEdit(chapter);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit Bab"
                                id={`btn-edit-${chapter.id}`}
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteChapter(chapter.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                title="Hapus Bab"
                                id={`btn-delete-${chapter.id}`}
                              >
                                <Trash size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row detail */}
                    {isExpanded && (
                      <tr className="bg-slate-50/30" id={`expand-${chapter.id}`}>
                        <td></td>
                        <td colSpan={4} className="px-6 py-4">
                          <div className="space-y-4 max-w-3xl">
                            {/* TP Section */}
                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>Tujuan Pembelajaran (TP)</span>
                                {isEditing && (
                                  <button
                                    onClick={() => handleAddListItem("tujuanPembelajaran")}
                                    className="text-[10px] text-blue-600 hover:underline flex items-center"
                                    id={`btn-add-tp-${chapter.id}`}
                                  >
                                    <Plus size={10} className="mr-0.5" /> Tambah TP
                                  </button>
                                )}
                              </h4>
                              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5">
                                {isEditing ? (
                                  (editForm.tujuanPembelajaran || []).map((tp, tpIdx) => (
                                    <li key={tpIdx} className="list-none flex items-center space-x-2">
                                      <span className="text-slate-400 font-mono text-[10px]">{tpIdx + 1}.</span>
                                      <input
                                        type="text"
                                        value={tp}
                                        onChange={(e) => handleListChange("tujuanPembelajaran", tpIdx, e.target.value)}
                                        className="flex-1 px-2 py-0.5 border border-slate-200 rounded text-xs"
                                        id={`input-tp-${chapter.id}-${tpIdx}`}
                                      />
                                      <button
                                        onClick={() => handleRemoveListItem("tujuanPembelajaran", tpIdx)}
                                        className="text-rose-500 hover:text-rose-700"
                                      >
                                        <X size={12} />
                                      </button>
                                    </li>
                                  ))
                                ) : (
                                  chapter.tujuanPembelajaran.map((tp, idx) => <li key={idx}>{tp}</li>)
                                )}
                              </ul>
                            </div>

                            {/* KKTP Section */}
                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                                <span>Kriteria Ketercapaian (KKTP)</span>
                                {isEditing && (
                                  <button
                                    onClick={() => handleAddListItem("kktp")}
                                    className="text-[10px] text-blue-600 hover:underline flex items-center"
                                    id={`btn-add-kktp-${chapter.id}`}
                                  >
                                    <Plus size={10} className="mr-0.5" /> Tambah KKTP
                                  </button>
                                )}
                              </h4>
                              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1.5">
                                {isEditing ? (
                                  (editForm.kktp || []).map((k, kIdx) => (
                                    <li key={kIdx} className="list-none flex items-center space-x-2">
                                      <span className="text-slate-400 font-mono text-[10px]">{kIdx + 1}.</span>
                                      <input
                                        type="text"
                                        value={k}
                                        onChange={(e) => handleListChange("kktp", kIdx, e.target.value)}
                                        className="flex-1 px-2 py-0.5 border border-slate-200 rounded text-xs"
                                        id={`input-kktp-${chapter.id}-${kIdx}`}
                                      />
                                      <button
                                        onClick={() => handleRemoveListItem("kktp", kIdx)}
                                        className="text-rose-500 hover:text-rose-700"
                                      >
                                        <X size={12} />
                                      </button>
                                    </li>
                                  ))
                                ) : (
                                  chapter.kktp.map((k, idx) => <li key={idx}>{k}</li>)
                                )}
                              </ul>
                            </div>

                            {/* Pemahaman Bermakna Section */}
                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Pemahaman Bermakna
                              </h4>
                              {isEditing ? (
                                <textarea
                                  name="pemahamanBermakna"
                                  value={editForm.pemahamanBermakna || ""}
                                  onChange={handleEditChange}
                                  rows={2}
                                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  id={`edit-pemahaman-${chapter.id}`}
                                />
                              ) : (
                                <p className="text-xs text-slate-600 leading-relaxed italic">
                                  "{chapter.pemahamanBermakna}"
                                </p>
                              )}
                            </div>

                            {/* Scheduling Helpers */}
                            {isEditing && (
                              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3 mt-1">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Bulan Mulai Diajarkan
                                  </label>
                                  <select
                                    name="startMonthIndex"
                                    value={editForm.startMonthIndex ?? 0}
                                    onChange={handleEditChange}
                                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                                    id={`edit-startMonth-${chapter.id}`}
                                  >
                                    {semesterNum === 1 ? (
                                      <>
                                        <option value={0}>Juli</option>
                                        <option value={1}>Agustus</option>
                                        <option value={2}>September</option>
                                        <option value={3}>Oktober</option>
                                        <option value={4}>November</option>
                                        <option value={5}>Desember</option>
                                      </>
                                    ) : (
                                      <>
                                        <option value={0}>Januari</option>
                                        <option value={1}>Februari</option>
                                        <option value={2}>Maret</option>
                                        <option value={3}>April</option>
                                        <option value={4}>Mei</option>
                                        <option value={5}>Juni</option>
                                      </>
                                    )}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Durasi (Minggu)
                                  </label>
                                  <input
                                    type="number"
                                    name="durationWeeks"
                                    value={editForm.durationWeeks ?? 2}
                                    onChange={handleEditChange}
                                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                                    id={`edit-duration-${chapter.id}`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
        
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => handleAddChapter(semesterNum)}
            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 flex items-center space-x-1 shadow-sm transition-all"
            id={`btn-add-chapter-${semesterNum}`}
          >
            <Plus size={14} />
            <span>Tambah Bab / Materi Baru</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto space-y-6" id="syllabus-preview">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <FileText size={22} id="syllabus-icon" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Daftar Materi Pokok & Capaian Pembelajaran</h2>
          <p className="text-xs text-slate-500">Sesuaikan materi pokok di bawah ini sebelum membuat RPP, Prota, dan Prosem.</p>
        </div>
      </div>

      {/* CP Section */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">Capaian Pembelajaran (CP)</label>
        <textarea
          value={syllabus.capaianPembelajaran}
          onChange={(e) => onChange({ ...syllabus, capaianPembelajaran: e.target.value })}
          rows={4}
          className="w-full p-3 border border-slate-300 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all leading-relaxed"
          placeholder="Masukkan teks Capaian Pembelajaran (CP) untuk Fase ini..."
          id="textarea-cp"
        />
      </div>

      {/* Semesters Section */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Semester 1 (Ganjil)</span>
          </h3>
          {renderSemesterTable(1)}
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>Semester 2 (Genap)</span>
          </h3>
          {renderSemesterTable(2)}
        </div>
      </div>
    </div>
  );
};
