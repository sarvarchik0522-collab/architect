"use client"
import { useState, useEffect, useRef } from "react"
import { Upload, FileText, File, ImageIcon, Trash2, Download, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatDate, formatFileSize, DOCUMENT_FOLDERS } from "@/lib/utils"

interface Doc { id:string; originalName:string; path:string; size:number; mimeType:string; folder:string; description:string|null; createdAt:string }
const FOLDERS_META: Record<string,{label:string;icon:string}> = {
  CONTRACTS:{ label:"Shartnomalar", icon:"📋" },
  DRAWINGS: { label:"Chizmalar",    icon:"📐" },
  REPORTS:  { label:"Hisobotlar",   icon:"📊" },
  PERMITS:  { label:"Ruxsatnomalar",icon:"🏛️" },
  OTHER:    { label:"Boshqa",       icon:"📁" },
}

export default function DocumentsPage() {
  const [docs,     setDocs]    = useState<Doc[]>([])
  const [loading,  setLoading] = useState(true)
  const [folder,   setFolder]  = useState("ALL")
  const [search,   setSearch]  = useState("")
  const [open,     setOpen]    = useState(false)
  const [upFolder, setUpF]     = useState("OTHER")
  const [file,     setFile]    = useState<File|null>(null)
  const [uploading,setUpl]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    const url = folder!=="ALL" ? `/api/documents?folder=${folder}` : "/api/documents"
    setDocs(await fetch(url).then(r=>r.json()))
    setLoading(false)
  }
  useEffect(()=>{ load() },[folder])

  const upload = async () => {
    if (!file) return toast({variant:"destructive",title:"Fayl tanlang"})
    setUpl(true)
    try {
      const fd = new FormData(); fd.append("file",file); fd.append("folder",upFolder)
      await fetch("/api/documents",{method:"POST",body:fd})
      toast({title:"Yuklandi"}); setOpen(false); setFile(null); if (fileRef.current) fileRef.current.value=""; load()
    } catch { toast({variant:"destructive",title:"Xatolik"}) }
    finally { setUpl(false) }
  }

  const del = async (id:string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/documents/${id}`,{method:"DELETE"})
    toast({title:"O'chirildi"}); load()
  }

  const filtered = docs.filter(d=>
    d.originalName.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  )
  const counts = Object.keys(DOCUMENT_FOLDERS).reduce((a,k)=>({...a,[k]:docs.filter(d=>d.folder===k).length}),{} as Record<string,number>)

  return (
    <div className="space-y-5" style={{color:"#f0f0f0"}}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight">Hujjatlar</h2>
          <p style={{fontSize:12,color:"#555"}}>{docs.length} ta hujjat</p>
        </div>
        <button onClick={()=>setOpen(true)} className="btn-primary h-9 px-4 text-sm flex items-center gap-2">
          <Upload className="h-4 w-4"/> Yuklash
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Folder sidebar */}
        <div className="space-y-1">
          <button onClick={()=>setFolder("ALL")}
            className={`folder-item w-full flex items-center justify-between px-3 py-2.5 border transition-all ${folder==="ALL"?"active":""}`}
            style={{border:`1px solid ${folder==="ALL"?"#333":"transparent"}`}}>
            <div className="flex items-center gap-2.5">
              <span>📂</span>
              <span className="text-sm font-medium" style={{color:folder==="ALL"?"#f0f0f0":"#666"}}>Barchasi</span>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{background:"#1a1a1a",color:"#444"}}>{docs.length}</span>
          </button>
          {Object.entries(DOCUMENT_FOLDERS).map(([k,label])=>{
            const meta = FOLDERS_META[k]
            return (
              <button key={k} onClick={()=>setFolder(k)}
                className={`folder-item w-full flex items-center justify-between px-3 py-2.5 border transition-all ${folder===k?"active":""}`}
                style={{border:`1px solid ${folder===k?"#333":"transparent"}`}}>
                <div className="flex items-center gap-2.5">
                  <span>{meta.icon}</span>
                  <span className="text-sm font-medium" style={{color:folder===k?"#f0f0f0":"#666"}}>{label}</span>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{background:"#1a1a1a",color:"#444"}}>{counts[k]||0}</span>
              </button>
            )
          })}
          <div
            onDragOver={e=>{e.preventDefault();(e.currentTarget as HTMLElement).style.borderColor="#555"}}
            onDragLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="#1e1e1e"}}
            onDrop={e=>{e.preventDefault();(e.currentTarget as HTMLElement).style.borderColor="#1e1e1e";
              const f=e.dataTransfer.files?.[0];if(f){setFile(f);setOpen(true)}}}
            className="mt-3 p-4 rounded text-center cursor-pointer transition-colors"
            style={{border:"1px dashed #1e1e1e"}}>
            <Upload className="h-5 w-5 mx-auto mb-1" style={{color:"#333"}}/>
            <p className="text-xs" style={{color:"#444"}}>Faylni tashlang</p>
          </div>
        </div>

        {/* Docs grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{color:"#444"}}/>
            <input placeholder="Qidirish..." value={search} onChange={e=>setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm rounded"
              style={{background:"#111",border:"1px solid #222",color:"#f0f0f0",outline:"none"}}/>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1,2,3].map(i=><div key={i} className="skeleton h-32"/>)}
            </div>
          ) : filtered.length===0 ? (
            <div className="flex flex-col items-center py-16" style={{color:"#444"}}>
              <FileText className="h-10 w-10 mb-3 opacity-20"/>
              <p className="font-semibold" style={{color:"#666"}}>Hujjat topilmadi</p>
              <button onClick={()=>setOpen(true)} className="btn-ghost mt-4 h-9 px-4 text-sm">Yuklash</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((doc,i)=>{
                const isImg = doc.mimeType.startsWith("image/")
                const ext = doc.originalName.split(".").pop()?.toLowerCase()??""
                return (
                  <div key={doc.id} className="arch-card arch-card-lift group animate-card" style={{animationDelay:`${i*0.05}s`}}>
                    <div className="p-3">
                      {isImg ? (
                        <a href={doc.path} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={doc.path} alt={doc.originalName} className="w-full h-20 object-cover rounded mb-2"
                            style={{opacity:0.8}}/>
                        </a>
                      ) : (
                        <div className="h-20 flex items-center justify-center mb-2">
                          {ext==="pdf"?<FileText className="h-8 w-8" style={{color:"#555"}}/>:
                           ext==="dwg"?<File className="h-8 w-8" style={{color:"#888"}}/>:
                           <File className="h-8 w-8" style={{color:"#444"}}/>}
                        </div>
                      )}
                      <p className="text-xs font-semibold truncate mb-0.5" style={{color:"#ccc"}} title={doc.originalName}>
                        {doc.originalName}
                      </p>
                      <p className="text-xs" style={{color:"#444"}}>{formatFileSize(doc.size)}</p>
                      <div className="flex items-center justify-between mt-2 pt-2" style={{borderTop:"1px solid #1a1a1a"}}>
                        <span className="text-xs" style={{color:"#444"}}>{FOLDERS_META[doc.folder]?.icon} {FOLDERS_META[doc.folder]?.label||doc.folder}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={doc.path} download={doc.originalName} target="_blank" rel="noopener noreferrer">
                            <button className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#1e1e1e]" style={{color:"#555"}}>
                              <Download className="h-3 w-3"/>
                            </button>
                          </a>
                          <button onClick={()=>del(doc.id)} className="h-6 w-6 rounded flex items-center justify-center hover:bg-[#1e1e1e]" style={{color:"#555"}}>
                            <Trash2 className="h-3 w-3"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded" style={{background:"#0f0f0f",border:"1px solid #222",color:"#f0f0f0"}}>
          <DialogHeader>
            <DialogTitle style={{color:"#f0f0f0"}}>Hujjat Yuklash</DialogTitle>
            <DialogDescription style={{color:"#555"}}>Fayl tanlang</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Papka</label>
              <select value={upFolder} onChange={e=>setUpF(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded"
                style={{background:"#0d0d0d",border:"1px solid #222",color:"#888",outline:"none"}}>
                {Object.entries(DOCUMENT_FOLDERS).map(([k,v])=>(
                  <option key={k} value={k}>{FOLDERS_META[k]?.icon} {v}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{color:"#555"}}>Fayl</label>
              <div onClick={()=>fileRef.current?.click()}
                className="p-6 rounded text-center cursor-pointer transition-colors"
                style={{border:"1px dashed #2a2a2a"}}>
                <input ref={fileRef} type="file" className="hidden"
                  onChange={e=>setFile(e.target.files?.[0]??null)}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.dwg,.jpg,.jpeg,.png,.gif"/>
                {file ? (
                  <div>
                    <p className="text-sm font-semibold" style={{color:"#f0f0f0"}}>{file.name}</p>
                    <p className="text-xs mt-1" style={{color:"#555"}}>{(file.size/1024/1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-7 w-7 mx-auto mb-2" style={{color:"#333"}}/>
                    <p className="text-sm" style={{color:"#555"}}>Fayl tanlash uchun bosing</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={()=>setOpen(false)} className="btn-ghost h-9 px-4 text-sm">Bekor</button>
            <button onClick={upload} disabled={uploading||!file} className="btn-primary h-9 px-4 text-sm">
              {uploading?"Yuklanmoqda...":"Yuklash"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
