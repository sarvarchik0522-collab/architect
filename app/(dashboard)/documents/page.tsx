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

const FOLDER_META: Record<string, { emoji:string }> = {
  CONTRACTS: { emoji:"📋" },
  DRAWINGS:  { emoji:"📐" },
  REPORTS:   { emoji:"📊" },
  PERMITS:   { emoji:"🏛️" },
  OTHER:     { emoji:"📁" },
}

const FILE_TYPE_ICON: Record<string, JSX.Element> = {
  pdf:  <FileText className="h-8 w-8 text-[#888]" />,
  docx: <FileText className="h-8 w-8 text-[#888]" />,
  doc:  <FileText className="h-8 w-8 text-[#888]" />,
  xlsx: <FileText className="h-8 w-8 text-[#888]" />,
  dwg:  <FileText className="h-8 w-8 text-[#888]" />,
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
    if (doc.mimeType.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-[#666]" />
    const ext = doc.originalName.split(".").pop()?.toLowerCase() ?? ""
    return FILE_TYPE_ICON[ext] ?? <File className="h-8 w-8 text-[#444]" />
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
    <div className="space-y-8 page-enter">

      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0d0d0d] border border-[#222] p-8 text-white">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-[#aaa]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Hujjatlar Markazi</h2>
                <p className="text-[#666] text-sm">{docs.length} ta hujjat · {Object.values(counts).filter(c=>c>0).length} ta papka</p>
              </div>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} className="btn-primary gap-2 rounded-xl h-10 px-5">
            <Upload className="h-4 w-4" /> Hujjat yuklash
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Folder sidebar ── */}
        <div className="space-y-2">
          {/* All */}
          <button onClick={() => setFolder("ALL")}
            className={cn("folder-item w-full flex items-center justify-between px-3 py-3 rounded-xl border transition-all",
              folder === "ALL" ? "active bg-[#1a1a1a] border-[#444]" : "border-[#222] bg-[#111] hover:border-[#333]")}>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-lg">📂</div>
              <span className="font-semibold text-sm text-white">Barchasi</span>
            </div>
            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
              folder === "ALL" ? "bg-white text-[#111]" : "bg-[#1a1a1a] border border-[#333] text-[#555]")}>
              {docs.length}
            </span>
          </button>

          {/* Folders */}
          {Object.entries(DOCUMENT_FOLDERS).map(([k, label]) => {
            const meta = FOLDER_META[k]
            return (
              <button key={k} onClick={() => setFolder(k)}
                className={cn("folder-item w-full flex items-center justify-between px-3 py-3 rounded-xl border transition-all",
                  folder === k ? "active bg-[#1a1a1a] border-[#444]" : "border-[#222] bg-[#111] hover:border-[#333]")}>
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-lg">{meta.emoji}</div>
                  <span className="font-semibold text-sm text-white">{label}</span>
                </div>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                  folder === k ? "bg-white text-[#111]" : "bg-[#1a1a1a] border border-[#333] text-[#555]")}>
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
              dragActive ? "border-[#555] bg-[#1a1a1a]" : "border-[#222] hover:border-[#333]"
            )}>
            <Upload className={cn("h-6 w-6 mx-auto mb-1", dragActive ? "text-[#888]" : "text-[#333]")} />
            <p className="text-xs text-[#444]">Faylni shu yerga tashlang</p>
          </div>
        </div>

        {/* ── Documents grid ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
            <Input placeholder="Hujjat qidirish..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-[#222] bg-[#111] text-white" />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-36 rounded-2xl" style={{ animationDelay:`${i*0.07}s` }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#444]">
              <div className="h-16 w-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-3">
                <FolderOpen className="h-8 w-8 opacity-30" />
              </div>
              <p className="font-semibold text-[#555]">Hujjat topilmadi</p>
              <Button variant="outline" className="mt-4 gap-2 rounded-xl border-[#333] text-[#888]" onClick={() => setOpen(true)}>
                <Upload className="h-4 w-4" /> Yuklash
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((doc, i) => {
                const meta = FOLDER_META[doc.folder] ?? FOLDER_META.OTHER
                return (
                  <div key={doc.id} className="arch-card arch-card-lift group animate-card"
                    style={{ animationDelay:`${i*0.06}s` }}>
                    <div className="h-1 w-full bg-[#333]" />
                    <div className="p-3">
                      {/* Preview */}
                      <div className="flex items-center justify-center h-16 mb-3">
                        {doc.mimeType.startsWith("image/") ? (
                          <a href={doc.path} target="_blank" rel="noopener noreferrer" className="w-full h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={doc.path} alt={doc.originalName} className="w-full h-full object-cover rounded-xl" />
                          </a>
                        ) : (
                          <div>{getFileIcon(doc)}</div>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-white truncate mb-0.5" title={doc.originalName}>
                        {doc.originalName}
                      </p>
                      <p className="text-[10px] text-[#444]">{formatFileSize(doc.size)} · {formatDate(doc.createdAt)}</p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#222]">
                        <span className="text-xs px-1.5 py-0.5 rounded-lg font-medium bg-[#1a1a1a] text-[#666] border border-[#333]">
                          {meta.emoji} {DOCUMENT_FOLDERS[doc.folder as keyof typeof DOCUMENT_FOLDERS]}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={doc.path} download={doc.originalName} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg hover:bg-[#1a1a1a]">
                              <Download className="h-3 w-3 text-[#555] hover:text-[#aaa]" />
                            </Button>
                          </a>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg hover:bg-[#1a1a1a]"
                            onClick={() => del(doc.id)}>
                            <Trash2 className="h-3 w-3 text-[#555] hover:text-[#aaa]" />
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
        <DialogContent className="max-w-md rounded-2xl bg-[#111] border border-[#222]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Hujjat Yuklash</DialogTitle>
            <DialogDescription className="text-[#666]">PDF, DOCX, JPG, PNG, DWG fayllarni yuklang</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label className="text-[#888]">Papka</Label>
              <Select value={upFolder} onValueChange={setUpFolder}>
                <SelectTrigger className="rounded-xl h-11 bg-[#0d0d0d] border-[#333] text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_FOLDERS).map(([k,v]) => (
                    <SelectItem key={k} value={k}>{FOLDER_META[k].emoji} {v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#888]">Fayl *</Label>
              <div onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={e => { e.preventDefault(); setDragActive(false); setFile(e.dataTransfer.files?.[0] ?? null) }}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                  dragActive ? "border-[#555] bg-[#1a1a1a]" : "border-[#333] hover:border-[#444]"
                )}>
                <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.dwg,.jpg,.jpeg,.png,.gif" />
                {file ? (
                  <div>
                    <p className="text-sm font-semibold text-white">{file.name}</p>
                    <p className="text-xs text-[#555] mt-0.5">{formatFileSize(file.size)}</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-[#333]" />
                    <p className="text-sm text-[#555]">Fayl tanlash yoki tashlash</p>
                    <p className="text-xs text-[#444] mt-0.5">PDF, DOCX, JPG, PNG, DWG</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-[#888]">Tavsif (ixtiyoriy)</Label>
              <Textarea rows={2} placeholder="Hujjat haqida..." value={upDesc} className="rounded-xl resize-none bg-[#0d0d0d] border-[#333] text-white"
                onChange={e => setUpDesc(e.target.value)} /></div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl border-[#333] text-[#888]">Bekor</Button>
            <Button onClick={upload} disabled={uploading || !file} className="btn-primary rounded-xl">
              {uploading ? "Yuklanmoqda..." : "Yuklash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
