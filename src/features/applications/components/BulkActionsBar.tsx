import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface BulkActionsBarProps {
    pendingAppsCount: number;
    selectedCount: number;
    isAllSelected: boolean;
    onSelectAll: (checked: boolean) => void;
    onBulkApprove: () => void;
    bulkRejectionMode: boolean;
    setBulkRejectionMode: (mode: boolean) => void;
    bulkRejectionReason: string;
    setBulkRejectionReason: (reason: string) => void;
    onBulkReject: (reason: string) => void;
    isPendingAction: boolean;
}

export function BulkActionsBar({
    pendingAppsCount,
    selectedCount,
    isAllSelected,
    onSelectAll,
    onBulkApprove,
    bulkRejectionMode,
    setBulkRejectionMode,
    bulkRejectionReason,
    setBulkRejectionReason,
    onBulkReject,
    isPendingAction,
}: BulkActionsBarProps) {
    if (pendingAppsCount === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 px-4 py-3 bg-muted/30 rounded-2xl border border-primary/5 w-fit">
                <div className="flex items-center gap-3">
                    <Checkbox 
                        checked={isAllSelected}
                        onCheckedChange={onSelectAll}
                        id="select-all"
                    />
                    <label htmlFor="select-all" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer">
                        {selectedCount === 0 ? "Select for batch action" : `${selectedCount} applicants selected`}
                    </label>
                </div>

                {selectedCount > 0 && (
                    <div className="flex items-center gap-2 pl-4 border-l border-primary/10">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                            onClick={onBulkApprove}
                            disabled={isPendingAction}
                        >
                            {isPendingAction ? "Processing..." : "Bulk Approve"}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest border-rose-500/20 text-rose-600 hover:bg-rose-500 hover:text-white"
                            onClick={() => setBulkRejectionMode(true)}
                        >
                            Bulk Reject
                        </Button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {bulkRejectionMode && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-6 space-y-4 overflow-hidden"
                    >
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Bulk Rejection Rationale</h4>
                            <span className={`text-[10px] font-black ${bulkRejectionReason.length < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {bulkRejectionReason.length}/20 characters
                            </span>
                        </div>
                        <textarea
                            value={bulkRejectionReason}
                            onChange={(e) => setBulkRejectionReason(e.target.value)}
                            className="w-full h-24 bg-background border-2 border-rose-500/10 rounded-2xl p-4 text-sm focus:border-rose-500 outline-none transition-all resize-none font-medium"
                            placeholder="Enter the grounds for declining these selected proposals..."
                        />
                        <div className="flex gap-3 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setBulkRejectionMode(false)} className="h-9 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest">Abort</Button>
                            <Button 
                                disabled={bulkRejectionReason.length < 20 || isPendingAction}
                                onClick={() => onBulkReject(bulkRejectionReason)}
                                className="h-9 px-6 rounded-xl bg-rose-600 text-white font-black uppercase text-[9px] tracking-widest"
                            >
                                Confirm Collective Rejection
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
