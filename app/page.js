"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL="https://script.google.com/macros/s/AKfycbxwA8gv9T0m7hV3kR57kygGnrU8OLPsmu-tFPVASgB_GxUSNqlyIs8XzgMOyIPeG00D/exec";

async function api(action, params={}, token="", method="GET"){
  if(method==="POST"){
    const body={action,...params};
    if(token){ body.token=token; body.sessionToken=token; }
    const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),cache:"no-store"});
    const data=await res.json();
    if(!data.ok) throw new Error(data.message||data.error||"Permintaan API gagal.");
    return data;
  }
  const q=new URLSearchParams({action,...params});
  if(token) q.set("token",token);
  const res=await fetch(`${API_URL}?${q.toString()}`,{cache:"no-store"});
  const data=await res.json();
  if(!data.ok) throw new Error(data.message||data.error||"Permintaan API gagal.");
  return data;
}

function getSession(){
  if(typeof window==="undefined") return null;
  try{return JSON.parse(sessionStorage.getItem("raport_session")||"null")}catch{return null}
}
function saveSession(session){sessionStorage.setItem("raport_session",JSON.stringify(session))}
function clearSession(){sessionStorage.removeItem("raport_session")}
function arrayFromResponse(data,...keys){
  for(const key of keys){if(Array.isArray(data?.[key])) return data[key]}
  if(Array.isArray(data)) return data
  return []
}
function pick(obj,...keys){
  for(const key of keys){if(obj&&obj[key]!==undefined&&obj[key]!==null&&String(obj[key]).trim()!=="") return obj[key]}
  return ""
}
function normalizeStudent(s){
  if(Array.isArray(s)) return {studentId:s[0]||"",nisn:s[1]||"",namaSiswa:s[2]||"",unit:s[3]||"",kelas:s[4]||""}
  return {studentId:pick(s,"studentId","STUDENT_ID","id","ID"),nisn:pick(s,"nisn","NISN"),namaSiswa:pick(s,"namaSiswa","NAMA_SISWA","nama","NAMA"),unit:pick(s,"unit","UNIT"),kelas:pick(s,"kelas","KELAS","namaKelas","NAMA_KELAS")}
}
function normalizeAssignment(a){
  if(Array.isArray(a)) return {
    unit:a[0]||"", kelas:a[1]||"", mataPelajaran:a[2]||"",
    mapelId:a[3]||"", guruId:a[4]||"", kodeMapel:a[5]||"",
    namaMapelSumber:a[2]||"", namaMapelRaport:"", namaArabRaport:""
  }
  return {
    unit:pick(a,"unit","UNIT"),
    kelas:pick(a,"kelas","KELAS","namaKelas","NAMA_KELAS","kelasSumber","KELAS_SUMBER"),
    mataPelajaran:pick(a,"mataPelajaran","MATA_PELAJARAN","namaMapelSumber","NAMA_MAPEL_SUMBER","namaMapel","NAMA_MAPEL"),
    mapelId:pick(a,"mapelId","MAPEL_ID","idMapel","ID_MAPEL"),
    guruId:pick(a,"guruId","ID_GURU","idGuru"),
    kodeMapel:pick(a,"kodeMapel","KODE_MAPEL","kode","KODE","Kode Mapel"),
    namaMapelSumber:pick(a,"namaMapelSumber","NAMA_MAPEL_SUMBER","mataPelajaran","MATA_PELAJARAN","namaMapel","NAMA_MAPEL"),
    namaMapelRaport:pick(a,"namaMapelRaport","NAMA_MAPEL_RAPORT"),
    namaArabRaport:pick(a,"namaArabRaport","NAMA_ARAB_RAPORT","namaArab","NAMA_ARAB")
  }
}
function normalizeSubject(s){
  if(Array.isArray(s)) return {
    mapelId:s[0]||"", kodeMapel:s[1]||"", namaMapel:s[2]||"",
    namaMapelSumber:s[2]||"", namaMapelRaport:s[2]||"", namaArab:s[3]||"",
    namaArabRaport:s[3]||"", unit:s[4]||""
  }
  return {
    mapelId:pick(s,"mapelId","MAPEL_ID","idMapel","ID_MAPEL"),
    kodeMapel:pick(s,"kodeMapel","KODE_MAPEL","kode","KODE"),
    namaMapel:pick(s,"namaMapel","NAMA_MAPEL","namaMapelRaport","NAMA_MAPEL_RAPORT","mataPelajaran","MATA_PELAJARAN"),
    namaMapelSumber:pick(s,"namaMapelSumber","NAMA_MAPEL_SUMBER","mataPelajaran","MATA_PELAJARAN","namaMapel","NAMA_MAPEL"),
    namaMapelRaport:pick(s,"namaMapelRaport","NAMA_MAPEL_RAPORT","namaMapel","NAMA_MAPEL"),
    namaArab:pick(s,"namaArab","NAMA_ARAB","namaArabRaport","NAMA_ARAB_RAPORT"),
    namaArabRaport:pick(s,"namaArabRaport","NAMA_ARAB_RAPORT","namaArab","NAMA_ARAB"),
    unit:pick(s,"unit","UNIT")
  }
}
function normalizeClass(k){
  if(Array.isArray(k)) return {kelas:k[0]||"",unit:k[1]||""}
  return {kelas:pick(k,"kelas","KELAS","namaKelas","NAMA_KELAS","nama"),unit:pick(k,"unit","UNIT")}
}
function normalizeCurriculum(c){
  if(Array.isArray(c)) return {curriculumId:c[0]||"",group:c[1]||"",urut:c[2]||"",mataPelajaran:c[3]||"",namaArab:c[4]||"",mapelId:c[5]||""};
  return {curriculumId:pick(c,"curriculumId","KURIKULUM_ID","id"),group:pick(c,"kelompokKelasSumber","KELOMPOK_KELAS_SUMBER","group","GROUP"),urut:pick(c,"urut","URUT"),mataPelajaran:pick(c,"mataPelajaran","MATA_PELAJARAN"),namaArab:pick(c,"namaArabRaport","NAMA_ARAB_RAPORT","namaArab","NAMA_ARAB"),mapelId:pick(c,"mapelId","MAPEL_ID")};
}
function mukimGroupForClass(value){
  const x=String(value||"").toUpperCase().replace(/[‐‑–—]/g,"-").replace(/\s+/g,"").replace(/_/g,"").replace(/INTENSIF/g,"INT");
  if(/^1[ABCDE]$/.test(x)) return "KELAS 1(VII SMP)";
  if(/^2[ABCDEF]$/.test(x)) return "KELAS 2 (VIII SMP)";
  if(/^3[ABCDEF]$/.test(x)) return "KELAS 3 (IX SMP)";
  if(/^4[ABC]$/.test(x)) return "KELAS 4 (10 SMA)";
  if(/^5[AC]$/.test(x)) return "KELAS 5A+5C IPA (11 SMA)";
  if(/^5[BD]$/.test(x)) return "KELAS 5B+5D IPS (11 SMA)";
  if(/^6[AC]$/.test(x)) return "KELAS 6A+6C-IPA (12 SMA)";
  if(/^6[BD]$/.test(x)) return "KELAS 6B+6D-IPS (12 SMA)";
  if(x==="1INT") return "KELAS 1INT(10 SMA)";
  if(x==="2INTA"||x==="2INTIPA") return "KELAS 2INT A-IPA (11 SMA)";
  if(x==="2INTB"||x==="2INTIPS") return "KELAS 2INT B-IPS (11 SMA)";
  if(x==="3INTA"||x==="3INTIPA") return "KELAS 3INT A-IPA (12 SMA)";
  if(x==="3INTB"||x==="3INTIPS") return "KELAS 3INT B-IPS (12 SMA)";
  return "";
}

const LOGO="https://raw.githubusercontent.com/smaislamalghozali103-byte/raport_pondok_integrasi/main/public/assets/logo-ypi-al-ghozali.png";
const subjects=[
["Tamrin Lughoh","تمرين اللغة"],["Mutholaah","المطالعة"],["Aqidah","العقيدة"],["Hadist","الحديث"],["Fiqih","الفقه"],
["Tarikh Islam","التاريخ الإسلامي"],["Tajwid","التجويد"],["Imla","الإملاء"],["Khot","الخط"],["Mahfudzot","المحفوظات"],
["Pendidikan Agama Islam","التربية الدينية الإسلامية"],["Bahasa Indonesia","اللغة الإندونيسية"],["Bahasa Inggris","اللغة الإنجليزية"],
["Matematika","الرياضيات"],["Ilmu Pengetahuan Alam","علم الطبيعة"],["Ilmu Pengetahuan Sosial","علم الاجتماع"],
["Pendidikan Kewarganegaraan","التربية الوطنية"],["Informatika","علم الحاسوب"],["Pendidikan Jasmani dan Kesehatan","الرياضة البدنية والصحية"],
["Seni Budaya","الفنون الجميلة"],["Bahasa Sunda","اللغة السوندية"]
];
const students=[
["AANISAH CELYANI","3148999544"],["ABDILLAH RAHMAN","3148999545"],["AHMAD FAHRI","3148999546"],
["ALI ZAINUDDIN","3148999547"],["AMIRUL HAKIM","3148999548"]
];
const initial={};

function toArabicDigits(value){return String(value).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[Number(d)])}
function arabicNumberWord(value){const n=Math.round(Number(value));if(!Number.isFinite(n))return "";const ones=["صفر","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة"];const teens=["عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"];const tens=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"];if(n<10)return ones[n];if(n<20)return teens[n-10];if(n<100)return n%10===0?tens[n/10]:`${ones[n%10]} و${tens[Math.floor(n/10)]}`;if(n===100)return "مائة";return String(n)}
function pred(v){const n=Number(v);return Number.isFinite(n)?n>=90?"A":n>=80?"B":n>=70?"C":"D":"—"}
function Icon({type}){const p={home:"M3 10 12 3l9 7M5 9v12h14V9M9 21v-6h6v6",edit:"M4 20h4L19 9l-4-4L4 16v4M13 6l4 4",chart:"M5 20V10M12 20V4M19 20v-7",file:"M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6",users:"M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M16 3a4 4 0 0 1 0 8M21 21v-2a4 4 0 0 0-3-4",gear:"M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM19 13a7 7 0 0 0 0-2l2-1-2-3-2 1a7 7 0 0 0-2-1l-.5-2h-3L11 7a7 7 0 0 0-2 1L7 7 5 10l2 1a7 7 0 0 0 0 2l-2 1 2 3 2-1a7 7 0 0 0 2 1l.5 2h3l.5-2a7 7 0 0 0 2-1l2 1 2-3-2-1Z",logout:"M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-7"}[type];return <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={p}/></svg>}

export default function Home(){
 const [session,setSession]=useState(null),[login,setLogin]=useState(false),[user,setUser]=useState(""),[pin,setPin]=useState(""),[err,setErr]=useState(""),[loading,setLoading]=useState(false);
 const [role,setRole]=useState(""),[profile,setProfile]=useState(null),[studentsData,setStudentsData]=useState([]),[assignments,setAssignments]=useState([]),[subjectsData,setSubjectsData]=useState([]),[classesData,setClassesData]=useState([]),[apiError,setApiError]=useState(""),[gradeError,setGradeError]=useState(""),[saving,setSaving]=useState(false);

 const [menu,setMenu]=useState("input"),[unit,setUnit]=useState(""),[klass,setKlass]=useState(""),[subject,setSubject]=useState(""),[student,setStudent]=useState(0),[grades,setGrades]=useState(initial),[saved,setSaved]=useState(false);
 const [gradeRows,setGradeRows]=useState([]);
 const effectiveStudents=studentsData;
 const effectiveAssignments=assignments||[];
 const units=["SMP","SMA","TMMIA"];
 const classes=[...new Set([
   ...classesData.filter(k=>!unit||k.unit===unit).map(k=>k.kelas),
   ...effectiveStudents.filter(s=>!unit||s.unit===unit).map(s=>s.kelas)
 ].filter(Boolean))];
 const subjectCatalog=useMemo(()=>{
   const byKey=new Map();
   const masterById=new Map(subjectsData.filter(s=>s.mapelId).map(s=>[String(s.mapelId),s]));
   const masterByCode=new Map(subjectsData.filter(s=>s.kodeMapel).map(s=>[String(s.kodeMapel),s]));
   effectiveAssignments.forEach(a=>{
     const m=masterById.get(String(a.mapelId))||masterByCode.get(String(a.kodeMapel))||{};
     const source=a.namaMapelSumber||a.mataPelajaran||m.namaMapelSumber||m.namaMapel||"";
     const raport=a.namaMapelRaport||m.namaMapelRaport||m.namaMapel||source;
     const arab=m.namaArabRaport||a.namaArabRaport||m.namaArab||"";
     const key=String(a.mapelId||a.kodeMapel||source).trim();
     if(!key) return;
     if(!byKey.has(key)) byKey.set(key,{...a,mapelId:a.mapelId||m.mapelId||"",kodeMapel:a.kodeMapel||m.kodeMapel||"",namaMapelSumber:source,namaMapelRaport:raport,namaArabRaport:arab,displayName:source});
   });
   subjectsData.forEach(s=>{
     const key=String(s.mapelId||s.kodeMapel||s.namaMapelRaport||s.namaMapel||"").trim();
     if(!key || byKey.has(key)) return;
     byKey.set(key,{mapelId:s.mapelId||"",kodeMapel:s.kodeMapel||"",unit:s.unit||"",namaMapelSumber:s.namaMapelSumber||s.namaMapel||"",namaMapelRaport:s.namaMapelRaport||s.namaMapel||"",namaArabRaport:s.namaArabRaport||s.namaArab||"",displayName:s.namaMapelSumber||s.namaMapel||""});
   });
   return [...byKey.values()];
 },[effectiveAssignments,subjectsData]);
 const availableSubjects=useMemo(()=>{ 
   if(!unit) return [];
   const source=subjectCatalog.filter(x=>String(x.unit||"").trim().toUpperCase()===unit);
   return [...new Set(source.map(x=>x.displayName).filter(Boolean))];
 },[subjectCatalog,unit]);

 useEffect(()=>{
   if(unit && !classes.includes(klass)) setKlass(classes[0]||"");
 },[unit,classes.join("|")]);

 useEffect(()=>{
   if(unit && subject && !availableSubjects.includes(subject)) setSubject("");
 },[unit,subject,availableSubjects.join("|")]);
 const studentsForClass=effectiveStudents.filter(s=>{const sKelas=s.kelas||s.KELAS||"";if(sKelas!==klass)return false;if(unit==="TMMIA")return true;return (s.unit||s.UNIT||"")===unit;});
 const selectedAssignment=useMemo(()=>{
   if(!unit || !subject) return null;

   // PRIORITAS 1: penugasan guru pada jenjang + kelas yang sedang dipilih.
   const exact=effectiveAssignments.find(a=>{
     const au=a.unit||"";
     const ac=a.kelas||"";
     const an=a.namaMapelSumber||a.mataPelajaran||a.displayName||"";
     return au===unit && ac===klass && an===subject;
   });
   if(exact){
     const master=subjectsData.find(s=>
       (exact.mapelId && String(s.mapelId)===String(exact.mapelId)) ||
       (exact.kodeMapel && String(s.kodeMapel)===String(exact.kodeMapel))
     );
     return {
       ...exact,
       namaMapelRaport:exact.namaMapelRaport||master?.namaMapelRaport||master?.namaMapel||subject,
       namaArabRaport:exact.namaArabRaport||master?.namaArabRaport||master?.namaArab||""
     };
   }

   // PRIORITAS 2: master mapel pada jenjang yang sama.
   return subjectCatalog.find(a=>
     a.unit===unit &&
     (a.displayName||a.namaMapelSumber||"")===subject
   ) || null;
 },[effectiveAssignments,subjectsData,subjectCatalog,unit,klass,subject]);
 const mapelId=selectedAssignment?.mapelId||"";
 const kodeMapel=selectedAssignment?.kodeMapel||"";
 const reportMapelName=selectedAssignment?.namaMapelRaport||selectedAssignment?.displayName||subject||"";
 const reportMapelArabic=selectedAssignment?.namaArabRaport||"";
 const selectedStudents=studentsForClass;

 const current=selectedStudents[student]||null;
 const nums=useMemo(()=>Object.values(grades).map(Number).filter(Number.isFinite),[grades]); const total=nums.reduce((a,b)=>a+b,0),avg=nums.length?total/nums.length:0;
 const normalizeGradeRow=(s,i)=>{
   const studentId=s.studentId||s.STUDENT_ID||s.id||s.ID||"";
   const nisn=s.nisn||s.NISN||s[1]||"";
   const name=s.namaSiswa||s.NAMA_SISWA||s.nama||s[0]||"";
   const cls=s.kelas||s.KELAS||klass;
   const value=gradeRows.find(g=>String(g.studentId||g.STUDENT_ID||"")===String(studentId) || String(g.nisn||g.NISN||"")===String(nisn));
   const raw=value?.nilai??value?.NILAI??"";
   return {studentId,nisn,name,cls,value:raw};
 };
 useEffect(()=>{
   if(!session?.token || !studentsForClass.length || !subject) return;
   let cancelled=false;
   (async()=>{
     setGradeError(""); setSaved(false);
     try{
       const params={unit,kelas:klass,mataPelajaran:subject};
       if(mapelId) params.mapelId=mapelId;
       const data=await api("grades",params,session.token);
       const rows=data.grades||data.data||[];
       if(!cancelled){
         setGradeRows(rows);
         const bySubject={};
         rows.forEach(r=>{
           const sid=r.studentId||r.STUDENT_ID||"";
           const nisn=r.nisn||r.NISN||"";
           const st=studentsForClass.find(s=>String(s.studentId||s.STUDENT_ID||"")===String(sid)||String(s.nisn||s.NISN||"")===String(nisn));
           if(st){
             const name=st.namaSiswa||st.NAMA_SISWA||st.nama||st[0]||"";
             bySubject[name]=r.nilai??r.NILAI??"";
           }
         });
         setGrades(bySubject);
       }
     }catch(e){ if(!cancelled) setGradeError("Nilai belum dapat dimuat: "+e.message); }
   })();
   return ()=>{cancelled=true};
 },[session?.token,unit,klass,subject,mapelId,studentsForClass.length]);

 useEffect(()=>{const s=getSession();if(!s?.token)return;setSession(s);setLogin(true);setUser(s.username||"");setRole(s.role||"");setProfile(s.user||null);loadData(s.token)},[]);
 const loadData=async(token)=>{
   setApiError("");
   if(!token){setApiError("Token sesi tidak tersedia. Silakan login kembali.");return}
   try{
     const me=await api("me",{},token);
     const meUser=me.user||me.profile||null;
     if(meUser){
       setRole(meUser.role||"");
       setProfile(meUser);
     }
   }catch(e){
     setApiError("Sesi login tidak dapat diverifikasi: "+e.message);
     if(/SESSION_INVALID|UNAUTHORIZED|AUTH/i.test(e.message)){
       clearSession();setLogin(false);setSession(null);setRole("");setProfile(null);
     }
     return;
   }
   const results=await Promise.allSettled([
     api("students",{},token),
     api("assignments",{},token),
     api("subjects",{},token),
     api("classes",{},token)
   ]);
   const errors=[];
   const stu=results[0].status==="fulfilled"?arrayFromResponse(results[0].value,"students","data","rows"):null;
   const ass=results[1].status==="fulfilled"?arrayFromResponse(results[1].value,"assignments","data","rows"):null;
   const sub=results[2].status==="fulfilled"?arrayFromResponse(results[2].value,"subjects","data","rows"):null;
   const cls=results[3].status==="fulfilled"?arrayFromResponse(results[3].value,"classes","data","rows"):null;
   if(stu!==null) setStudentsData(stu.map(normalizeStudent).filter(s=>s.studentId||s.nisn||s.namaSiswa));
   else errors.push("MASTER SISWA: "+results[0].reason.message);
   if(ass!==null) setAssignments(ass.map(normalizeAssignment).filter(a=>a.mataPelajaran||a.mapelId));
   else errors.push("PENUGASAN GURU: "+results[1].reason.message);
   if(sub!==null) setSubjectsData(sub.map(normalizeSubject).filter(s=>s.namaMapel));
   else errors.push("MASTER MAPEL: "+results[2].reason.message);
   if(cls!==null) setClassesData(cls.map(normalizeClass).filter(k=>k.kelas));
   else errors.push("MASTER KELAS: "+results[3].reason.message);
   if(errors.length) setApiError(errors.join(" | "));
 };
 const submit=async e=>{e.preventDefault();setErr("");if(!user.trim()||!/^\d{6,}$/.test(pin)){setErr("Username wajib diisi dan PIN minimal 6 digit.");return}
   setLoading(true);
   try{
     const data=await api("login",{username:user.trim(),pin});
     const token=data.token||data.sessionToken||data.session_token||data.data?.token||data.session?.token||"";
     if(!token) throw new Error("Login diterima server, tetapi token sesi tidak dikirim. Periksa endpoint login Apps Script.");
     const userData=data.user||data.profile||data.data?.user||null;
     const s={token,username:userData?.username||user.trim(),role:userData?.role||"",user:userData};
     saveSession(s);setSession(s);setLogin(true);setRole(s.role);setProfile(s.user);setPin("");setErr("");
     await loadData(token);
   }catch(e){setErr(e.message)}finally{setLoading(false)}
 };
 const logout=()=>{clearSession();setSession(null);setLogin(false);setRole("");setProfile(null);setStudentsData([]);setAssignments([]);setSubjectsData([]);setClassesData([]);setUser("");setPin("")};
 const setGrade=(name,v)=>{
   if(v===""||(/^\d{0,3}$/.test(v)&&Number(v)<=100)){
     setGrades(g=>({...g,[name]:v}));
     setSaved(false);
   }
 };
 const saveAllGrades=async()=>{
   if(!session?.token){setGradeError("Sesi login tidak tersedia.");return}
   if(!studentsForClass.length){setGradeError("Tidak ada siswa pada kelas yang dipilih.");return}
   if(!subject){setGradeError("Pilih mata pelajaran.");return}
   setSaving(true); setGradeError(""); setSaved(false);
   try{
     const rows=studentsForClass.map(s=>{
       const studentId=s.studentId||s.STUDENT_ID||"";
       const nisn=s.nisn||s.NISN||s[1]||"";
       const name=s.namaSiswa||s.NAMA_SISWA||s.nama||s[0]||"";
       const nilai=grades[name]===""||grades[name]==null?"":Number(grades[name]);
       return {studentId,nisn,namaSiswa:name,unit,kelas:klass,mapelId,kodeMapel,mataPelajaran:subject,nilai};
     }).filter(r=>r.studentId||r.nisn);
     const filled=rows.filter(r=>r.nilai!=="");
     if(!filled.length) throw new Error("Belum ada nilai yang diisi.");
     const payload=JSON.stringify(filled);
     const data=await api("saveGrades",{unit,kelas:klass,mataPelajaran:subject,mapelId,kodeMapel,items:payload,grades:payload,rows:payload,gradeRows:payload,gradesJson:payload,sessionToken:session.token},session.token,"POST");
     // Jangan menganggap tersimpan hanya karena request berhasil.
     // Baca kembali dari server dan verifikasi nilai yang baru dikirim.
     const verifyParams={unit,kelas:klass,mataPelajaran:subject};
     if(mapelId) verifyParams.mapelId=mapelId;
     if(kodeMapel) verifyParams.kodeMapel=kodeMapel;
     const verified=await api("grades",verifyParams,session.token);
     const verifyRows=verified.grades||verified.data||[];
     const mismatches=filled.filter(row=>{
       const hit=verifyRows.find(v=>{
         const sid=v.studentId||v.STUDENT_ID||"";
         const vn=v.nisn||v.NISN||"";
         return (row.studentId && String(sid)===String(row.studentId)) ||
                (row.nisn && String(vn)===String(row.nisn));
       });
       if(!hit) return true;
       const serverValue=hit.nilai??hit.NILAI??"";
       return Number(serverValue)!==Number(row.nilai);
     });
     if(mismatches.length){
       throw new Error("Server belum memverifikasi "+mismatches.length+" nilai. Tidak ada status 'Tersimpan' palsu.");
     }
     setSaved(true);
     setGradeRows(verifyRows.length?verifyRows:(data.grades||data.data||filled));
   }catch(e){setGradeError(e.message||"Gagal menyimpan nilai.");}
   finally{setSaving(false)}
 };

 if(!login)return <main className="login-page"><div className="orb a"/><div className="orb b"/><section className="login-card">
   <div className="login-brand">
   <img src={LOGO} alt="Logo Pondok Modern Al-Ghozali"/>
   <h1>RAPORT <b>INTEGRASI</b></h1>
   <h2>PONDOK MODERN AL-GHOZALI</h2>
   <div className="login-guide">
    <strong>PANDUAN LOGIN</strong>
    <p><b>Guru</b> — gunakan username dan PIN yang telah diberikan.</p>
    <p><b>Wali Kelas</b> — masuk dengan akun yang telah terdaftar untuk mengakses kelas bimbingan.</p>
    <p><b>Admin</b> — gunakan akses admin untuk mengelola seluruh sistem.</p>
   </div>
 </div>
   <form className="login-form" onSubmit={submit}><div><h2>Masuk ke Sistem</h2><p>Silakan masukkan username dan PIN Anda.</p></div><label>Username<input value={user} onChange={e=>setUser(e.target.value)} placeholder="Masukkan username" autoComplete="username"/></label><label>PIN<input value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))} type="password" inputMode="numeric" maxLength={12} placeholder="Masukkan PIN" autoComplete="current-password"/></label>{err&&<div className="error">{err}</div>}<button className="primary" type="submit" disabled={loading}><Icon type="logout"/> {loading?"Memeriksa...":"Masuk"}</button><small className="login-help">Lupa PIN? Hubungi Admin Sistem.</small><small>TA 2026/2027 • PTS Ganjil</small></form>
 </section><footer>© 2026 Pondok Modern Al-Ghozali</footer></main>;

 return <main className="shell"><header className="topbar"><div className="brand"><img src={LOGO} alt="Logo YPI Al-Ghozali"/><div><b>RAPORT PONDOK MODERN AL-GHOZALI</b><span>TA 2026/2027 • PTS GANJIL</span></div></div><div className="account"><div className="avatar">AG</div><div><b>{profile?.namaGuru||profile?.name||user}</b><span>{role==="WALI_KELAS"?"Wali Kelas":role==="GURU"?"Guru":role==="ADMIN"?"Administrator":role}</span></div><button onClick={logout}>Keluar</button></div></header>
 <div className="layout"><aside className="sidebar"><span className="menu-title">MENU UTAMA</span>{[["input","Input Nilai","edit"],["rekap","Rekap Nilai","chart"],["raport","Raport Web","file"],["master","Master Data","users"]].map(x=><button key={x[0]} className={menu===x[0]?"nav active":"nav"} onClick={()=>setMenu(x[0])}><Icon type={x[2]}/>{x[1]}</button>)}<span className="menu-title mt">SISTEM</span><button className={menu==="setting"?"nav active":"nav"} onClick={()=>setMenu("setting")}><Icon type="gear"/>Pengaturan</button><div className="safe"><b>● Mode aman</b><span>Nilai tidak disimpan di Local Storage.</span></div><small className="ver">AL-GHOZALI WEB • UI v2.0</small></aside>
 <section className="content"><div className="heading"><div><span>Beranda / {({input:"Input Nilai",rekap:"Rekap Nilai",raport:"Raport Web",master:"Master Data",setting:"Pengaturan"})[menu]}</span><h2>{({input:"Input Nilai Siswa",rekap:"Rekap Nilai",raport:"Raport Web",master:"Master Data",setting:"Pengaturan"})[menu]}</h2><p>Panel hanya menampilkan fungsi yang sedang dipilih.</p></div><div className="actions">{menu==="raport"&&<button className="outline" onClick={()=>window.print()}>⤓ Cetak PDF</button>}{menu==="input"&&<button className="primary compact" onClick={saveAllGrades} disabled={saving}>{saving?"Menyimpan...":"✓ Simpan Nilai"}</button>}</div></div>
 {menu==="input"&&<>
 <div className="module-card">
  <div className="module-title"><div><span className="module-kicker">INPUT NILAI</span><h3>Pilih konteks penilaian</h3><p>Filter tampil di dalam panel ini dan tidak memenuhi halaman ketika fungsi lain dipilih.</p></div></div>
  <div className="filter-grid"><label>Tahun Ajaran<select><option>2026/2027 — Ganjil</option></select></label><label>Jenjang<select value={unit} onChange={e=>{setUnit(e.target.value);setKlass("");setSubject("");}}><option value="">Pilih Jenjang</option>{units.map(x=><option key={x} value={x}>{x}</option>)}</select></label><label>Kelas<select value={klass} onChange={e=>{setKlass(e.target.value);setSubject("");}} disabled={!unit}><option value="">Pilih Kelas</option>{classes.map(x=><option key={x} value={x}>{x}</option>)}</select></label><label>Mata Pelajaran<select value={subject} onChange={e=>setSubject(e.target.value)} disabled={!unit||!klass}><option value="">Pilih Mata Pelajaran</option>{availableSubjects.map(x=>{const meta=subjectCatalog.find(s=>s.unit===unit&&s.displayName===x);return <option key={meta?.mapelId||meta?.kodeMapel||x} value={x}>{x}</option>})}</select></label></div>
 </div>
 <section className="card module-card"><div className="card-head"><div><h3>Input Nilai</h3><p>Input: {subject||"—"} • Rekap/Raport: {reportMapelName||"—"} • {klass} • {unit}</p></div><span className="pill">{saving?"Menyimpan...":saved?"Tersimpan":"Belum disimpan"}</span></div><div className="table-scroll"><table><thead><tr><th>No</th><th>NISN</th><th>Nama Siswa</th><th>Kelas</th><th>Nilai</th><th>Predikat</th></tr></thead><tbody>{studentsForClass.slice(0,200).map((s,i)=>{const r=normalizeGradeRow(s,i);const v=grades[r.name]??r.value??"";return <tr className={i===student?"selected":""} key={r.studentId||r.nisn||i}><td>{i+1}</td><td>{r.nisn}</td><td><button className="student" onClick={()=>setStudent(i)}>{r.name}</button></td><td>{r.cls}</td><td><input value={v} inputMode="numeric" maxLength={3} placeholder="-" onChange={e=>setGrade(r.name,e.target.value)}/></td><td><em className={"badge "+pred(v).toLowerCase()}>{pred(v)}</em></td></tr>})}</tbody></table></div><div className="foot">Menampilkan {studentsForClass.length||0} siswa • Master Siswa/Mapel/Kelas/Penugasan dari Apps Script {gradeError&&<span className="error">{gradeError}</span>} {apiError&&<span className="error">{apiError}</span>} </div></section>
 </>}
 {menu==="rekap"&&<section className="card module-card"><div className="card-head"><div><h3>Rekap Nilai</h3><p>Nama mapel rekap menggunakan <b>Nama Mapel Raport</b>, sedangkan Input Nilai menggunakan <b>Nama Mapel Sumber</b>. Keduanya terhubung melalui MAPEL_ID/KODE MAPEL.</p></div></div><div className="stats compact-stats">{[["617","Jumlah Siswa","Siswa aktif","green"],["124","Jumlah Guru","Guru aktif","gold"],["63","Jumlah Mapel","Mata pelajaran","blue"],["84%","Input Hari Ini","Progress nilai","purple"]].map(x=><div className="stat" key={x[1]}><i className={x[3]}>{x[0]==="84%"?"✓":"◆"}</i><div><span>{x[1]}</span><b>{x[0]}</b><small>{x[2]}</small></div></div>)}</div><div className="table-scroll"><table><thead><tr><th>Jenjang</th><th>Kelas</th><th>Mata Pelajaran</th><th>Guru</th><th>Status</th></tr></thead><tbody><tr><td>{unit||"—"}</td><td>{klass||"—"}</td><td>{reportMapelName||"—"}{reportMapelArabic&&<small className="mapel-arabic"> ({reportMapelArabic})</small>}</td><td>{profile?.namaGuru||profile?.name||user||"—"}</td><td><em className="badge b">{mapelId||kodeMapel?"Terhubung":"Belum terhubung"}</em></td></tr></tbody></table></div></section>}
 {menu==="raport"&&<aside className="card preview module-card"><div className="card-head"><div><h3>Preview Raport</h3><p>Render web • bukan tampilan Excel</p></div><button className="tiny" onClick={()=>window.print()}>Cetak</button></div><article className="report"><div className="rhead"><img src={LOGO} alt="Logo"/><div><h1>كشف الدرجات</h1><p>للامتحان التّحريري لمنتصف الفصل الدّراسي الأوّل</p></div><img src={LOGO} alt="Logo"/></div><div className="identity"><span><b>الاسم كامل :</b> {current[0]}</span><span><b>الصّفّ :</b> {klass==="1 - A"?"الأوّل - A":klass==="1 - B"?"الأوّل - B":klass==="2 - A"?"الثّاني - A":klass==="3 - A"?"الثّالث - A":klass}</span><span><b>الرقم :</b> {current[1]}</span><span><b>العام الدّراسي :</b> ٢۰۲٧ / ٢۰۲٦</span></div><table className="report-table"><thead><tr><th colSpan="3">الدّرجة الّتي حصلت عليها الطالب / الطالبة</th><th>Mata Pelajaran</th><th>المواد الدّراسيّة</th><th className="report-no-head">الرقم</th></tr></thead><tbody>{subjects.map((s,i)=>{let v=Number(grades[s[0]]);let value=Number.isFinite(v)?v:0;return <tr key={s[0]}><td className="grade-word">{arabicNumberWord(value)}</td><td className="grade-western">{Number.isFinite(v)?v:""}</td><td className="grade-arabic">{Number.isFinite(v)?toArabicDigits(v):""}</td><td className="subject-id">{s[0]}</td><td className="subject-ar" dir="rtl">{s[1]}</td><td className="arabic-no">{toArabicDigits(i+1)}</td></tr>})}<tr className="sum"><td></td><td>{nums.length?total:""}</td><td>{nums.length?toArabicDigits(total):""}</td><td>Jumlah</td><td dir="rtl">المجـموع</td><td></td></tr><tr className="sum"><td></td><td>{nums.length?avg.toFixed(2):""}</td><td>{nums.length?toArabicDigits(avg.toFixed(2)):""}</td><td>Nilai Rata Rata</td><td dir="rtl">النتيجـة المـعدّلة</td><td></td></tr><tr className="sum"><td>الأول</td><td>1</td><td>١</td><td>Peringkat</td><td dir="rtl">المقام</td><td></td></tr></tbody></table><div className="date">تحريرا بغونونج سندور، ۱۰ اكتوبار ٢۰۲٦/ ٢٧ ربيع الآخر ۱٤٤۸</div><div className="sign"><div><b>ولي الأمر</b><span className="sign-line"></span><small>________________</small></div><div><b>ولي الفصل</b><span className="sign-line"></span><small>Amalia Nur Fariha, S.Pd</small></div><div><b>مـدير المـعهد</b><span className="sign-line"></span><small>M. Ya'qub Unang, S.Ag</small></div></div></article></aside>}
 {menu==="master"&&<section className="card module-card"><div className="card-head"><div><h3>Master Data</h3><p>Ringkasan struktur master. Detail akan dibatasi sesuai peran pengguna setelah Apps Script aktif.</p></div></div><div className="stats compact-stats">{[["617","Master Siswa","Data siswa aktif","green"],["124","Master Guru","Data guru aktif","gold"],["63","Master Mapel","Kode mata pelajaran","blue"],["9","Master Kelas","Kelompok kelas","purple"]].map(x=><div className="stat" key={x[1]}><i className={x[3]}>{x[0]==="9"?"◆":"●"}</i><div><span>{x[1]}</span><b>{x[0]}</b><small>{x[2]}</small></div></div>)}</div></section>}
 {menu==="setting"&&<section className="card module-card"><div className="card-head"><div><h3>Pengaturan</h3><p>Konfigurasi sistem akan dikelola setelah backend Apps Script dihubungkan.</p></div></div><div className="settings-grid"><div className="safe"><b>● Mode aman</b><span>Nilai tidak disimpan di Local Storage.</span></div><div className="safe"><b>● Sumber data</b><span>Google Spreadsheet melalui Apps Script.</span></div><div className="safe"><b>● Akses</b><span>Guru, Wali Kelas, dan Admin akan dibatasi berdasarkan peran.</span></div></div></section>}</section></div></main>;
}
