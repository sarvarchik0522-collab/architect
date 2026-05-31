"use client"
import { useState, useEffect, useRef } from "react"
import { Upload, FileText, File, ImageIcon, Trash2, Download, FolderOpen, Search, FolderClosed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatFileSize, DOCUMENT_FOLDERS } from "@/lib/utils"

interface Doc { id:string; originalName:string; path:string; size:number; mimeType:string; folder:string; description:string|null; createdAt:string }

const FOLDER_META: Record<string, { icon:string; emoji:string; gradient:string; bg:string; text:string }> = {
  CONTRACTS: { icon:"📋", emoji:"📋", gradient:"from-blue-500 to-blue-700",   bg:"bg-blue-50 dark:bg-blue-950/30",   text:"text-blue-600 dark:text-blue-400" },
  DRAWINGS:  { icon:"📐", emoji:"📐", gradient:"from-violet-500 to-violet-700", bg:"bg-violet-50 dark:bg-violet-950/30", text:"text-violet-600 dark:text-violet-400" },
  REPORTS:   { icon:"📊", emoji:"📊", gradient:"from-emerald-500 to-emerald-700",bg:"bg-emerald-50 dark:bg-emerald-950/30",text:"text-emerald-600 dark:text-emerald-400" },
  PERMITS:   { icon:"🏛️", emoji:"🏛️", gradient:"from-orange-500 to-orange-700", bg:"bg-orange-50 dark:bg-orange-950/30", text:"text-orange-600 dark:text-orange-400" },
  OTHER:     { icon:"📁", emoji:"📁", gradient:"from-slate-500 to-slate-700",   bg:"bg-slate-50 dark:bg-slate-800",     text:"text-slate-600 dark:text-slate-400" },
}

const FILE_TYPE_ICON: Record<string, JSX.Element> = {
  pdf:  <FileText className="h-8 w-8 text-red-500" />,
  docx: <FileText className="h-8 w-8 text-blue-500" />,
  doc:  <FileText className="h-8 w-8 text-blue-500" />,
  xlsx: <FileText className="h-8 w-8 text-green-600" />,
  dwg:  <FileText className="h-8 w-8 text-orange-500" />,
}

export default function DocumentsPage() {
  const [docs,     setDocs]     = useState<Doc[]>([])
  const [loading,  setLoading]  = useState(true)
  const [folder,   setFolder]   = useState("ALL")
  const [search,   setSearch]   = useState("")
  const [open,     setOpen]     = useState(false)
  const [upFolder, setUpFolder] = useState("OTHER")
  const [upDesc,   setUpDesc]   = useState("")
  const [file,     setFile]     = useState<File|null>(null)
  const [uploading,setUpl]      = useState(false)
  const [dragActive,setDragActive] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    const url = folder !== "ALL" ? `/api/documents?folder=${folder}` : "/api/documents"
    setDocs(await fetch(url).then(r => r.json()))
    setLoading(false)
  }
  useEffect(() => { load() }, [folder])

  const upload = async () => {
    if (!file) return toast({ variant:"destructive", title:"Fayl tanlang" })
    setUpl(true)
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("folder", upFolder)
      if (upDesc) fd.append("description", upDesc)
      const res = await fetch("/api/documents", { method:"POST", body: fd })
      if (!res.ok) throw new Error()
      toast({ title:"Hujjat yuklandi ✓" }); setOpen(false); setFile(null); setUpDesc("")
      if (fileRef.current) fileRef.current.value = ""; load()
    } catch { toast({ variant:"destructive", title:"Yuklanmadi" }) }
    finally { setUpl(false) }
  }

  const del = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/documents/${id}`, { method:"DELETE" })
    toast({ title:"O'chirildi" }); load()
  }

  const getFileIcon = (doc: Doc) => {
    if (doc.mimeType.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-emerald-500" />
    const ext = doc.originalName.split(".").pop()?.toLowerCase() ?? ""
    return FILE_TYPE_ICON[ext] ?? <File className="h-8 w-8 text-slate-400" />
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false)
    const f = e.dataTransfer.files?.[0]
    if (f) { setFile(f); setOpen(true) }
  }

  const filtered = docs.filter(d =>
    d.originalName.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  )

  const counts = Object.keys(DOCUMENT_FOLDERS).reduce((acc, k) => {
    acc[k] = docs.filter(d => d.folder === k).length; return acc
  }, {} as Record<string,number>)

  return (
    <div className="space-y-8 page-enter arch-pattern">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-cyan-700 to-teal-800 p-8 text-white">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <svg width="180" height="180" viewBox="0 0 180 180" className="animate-float">
            <rect x="30" y="20" width="120" height="140" rx="8" fill="none" stroke="white" strokeWidth="1.5"/>
            <path d="M30 55 L90 25 L150 55" fill="none" stroke="white" strokeWidth="1.5"/>
            <rect x="50" y="80" width="30" height="80" fill="white" opacity="0.15"/>
            <rect x="90" y="65" width="40" height="95" fill="white" opacity="0.15"/>
            <line x1="30" y1="160" x2="150" y2="160" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Hujjatlar Markazi</h2>
                <p className="text-cyan-200 text-sm">{docs.length} ta hujjat · {Object.values(counts).filter(c=>c>0).length} ta papka</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-white text-cyan-700 hover:bg-cyan-50 gap-2 rounded-xl h-10 px-5 font-semibold shadow-lg">
            <Upload className="h-4 w-4" /> Hujjat yuklash
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Folder sidebar ── */}
        <div className="space-y-2">
          {/* All */}
          <button onClick={() => setFolder("ALL")}
            className={cn("folder-item w-full flex items-center justify-between px-3 py-3 border transition-all",
              folder === "ALL" ? "active border-blue-200 dark:border-blue-800 shadow-sm" : "border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900")}>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">📂</div>
              <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Barchasi</span>
            </div>
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
              folder === "ALL" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
              {docs.length}
            </span>
          </button>

          {/* Folders */}
          {Object.entries(DOCUMENT_FOLDERS).map(([k, label]) => {
            const meta = FOLDER_META[k]
            return (
              <button key={k} onClick={() => setFolder(k)}
                className={cn("folder-item w-full flex items-center justify-between px-3 py-3 border transition-all",
                  folder === k ? "active border-blue-200 dark:border-blue-800 shadow-sm" : "border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900")}>
                <div className="flex items-center gap-2.5">
                  <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-lg", meta.bg)}>{meta.emoji}</div>
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{label}</span>
                </div>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                  folder === k ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
                  {counts[k] || 0}
                </span>
              </button>
            )
          })}

          {/* Drag zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              "mt-4 p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all",
              dragActive ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" : "border-slate-200 dark:border-slate-700 hover:border-cyan-300"
            )}>
            <Upload className={cn("h-6 w-6 mx-auto mb-1", dragActive ? "text-blue-500" : "text-slate-300")} />
            <p className="text-xs text-slate-400">Faylni shu yerga tashlang</p>
          </div>
        </div>

        {/* ── Documents grid ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Hujjat qidirish..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-36 rounded-2xl" style={{ animationDelay:`${i*0.07}s` }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="h-16 w-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 flex items-center justify-center mb-3 animate-float">
                <FolderOpen className="h-8 w-8 text-cyan-300" />
              </div>
              <p className="font-semibold text-slate-500">Hujjat topilmadi</p>
              <Button variant="outline" className="mt-4 gap-2 rounded-xl" onClick={() => setOpen(true)}>
                <Upload className="h-4 w-4" /> Yuklash
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((doc, i) => {
                const meta = FOLDER_META[doc.folder] ?? FOLDER_META.OTHER
                return (
                  <div key={doc.id} className="doc-card bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group animate-card"
                    style={{ animationDelay:`${i*0.06}s` }}>
                    {/* Folder color top */}
                    <div className={cn("h-1 w-full bg-gradient-to-r", meta.gradient)} />
                    <div className="p-3">
                      {/* Preview */}
                      <div className="flex items-center justify-center h-16 mb-3">
                        {doc.mimeType.startsWith("image/") ? (
                          <a href={doc.path} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={doc.path} alt={doc.originalName} className="doc-icon w-full h-full object-cover rounded-xl" />
                          </a>
                        ) : (
                          <div className="doc-icon">{getFileIcon(doc)}</div>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate mb-0.5" title={doc.originalName}>
                        {doc.originalName}
                      </p>
                      <p className="text-[10px] text-slate-400">{formatFileSize(doc.size)} · {formatDate(doc.createdAt)}</p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className={cn("text-xs px-1.5 py-0.5 rounded-lg font-medium", meta.bg, meta.text)}>
                          {meta.emoji} {DOCUMENT_FOLDERS[doc.folder as keyof typeof DOCUMENT_FOLDERS]}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={doc.path} download={doc.originalName} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-950/30">
                              <Download className="h-3 w-3 text-slate-400 hover:text-cyan-600" />
                            </Button>
                          </a>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => del(doc.id)}>
                            <Trash2 className="h-3 w-3 text-slate-400 hover:text-red-500" />
                          </Button>
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

      {/* ── Upload Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Hujjat Yuklash</DialogTitle>
            <DialogDescription>PDF, DOCX, JPG, PNG, DWG fayllarni yuklang</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Papka</Label>
              <Select value={upFolder} onValueChange={setUpFolder}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_FOLDERS).map(([k,v]) => (
                    <SelectItem key={k} value={k}>{FOLDER_META[k].emoji} {v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fayl *</Label>
              <div onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={e => { e.preventDefault(); setDragActive(false); setFile(e.dataTransfer.files?.[0] ?? null) }}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                  dragActive ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-950/20" : "border-slate-200 dark:border-slate-700 hover:border-cyan-300"
                )}>
                <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.dwg,.jpg,.jpeg,.png,.gif" />
                {file ? (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(file.size)}</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm text-slate-400">Fayl tanlash yoki tashlash</p>
                    <p className="text-xs text-slate-300 mt-0.5">PDF, DOCX, JPG, PNG, DWG</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5"><Label>Tavsif (ixtiyoriy)</Label>
              <Textarea rows={2} placeholder="Hujjat haqida..." value={upDesc} className="rounded-xl resize-none"
                onChange={e => setUpDesc(e.target.value)} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Bekor</Button>
            <Button onClick={upload} disabled={uploading || !file} className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl">
              {uploading ? "Yuklanmoqda..." : "Yuklash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
