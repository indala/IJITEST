import React from 'react';
import NextImage from 'next/image';
import { User, Building2, Briefcase } from "lucide-react";
import dayjs from 'dayjs';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Application } from "@/db/types";

interface ApplicationItemCardProps {
    app: Application;
    isSelected: boolean;
    onToggle: (id: number) => void;
    onInspect: (app: Application) => void;
}

export const ApplicationItemCard = React.memo(({ 
    app, 
    isSelected, 
    onToggle, 
    onInspect 
}: ApplicationItemCardProps) => {
    return (
        <Card 
            className={`relative overflow-hidden border-border/70 bg-card transition-all hover:border-primary/30 cursor-pointer group rounded-xl shadow-2xs ${isSelected ? 'ring-2 ring-primary/50' : ''}`}
            onClick={() => onInspect(app)}
        >
            <CardContent className="p-0 flex flex-col lg:flex-row items-stretch lg:items-center">
                <div 
                    className={`px-4 py-3 lg:py-4 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border/70 bg-muted/10 lg:bg-transparent ${app.status !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => { 
                        if (app.status !== 'pending') return;
                        e.stopPropagation(); 
                        onToggle(app.id); 
                    }}
                >
                    <Checkbox checked={isSelected} disabled={app.status !== 'pending'} />
                </div>

                <div className="p-3.5 flex justify-center shrink-0 lg:border-r border-border/70">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-muted rounded-xl border border-border/70 overflow-hidden shadow-inner relative">
                        {app.photoUrl ? (
                            <NextImage 
                                src={app.photoUrl} 
                                alt="" 
                                width={56} 
                                height={56} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20"><User className="w-5 h-5" /></div>
                        )}
                    </div>
                </div>

                <div className="p-3.5 sm:p-4 flex-1 space-y-1.5 lg:border-r border-border/70 min-w-0">
                    <div className="flex items-center gap-2.5">
                        <h3 className="font-semibold text-sm text-foreground truncate">{app.fullName}</h3>
                        <Badge className={`rounded-md h-5 px-2 border-none text-[8px] font-semibold uppercase ${
                            app.type === 'editor' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'
                        }`}>
                            {app.type}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-[10px] font-medium">
                        <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3 text-primary" /> {app.institute}</span>
                        <span className="flex items-center gap-1.5"><Briefcase className="w-3 h-3 text-primary" /> {app.designation}</span>
                    </div>
                </div>

                <div className="p-3.5 sm:p-4 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 bg-muted/5 h-full min-w-0 lg:min-w-[170px] border-t lg:border-t-0 border-border/70">
                    <Badge className={`h-6 px-3 text-[10px] font-semibold border-none rounded-md ${
                        app.status === 'approved' ? 'bg-emerald-500 text-white' :
                        app.status === 'rejected' ? 'bg-rose-500 text-white' :
                        'bg-amber-500 text-black'
                    }`}>
                        {app.status}
                    </Badge>
                    <p className="text-meta">
                        {dayjs(app.createdAt).format('DD MMM YYYY')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
});

ApplicationItemCard.displayName = 'ApplicationItemCard';
