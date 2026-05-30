"use client"
import { useState, useEffect, useRef } from "react"
import { Upload, FileText, File, ImageIcon, Trash2, Download, FolderOpen, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, formatFileSize, DOCUMENT_FOLDERS } from "@/lib/utils"

interface Doc { id:string; originalName:string; path:string; size:number; mimeType:string; folder:string; description:string|null; createdAt:string }

const ICONS: Record<string,string> = { CONTRACTS:"📋", DRAWINGS:"📐", REPORTS:"📊", PERMITS:"🏛️", OTHER:"📁" }

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
      const fd = new FormData(); fd.append("file", file); fd.append("folder", upFolder); if (upDesc) fd.append("description", upDesc)
      const res = await fetch("/api/documents", { method:"POST", body: fd })
      if (!res.ok) throw new Error()
      toast({ title:"Hujjat yuklandi" }); setOpen(false); setFile(null); setUpDesc(""); if (fileRef.current) fileRef.current.value = ""; load()
    } catch { toast({ variant:"destructive", title:"Yuklanmadi" }) }
    finally { setUpl(false) }
  }

  const del = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return
    await fetch(`/api/documents/${id}`, { method:"DELETE" })
    toast({ title:"O'chirildi" }); load()
  }

  const getIcon = (mime: string) => {
    if (mime.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-emerald-500" />
    if (mime === "application/pdf") return <FileText className="h-8 w-8 text-red-500" />
    if (mime.includes("word") || mime.includes("document")) return <FileText className="h-8 w-8 text-blue-500" />
    return <File className="h-8 w-8 text-muted-foreground" />
  }

  const filtered = docs.filter(d =>
    d.originalName.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  )

  const counts = Object.keys(DOCUMENT_FOLDERS).reduce((acc, k) => { acc[k] = docs.filter(d => d.folder === k).length; return acc }, {} as Record<string,number>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div><h2 className="text-xl font-bold">Hujjatlar Markazi</h2><p className="text-sm text-muted-foreground">{docs.length} ta hujjat</p></div>
        <Button onClick={() => setOpen(true)} className="gap-2"><Upload className="h-4 w-4" />Hujjat yuklash</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {[["ALL","📂 Barchasi", docs.length] as const, ...Object.entries(DOCUMENT_FOLDERS).map(([k,v]) => [k, `${ICONS[k]} ${v}`, counts[k]||0] as const)].map(([k,label,count]) => (
            <button key={k} onClick={() => setFolder(k as string)}
              className={cn("w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                folder === k ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              <span>{label as string}</span>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", folder === k ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>{count as number}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Hujjat qidirish..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{[1,2,3,4].map(i => <div key={i} className="h-36 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FolderOpen className="h-16 w-16 mb-4 opacity-20" /><p className="text-lg font-medium">Hujjat topilmadi</p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => setOpen(true)}><Upload className="h-4 w-4" />Yuklash</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(doc => (
                <Card key={doc.id} className="group hover:shadow-md transition-all">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex flex-col items-center text-center mb-2">
                      {doc.mimeType.startsWith("image/")
                        ? <a href={doc.path} target="_blank" rel="noopener noreferrer"><img src={doc.path} alt={doc.originalName} className="h-16 w-full object-cover rounded-md mb-2" /></a>
                        : <div className="h-16 flex items-center justify-center mb-2">{getIcon(doc.mimeType)}</div>
                      }
                    </div>
                    <p className="text-xs font-medium truncate" title={doc.originalName}>{doc.originalName}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)} · {formatDate(doc.createdAt)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{ICONS[doc.folder]} {DOCUMENT_FOLDERS[doc.folder]}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={doc.path} download={doc.originalName} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-6 w-6"><Download className="h-3.5 w-3.5" /></Button>
                        </a>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => del(doc.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Hujjat Yuklash</DialogTitle><DialogDescription>PDF, DOCX, JPG, PNG, DWG fayllarni yuklang</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Papka</Label>
              <Select value={upFolder} onValueChange={setUpFolder}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(DOCUMENT_FOLDERS).map(([k,v]) => <SelectItem key={k} value={k}>{ICONS[k]} {v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fayl *</Label>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} accept=".pdf,.docx,.doc,.xlsx,.xls,.dwg,.jpg,.jpeg,.png,.gif" />
                {file ? <div><p className="font-medium text-sm">{file.name}</p><p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p></div>
                  : <div><Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Fayl tanlash uchun bosing</p></div>}
              </div>
            </div>
            <div className="space-y-1.5"><Label>Tavsif</Label><Textarea rows={2} placeholder="Ixtiyoriy..." value={upDesc} onChange={e => setUpDesc(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor</Button>
            <Button onClick={upload} disabled={uploading || !file}>{uploading ? "Yuklanmoqda..." : "Yuklash"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
