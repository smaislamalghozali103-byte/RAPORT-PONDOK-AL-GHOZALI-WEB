"use client";

import { useState } from "react";

const demoStudents = [
  { id: "s1", name: "Pilih Siswa", nisn: "", className: "4A", unit: "SMA" },
  { id: "s2", name: "Contoh Siswa 1", nisn: "0012345678", className: "4A", unit: "SMA" },
  { id: "s3", name: "Contoh Siswa 2", nisn: "0012345679", className: "4A", unit: "SMA" }
];

const subjects = [
  ["Tamrin Lughoh", "تمرين اللغة"],
  ["Mutholaah", "المطالعة"],
  ["Aqidah", "العقيدة"],
  ["Hadist", "الحديث"],
  ["Fiqih", "الفقه"],
  ["Tarikh Islam", "التاريخ الإسلامي"],
  ["Tajwid", "التجويد"],
  ["Imla", "الإملاء"],
  ["Khot", "الخط"],
  ["Mahfudzot", "المحفوظات"],
  ["Pendidikan Agama Islam", "التربية الدينية الإسلامية"],
  ["Bahasa Indonesia", "اللغة الإندونيسية"],
  ["Bahasa Inggris", "اللغة الإنجليزية"],
  ["Matematika", "الرياضيات"],
  ["Ilmu Pengetahuan Alam", "علم الطبيعة"],
  ["Ilmu Pengetahuan Sosial", "علم الاجتماع"],
  ["Pendidikan Kewarganegaraan", "التربية الوطنية"],
  ["Informatika", "علم الحاسوب"],
  ["Pendidikan Jasmani dan Kesehatan", "الرياضة البدنية والصحية"],
  ["Seni Budaya", "الفنون الجميلة"],
  ["Bahasa Sunda", "اللغة السوندية"]
];

function emptyGrades() {
  return Object.fromEntries(subjects.map(([name]) => [name, ""]));
}

function gradeLetter(n) {
  if (!Number.isFinite(n)) return "";
  if (n >= 90) return "A";
  if (n >= 80) return "B";
  if (n >= 70) return "C";
  return "D";
}

export default function Home() {
  const [className, setClassName] = useState("4A");
  const [unit, setUnit] = useState("SMA");
  const [studentId, setStudentId] = useState("s2");
  const [grades, setGrades] = useState(() => ({ ...emptyGrades(), Matematika: 88, Fiqih: 90, "Bahasa Indonesia": 87 }));
  const [role, setRole] = useState("Wali Kelas");

  const student = demoStudents.find(s => s.id === studentId) || demoStudents[1];
  const numericGrades = Object.values(grades).map(Number).filter(Number.isFinite);
  const total = numericGrades.reduce((a,b) => a+b, 0);
  const average = numericGrades.length ? total / numericGrades.length : 0;

  function update(name, value) {
    if (value === "" || (/^\d{0,3}(\.\d{0,2})?$/.test(value) && Number(value) <= 100)) {
      setGrades(prev => ({ ...prev, [name]: value }));
    }
  }

  return (
    <main className="app-shell">
      <section className="toolbar">
        <div className="brand">
          <img src="/assets/logo-ypi-al-ghozali.png" alt="Logo YPI Al-Ghozali" />
          <div>
            <strong>RAPORT PONDOK MODERN AL-GHOZALI</strong>
            <span>Web App • tampilan raport dibuat langsung di aplikasi</span>
          </div>
        </div>
        <div className="toolbar-actions">
          <select value={unit} onChange={e => setUnit(e.target.value)}>
            <option>SMP</option>
            <option>SMA</option>
            <option>TMMIA</option>
          </select>
          <select value={className} onChange={e => setClassName(e.target.value)}>
            <option>1 SMP</option>
            <option>2 SMP</option>
            <option>3 SMP</option>
            <option>1 INT</option>
            <option>2 INT</option>
            <option>3 INT</option>
            <option>4A</option>
            <option>5A</option>
            <option>6A</option>
          </select>
          <select value={studentId} onChange={e => setStudentId(e.target.value)}>
            {demoStudents.slice(1).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => window.print()}>🖨️ Cetak</button>
        </div>
      </section>

      <section className="workspace">
        <aside className="panel">
          <div className="panel-title">INPUT NILAI</div>
          <p>Versi awal untuk menguji bentuk web. Nilai pada sisi kiri akan langsung tercermin pada raport.</p>

          <div className="field">
            <label>Peran</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option>Guru</option>
              <option>Wali Kelas</option>
              <option>Admin</option>
            </select>
          </div>

          <div className="field">
            <label>Nama Siswa</label>
            <input value={student.name} readOnly />
          </div>

          <div className="field-grid">
            {subjects.map(([name]) => (
              <label key={name}>
                <span>{name}</span>
                <input
                  inputMode="decimal"
                  value={grades[name]}
                  onChange={e => update(name, e.target.value)}
                  placeholder="0-100"
                />
              </label>
            ))}
          </div>
        </aside>

        <section className="preview-area">
          <div className="preview-note">
            <strong>RAPORT WEB</strong>
            <span>Excel/Spreadsheet menjadi basis data di belakang sistem. Yang tampil di sini hanya desain raport web.</span>
          </div>

          <article className="report-page">
            <div className="outer-red" />
            <div className="ornament-frame" />
            <div className="report-content">
              <header className="report-header">
                <img src="/assets/logo-ypi-al-ghozali.png" alt="Logo kiri" />
                <div>
                  <h1>كشف الدرجات</h1>
                  <h2>للامتحان التّحريري لمنتصف الفصل الدّراسي الأوّل</h2>
                </div>
                <img src="/assets/logo-ypi-al-ghozali.png" alt="Logo kanan" />
              </header>

              <div className="identity-grid">
                <div><span>الاسم كامل :</span><b>{student.name}</b></div>
                <div><span>الصّفّ :</span><b>{className}</b></div>
                <div><span>الرقم :</span><b>{student.nisn}</b></div>
                <div><span>العام الدّراسي :</span><b>2026/2027</b></div>
              </div>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th className="arabic">المواد الدّراسيّة</th>
                    <th>Mata Pelajaran</th>
                    <th>Nilai</th>
                    <th>Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(([name, arabic], i) => {
                    const n = Number(grades[name]);
                    return (
                      <tr key={name}>
                        <td>{i+1}</td>
                        <td className="arabic">{arabic}</td>
                        <td>{name}</td>
                        <td>{Number.isFinite(n) ? n : ""}</td>
                        <td>{gradeLetter(n)}</td>
                      </tr>
                    );
                  })}
                  <tr className="summary-row"><td colSpan="3">المجـموع / Jumlah</td><td>{numericGrades.length ? total : ""}</td><td /></tr>
                  <tr className="summary-row"><td colSpan="3">النّتيجـة المـعدّلة / Nilai Rata-Rata</td><td>{numericGrades.length ? average.toFixed(2) : ""}</td><td /></tr>
                  <tr className="summary-row"><td colSpan="3">المقـام / Peringkat</td><td>—</td><td /></tr>
                </tbody>
              </table>

              <div className="report-date">تحريراً بغونونج سندور، 10 اكتوبر 2026</div>

              <div className="signature-grid">
                <div className="signature"><strong>ولي الأمر</strong><div className="signature-space" /><div className="signature-line" /></div>
                <div className="signature"><strong>ولي الفصل</strong><div className="signature-space seal"><span>STAMP</span></div><div className="signature-line" /><b>________________</b></div>
                <div className="signature"><strong>مـدير المـعهد</strong><div className="signature-space" /><div className="signature-line" /><b>M. Ya'qub Unang, S.Ag</b></div>
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
