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
            className={`relative overflow-hidden border-primary/5 bg-card/50 transition-all hover:bg-card hover:border-primary/20 cursor-pointer group ${isSelected ? 'ring-2 ring-primary/50' : ''}`}
            onClick={() => onInspect(app)}
        >
            <CardContent className="p-0 flex flex-col lg:flex-row items-stretch lg:items-center">
                <div 
                    className={`px-6 py-4 lg:py-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-primary/5 bg-muted/5 lg:bg-transparent ${app.status !== 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => { 
                        if (app.status !== 'pending') return;
                        e.stopPropagation(); 
                        onToggle(app.id); 
                    }}
                >
                    <Checkbox checked={isSelected} disabled={app.status !== 'pending'} />
                </div>

                <div className="p-4 flex justify-center shrink-0 lg:border-r border-primary/5">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-muted rounded-xl border border-primary/5 overflow-hidden shadow-inner relative">
                        {app.photoUrl ? (
                            <NextImage 
                                src={app.photoUrl} 
                                alt="" 
                                width={80} 
                                height={80} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20"><User /></div>
                        )}
                    </div>
                </div>

                <div className="p-6 flex-1 space-y-2 lg:border-r border-primary/5 min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-sm lg:text-lg text-foreground truncate uppercase tracking-tight">{app.fullName}</h3>
                        <Badge className={`rounded-lg h-5 px-2.5 border-none text-[7px] lg:text-[8px] font-black uppercase tracking-widest ${
                            app.type === 'editor' ? 'bg-purple-500/10 text-purple-600 ' : 'bg-blue-500/10 text-blue-600 '
                        }`}>
                            {app.type}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 lg:gap-x-6 gap-y-1 text-muted-foreground text-[8px] lg:text-[10px] font-bold uppercase tracking-widest opacity-60">
                        <span className="flex items-center gap-2"><Building2 className="w-3 lg:w-3.5 h-3 lg:h-3.5" /> {app.institute}</span>
                        <span className="flex items-center gap-2"><Briefcase className="w-3 lg:w-3.5 h-3 lg:h-3.5" /> {app.designation}</span>
                    </div>
                </div>

                <div className="p-4 lg:p-8 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 bg-muted/5 h-full min-w-0 lg:min-w-[200px] border-t lg:border-t-0 border-primary/5">
                    <Badge className={`h-7 lg:h-8 px-4 lg:px-5 text-[8px] lg:text-[10px] font-black tracking-widest uppercase border-none rounded-xl ${
                        app.status === 'approved' ? 'bg-emerald-500 text-white' :
                        app.status === 'rejected' ? 'bg-rose-500 text-white' :
                        'bg-amber-500 text-black'
                    }`}>
                        {app.status}
                    </Badge>
                    <p className="text-[8px] lg:text-[9px] font-bold text-muted-foreground uppercase opacity-40">
                        {dayjs(app.createdAt).format('DD MMM YYYY')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
});

ApplicationItemCard.displayName = 'ApplicationItemCard';
