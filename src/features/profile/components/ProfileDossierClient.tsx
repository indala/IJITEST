"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
    Globe,
    Clock,
    Camera,
    FileText,
    Search,
    Plus,
    X,
    Lock,
    Loader2,
    Check,
    Minus
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { InlineEditField } from "@/components/ui/InlineEditField"
import { DossierProgress } from "@/components/ui/DossierProgress"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
    updateProfileField,
    updateResearchInterests,
    updateProfilePhoto
} from "@/actions/profile"
import type { ProfileData } from "@/db/types"
import { toast } from "sonner"

interface ProfileDossierClientProps {
    data: ProfileData
    role: 'admin' | 'editor' | 'reviewer' | 'author'
    userId: string
}

const CATEGORIES = [
    "AI/ML", "VLSI", "Renewable Energy", "Biomedical Engineering",
    "Cybersecurity", "Data Science", "IoT", "Signal Processing",
    "Environmental Engineering", "Civil Infrastructure"
]

export function ProfileDossierClient({ data: initialData, role, userId }: ProfileDossierClientProps) {
    const [data, setData] = useState<ProfileData>(initialData)
    const [isEditingInterests, setIsEditingInterests] = useState(false)
    const [newInterest, setNewInterest] = useState("")
    const [tempInterests, setTempInterests] = useState<string[]>(initialData.researchInterests)
    const [isUploading, setIsUploading] = useState(false)
    const [photoToAdjust, setPhotoToAdjust] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const photoInputRef = useRef<HTMLInputElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    const nameRef = useRef<HTMLDivElement>(null)
    const designationRef = useRef<HTMLDivElement>(null)
    const instituteRef = useRef<HTMLDivElement>(null)
    const phoneRef = useRef<HTMLDivElement>(null)
    const nationalityRef = useRef<HTMLDivElement>(null)
    const bioRef = useRef<HTMLDivElement>(null)
    const orcidRef = useRef<HTMLDivElement>(null)
    const photoRef = useRef<HTMLDivElement>(null)
    const affiliationRef = useRef<HTMLDivElement>(null)
    const interestsRef = useRef<HTMLDivElement>(null)
    const historyRef = useRef<HTMLDivElement>(null)

    const sectionRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
        'name': nameRef,
        'designation': designationRef,
        'institute': instituteRef,
        'phone': phoneRef,
        'nationality': nationalityRef,
        'bio': bioRef,
        'orcidId': orcidRef,
        'orcidid': orcidRef,
        'photo': photoRef,
        'affiliation': affiliationRef,
        'interests': interestsRef,
        'history': historyRef
    }

    const scrollToSection = (field: string) => {
        const refName = field.toLowerCase().replace(/\s+/g, '_')
        const ref = (sectionRefs as Record<string, React.RefObject<HTMLDivElement | null>>)[refName]
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }

    const handleSaveField = async (field: string, value: string) => {
        try {
            const res = await updateProfileField(userId, field, value)
            if (!res.success) throw new Error(res.error || "Failed to update profile")
            setData((prev: ProfileData) => ({ ...prev, [field === 'name' ? 'name' : field]: value }))
            toast.success(`Profile updated: ${field}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile")
            throw error
        }
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            setPhotoToAdjust(event.target?.result as string)
            setZoom(1)
            setPosition({ x: 0, y: 0 })
        }
        reader.readAsDataURL(file)
    }

    const handleConfirmAdjustment = async () => {
        if (!photoToAdjust || !imageRef.current) return

        setIsUploading(true)

        try {
            // Create a canvas to crop the image
            const canvas = document.createElement('canvas')
            const size = 400 // Final output size
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const img = imageRef.current
            
            // Calculate scale between display and original
            const scaleX = img.naturalWidth / img.width
            const scaleY = img.naturalHeight / img.height

            // Calculate crop area in original image coordinates
            const centerX = img.width / 2 - (position.x / zoom)
            const centerY = img.height / 2 - (position.y / zoom)
            
            const cropWidth = img.width / zoom
            const cropHeight = img.height / zoom

            ctx.drawImage(
                img,
                (centerX - cropWidth / 2) * scaleX,
                (centerY - cropHeight / 2) * scaleY,
                cropWidth * scaleX,
                cropHeight * scaleY,
                0, 0, size, size
            )

            // Convert canvas to blob
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))
            if (!blob) throw new Error("Failed to process image")

            const formData = new FormData()
            formData.append("file", blob, "profile.jpg")

            const response = await updateProfilePhoto(userId, formData)
            if (!response.success) throw new Error(response.error);
            if (!response.data) throw new Error("Failed to update photo");

            setData((prev: ProfileData) => ({ ...prev, photoUrl: response.data || null }))
            toast.success("Profile photo adjusted & updated")
            setPhotoToAdjust(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to upload photo")
        } finally {
            setIsUploading(false)
        }
    }

    const toggleInterest = (interest: string) => {
        setTempInterests((prev: string[]) =>
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        )
    }

    const addCustomInterest = () => {
        if (newInterest.trim() && !tempInterests.includes(newInterest.trim())) {
            setTempInterests(prev => [...prev, newInterest.trim()])
            setNewInterest("")
        }
    }

    const handleSaveInterests = async () => {
        try {
            const res = await updateResearchInterests(userId, tempInterests)
            if (!res.success) throw new Error(res.error);
            if (!res.data) throw new Error("Failed to update interests");
            setData((prev: ProfileData) => ({ ...prev, researchInterests: res.data || [] }))
            setIsEditingInterests(false)
            toast.success("Interests updated")
        } catch {
            toast.error("Failed to update interests")
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <Card className="rounded-2xl border-slate-200 shadow-2xl overflow-hidden bg-white backdrop-blur-md">
                <div className="bg-slate-50/50 p-8 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group/avatar" ref={photoRef}>
                            <div className="w-40 h-40 rounded-2xl bg-slate-100 overflow-hidden relative border-4 border-white shadow-xl">
                                {data.photoUrl ? (
                                    <Image
                                        src={data.photoUrl || ""}
                                        alt={data.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-300">
                                        {data.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="text-white w-6 h-6" />
                                    <input
                                        ref={photoInputRef}
                                        title="Upload Photo"
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handlePhotoUpload}
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Photo Adjustment Modal */}
                        <AnimatePresence>
                            {photoToAdjust && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                                >
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col"
                                    >
                                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Adjust Frame</h3>
                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Scale & Position Asset</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setPhotoToAdjust(null)}
                                                className="rounded-full hover:bg-slate-100"
                                                aria-label="Close"
                                            >
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        <div className="relative h-80 bg-slate-100 overflow-hidden flex items-center justify-center">
                                            {/* Circular Frame Overlay */}
                                            <div className="absolute inset-0 z-10 pointer-events-none ring-100 ring-white/90 rounded-full scale-[2]" />
                                            <div className="absolute w-64 h-64 border-4 border-primary rounded-full z-20 pointer-events-none shadow-[0_0_0_100vw_rgba(0,0,0,0.4)]" />

                                            <motion.div
                                                drag
                                                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                                                onDragEnd={(_, info) => setPosition(prev => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }))}
                                                style={{ x: position.x, y: position.y, scale: zoom }}
                                                className="cursor-move"
                                            >
                                                <Image
                                                    ref={imageRef}
                                                    src={photoToAdjust}
                                                    alt="To Adjust"
                                                    width={400}
                                                    height={600}
                                                    unoptimized
                                                    className="max-w-none pointer-events-none select-none w-[400px] h-auto"
                                                />
                                            </motion.div>
                                        </div>

                                        <div className="p-8 space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zoom Precision</span>
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{Math.round(zoom * 100)}%</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full border border-slate-100"
                                                        onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                                                        aria-label="Zoom out"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </Button>
                                                    <input 
                                                        type="range" 
                                                        min="0.5" 
                                                        max="3" 
                                                        step="0.01" 
                                                        value={zoom} 
                                                        title="Zoom Level"
                                                        aria-label="Zoom Level"
                                                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                                                        className="flex-1 accent-primary h-1 bg-slate-100 rounded-full appearance-none cursor-pointer"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full border border-slate-100"
                                                        onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                                                        aria-label="Zoom in"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button 
                                                    variant="outline" 
                                                    className="flex-1 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] border-slate-200"
                                                    onClick={() => setPhotoToAdjust(null)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button 
                                                    className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                                                    onClick={handleConfirmAdjustment}
                                                >
                                                    <Check className="w-4 h-4 mr-2" /> Lock & Sync
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{data.name}</h1>
                                <p className="text-lg text-primary font-medium">{data.designation || 'Academic Professional'}</p>
                            </div>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <Badge variant="secondary" className="font-bold px-3 py-1 bg-primary/10 text-primary border-none uppercase tracking-widest text-[10px]">{role}</Badge>
                                {data.orcidId && (
                                    <Link
                                        href={`https://orcid.org/${data.orcidId}`}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-primary transition-colors bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        {data.orcidId}
                                    </Link>
                                )}
                            </div>

                            <div className="pt-2 max-w-sm">
                                <DossierProgress
                                    percentage={data.completeness.percentage}
                                    missing={data.completeness.missing}
                                    onChipClick={scrollToSection}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <CardContent className="p-0 divide-y divide-slate-100">
                    {/* 1. Identification & Contact */}
                    <div className="p-10 space-y-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase tracking-tighter text-[10px]">Section 01</Badge>
                                <h3 className="text-lg font-bold text-slate-800">Identification & Contact</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div ref={nameRef}>
                                    <InlineEditField
                                        label="Full Name"
                                        value={data.name}
                                        onSave={(v) => handleSaveField('name', v)}
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div ref={designationRef}>
                                    <InlineEditField
                                        label="Professional Designation"
                                        value={data.designation || ""}
                                        onSave={(v) => handleSaveField('designation', v)}
                                        placeholder="e.g. Professor"
                                    />
                                </div>
                                <div ref={instituteRef}>
                                    <InlineEditField
                                        label="Academic Institute"
                                        value={data.institute || ""}
                                        onSave={(v) => handleSaveField('institute', v)}
                                        placeholder="University of Science"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                                        <Lock className="w-3 h-3" /> Email Identity
                                    </label>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-sm font-semibold truncate text-slate-600">{data.email}</p>
                                    </div>
                                </div>
                                <div ref={phoneRef}>
                                    <InlineEditField
                                        label="Direct Contact (Phone)"
                                        value={data.phone || ""}
                                        onSave={(v) => handleSaveField('phone', v)}
                                        placeholder="+91 00000 00000"
                                    />
                                </div>
                                <div ref={nationalityRef}>
                                    <InlineEditField
                                        label="Nationality / Region"
                                        value={data.nationality || ""}
                                        onSave={(v) => handleSaveField('nationality', v)}
                                        placeholder="India"
                                    />
                                </div>
                                <div ref={orcidRef} className="md:col-span-2">
                                    <InlineEditField
                                        label="ORCID Digital Identity"
                                        value={data.orcidId || ""}
                                        onSave={(v) => handleSaveField('orcidId', v)}
                                        placeholder="0000-0000-0000-0000"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Biography */}
                        <div className="p-8 space-y-6 bg-slate-50/30" ref={bioRef}>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase tracking-tighter text-[10px]">Section 02</Badge>
                                <h3 className="text-lg font-bold text-slate-800">Researcher Biography</h3>
                            </div>
                            <InlineEditField
                                label="Brief Academic Narrative"
                                value={data.bio || ""}
                                onSave={(v) => handleSaveField('bio', v)}
                                type="textarea"
                                placeholder="Describe your academic background, research interests, and notable achievements..."
                            />
                        </div>

                        {/* 3. Expertise */}
                        {(role === 'reviewer' || role === 'editor' || role === 'author') && (
                            <div className="p-8 space-y-6" ref={interestsRef}>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase tracking-tighter text-[10px]">Section 03</Badge>
                                        <h3 className="text-lg font-bold text-slate-800">Research Expertise</h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setTempInterests([...data.researchInterests]);
                                            setIsEditingInterests(!isEditingInterests);
                                        }}
                                        className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
                                    >
                                        {isEditingInterests ? "Discard Changes" : "Modify Interests"}
                                    </Button>
                                </div>
                                
                                <AnimatePresence mode="wait">
                                    {isEditingInterests ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex flex-wrap gap-2">
                                                {CATEGORIES.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => toggleInterest(cat)}
                                                        className={cn(
                                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200",
                                                            tempInterests.includes(cat)
                                                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                                                : "bg-white  text-slate-600  border border-slate-100  hover:border-primary/50"
                                                        )}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="flex gap-2 max-w-md">
                                                <Input
                                                    placeholder="Custom field of expertise..."
                                                    value={newInterest}
                                                    onChange={(e) => setNewInterest(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addCustomInterest()}
                                                    className="h-11 bg-slate-50 border-slate-200 text-sm rounded-xl focus:ring-primary/20"
                                                />
                                                <Button onClick={addCustomInterest} className="h-11 px-5 rounded-xl">
                                                    <Plus className="w-5 h-5" />
                                                </Button>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {tempInterests.filter(i => !CATEGORIES.includes(i)).map(interest => (
                                                    <Badge key={interest} variant="secondary" className="gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border-none">
                                                        {interest}
                                                        <button type="button" aria-label={`Remove ${interest}`} className="inline-flex appearance-none border-none bg-transparent cursor-pointer p-0" onClick={() => toggleInterest(interest)}>
                                                            <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-500 transition-colors" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <Button size="lg" onClick={handleSaveInterests} className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">Commit Changes</Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-wrap gap-3">
                                            {data.researchInterests.length > 0 ? data.researchInterests.map((interest: string) => (
                                                <span key={interest} className="px-4 py-2 bg-primary/5 text-primary border border-primary/10 rounded-xl text-xs font-bold tracking-tight">
                                                    {interest}
                                                </span>
                                            )) : (
                                                <p className="text-slate-400 text-sm italic">No expertise domains identified.</p>
                                            )}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* 4. Activity History */}
                        {role !== 'admin' && role !== 'editor' && (
                            <div className="p-8 space-y-6" ref={historyRef}>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase tracking-tighter text-[10px]">Section 04</Badge>
                                        <h3 className="text-lg font-bold text-slate-800">{role === 'author' ? "Submission History" : "Peer Review Logs"}</h3>
                                    </div>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors" asChild>
                                        <Link href={role === 'author' ? "/author/submissions" : "/reviewer/reviews"}>
                                            View Complete Records
                                        </Link>
                                    </Button>
                                </div>

                                <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                                    {data.history.length > 0 ? data.history.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-white transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 group-hover:border-primary/50 transition-colors shadow-sm">
                                                    <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h5 className="text-sm font-bold line-clamp-1 text-slate-800">{item.title}</h5>
                                                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {(item.submittedAt || item.updatedAt) ? new Date((item.submittedAt || item.updatedAt)!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Archive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-bold h-6 px-3 rounded-lg uppercase tracking-wider border-none",
                                                item.status === 'accepted' || item.decision === 'accept' ? 'bg-emerald-500/10 text-emerald-600' :
                                                item.status === 'rejected' || item.decision === 'reject' ? 'bg-rose-500/10 text-rose-600' : 'bg-primary/10 text-primary'
                                            )}>
                                                {item.status || item.decision || 'Processing'}
                                            </Badge>
                                        </div>
                                    )) : (
                                        <div className="py-12 text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-inner">
                                                <Search className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400">No activity protocols detected.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
            </Card>
        </div>
    )
}
