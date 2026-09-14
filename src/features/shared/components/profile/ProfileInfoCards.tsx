import React from 'react';
import Image from 'next/image';
import { Shield, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { countries, getFlagUrl } from '@/lib/countries';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface InfoCardProps {
    fullName: string;
    designation?: string;
    institute?: string;
    phone?: string;
    nationality?: string;
}

export const ProfileInfoCards = React.memo(({
    fullName,
    designation,
    institute,
    phone,
    nationality
}: InfoCardProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="font-semibold flex items-center gap-2 text-gray-900">
                            <Shield className="w-5 h-5 text-primary" /> Basic Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="form-label-brand font-bold uppercase tracking-wider text-primary ml-1">Full Name</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                defaultValue={fullName}
                                required
                                className="bg-muted/20 border-border/50 h-11 rounded-lg text-body-sm px-4"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="designation" className="form-label-brand font-bold uppercase tracking-wider text-primary ml-1">Designation</Label>
                            <Input
                                id="designation"
                                name="designation"
                                defaultValue={designation}
                                placeholder="e.g. Professor"
                                className="bg-muted/20 border-border/50 h-11 rounded-lg text-body-sm px-4"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nationality" className="form-label-brand font-bold uppercase tracking-wider text-primary ml-1">Nationality</Label>
                            <Select name="nationality" defaultValue={nationality || "India"}>
                                <SelectTrigger id="nationality" className="bg-muted/20 border-border/50 h-11 rounded-lg px-4">
                                    <SelectValue placeholder="Select Origin..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-80 rounded-xl border-border/50 shadow-sm">
                                    {countries.map(c => (
                                        <SelectItem key={c.code} value={c.name} className="py-2.5 focus:bg-primary/5 rounded-lg cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <Image
                                                    src={getFlagUrl(c.name)}
                                                    alt={`${c.name} flag`}
                                                    width={18}
                                                    height={12}
                                                    className="w-4.5 h-3 object-cover rounded-sm shadow-sm border border-black/5"
                                                />
                                                <span className="font-semibold text-foreground/80">{c.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
                <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="font-semibold flex items-center gap-2 text-gray-900 m-0">
                            <Building2 className="w-5 h-5 text-primary" /> Affiliation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="institute" className="form-label-brand font-bold uppercase tracking-wider text-primary ml-1">Institution</Label>
                            <Input
                                id="institute"
                                name="institute"
                                defaultValue={institute}
                                placeholder="e.g. ABC University"
                                className="bg-muted/20 border-border/50 h-11 rounded-lg text-body-sm px-4"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="form-label-brand font-bold uppercase tracking-wider text-primary ml-1">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={phone}
                                placeholder="+1 (555) 000-0000"
                                className="bg-muted/20 border-border/50 h-11 rounded-lg text-body-sm px-4"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
});

ProfileInfoCards.displayName = 'ProfileInfoCards';
