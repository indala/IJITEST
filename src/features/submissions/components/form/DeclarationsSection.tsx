import type { Control, UseFormSetValue } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, ShieldCheck, Edit3 } from "lucide-react";
import type { FormValues } from "../../schemas/submission.schema";

interface DeclarationsSectionProps {
    control: Control<FormValues>;
    setValue?: UseFormSetValue<FormValues>;
}

export const STANDARD_DECLARATIONS = {
    competingInterests: "The authors declare that there are no competing financial or personal interests related to this work.",
    fundingStatement: "This research received no external funding or commercial grants.",
    ethicalApproval: "Not applicable. This study did not involve human participants, animal subjects, or sensitive clinical data.",
    dataAvailability: "All data supporting the findings of this study are included within the article and its supplementary materials.",
};

interface DeclarationConfig {
    name: "competingInterests" | "fundingStatement" | "ethicalApproval" | "dataAvailability";
    label: string;
    description: string;
    presets: Array<{
        title: string;
        text: string;
        isCustom?: boolean;
    }>;
}

const declarationsConfig: DeclarationConfig[] = [
    {
        name: "competingInterests",
        label: "1. Competing Interests",
        description: "Disclose any potential conflicts of interest, or use the standard declaration if none exist.",
        presets: [
            {
                title: "No Competing Interests",
                text: "The authors declare that there are no competing financial or personal interests related to this work.",
            },
            {
                title: "Declare Specific Conflict...",
                text: "The authors disclose the following competing interest: ",
                isCustom: true,
            },
        ],
    },
    {
        name: "fundingStatement",
        label: "2. Funding Statement",
        description: "Identify research funding sources, or confirm that no external funding was received.",
        presets: [
            {
                title: "No External Funding",
                text: "This research received no external funding or commercial grants.",
            },
            {
                title: "Institutional / Departmental",
                text: "This research was supported by internal institutional resources with no external grant funding.",
            },
            {
                title: "Grant / Sponsor Details...",
                text: "This study was supported by [Grant Name/Agency] under Grant No. [Insert Number].",
                isCustom: true,
            },
        ],
    },
    {
        name: "ethicalApproval",
        label: "3. Ethics Approval",
        description: "Specify ethics oversight details, or confirm if not applicable (e.g. computer science, computational studies).",
        presets: [
            {
                title: "Not Applicable (No human/animal subjects)",
                text: "Not applicable. This study did not involve human participants, animal subjects, or sensitive clinical data.",
            },
            {
                title: "Ethics Committee Approved...",
                text: "Ethical approval was granted by the Institutional Review Board / Ethics Committee (Protocol/Ref: [Insert No.]).",
                isCustom: true,
            },
        ],
    },
    {
        name: "dataAvailability",
        label: "4. Data Availability Statement",
        description: "State where research datasets, code, or materials can be accessed by readers.",
        presets: [
            {
                title: "Included in Article",
                text: "All data supporting the findings of this study are included within the article and its supplementary materials.",
            },
            {
                title: "Available Upon Reasonable Request",
                text: "The datasets generated during the current study are available from the corresponding author upon reasonable request.",
            },
            {
                title: "Public Repository / DOI...",
                text: "The datasets generated and analyzed during the current study are available in the [Repository Name] repository, [Link/DOI].",
                isCustom: true,
            },
        ],
    },
];

export function DeclarationsSection({ control, setValue }: DeclarationsSectionProps) {
    const handleApplyAllStandard = () => {
        if (!setValue) return;
        setValue("competingInterests", STANDARD_DECLARATIONS.competingInterests, { shouldValidate: true, shouldDirty: true });
        setValue("fundingStatement", STANDARD_DECLARATIONS.fundingStatement, { shouldValidate: true, shouldDirty: true });
        setValue("ethicalApproval", STANDARD_DECLARATIONS.ethicalApproval, { shouldValidate: true, shouldDirty: true });
        setValue("dataAvailability", STANDARD_DECLARATIONS.dataAvailability, { shouldValidate: true, shouldDirty: true });
    };

    const handleSelectPreset = (name: keyof typeof STANDARD_DECLARATIONS, text: string) => {
        if (setValue) {
            setValue(name, text, { shouldValidate: true, shouldDirty: true });
        }
    };

    return (
        <section className="space-y-6 pt-10 border-t border-border/50" aria-labelledby="submission-declarations-heading">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                        <h3 id="submission-declarations-heading" className="m-0 text-lg font-bold text-foreground">
                            Research Declarations
                        </h3>
                    </div>
                    <p className="text-caption text-muted-foreground m-0">
                        Required by editorial policy (COPE & ICMJE guidelines). Select standard presets or customize disclosures.
                    </p>
                </div>
                {setValue && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleApplyAllStandard}
                        className="bg-card hover:bg-primary/10 border-primary/20 text-primary font-bold text-xs shrink-0 cursor-pointer shadow-2xs gap-1.5"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Apply All Standard Defaults</span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {declarationsConfig.map((item) => (
                    <FormField
                        key={item.name}
                        control={control}
                        name={item.name}
                        render={({ field }) => {
                            const currentValue = field.value || "";

                            return (
                                <FormItem className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card/60 shadow-2xs space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <FormLabel className="text-sm font-bold text-foreground">
                                            {item.label}
                                        </FormLabel>
                                        <FormDescription className="text-xs text-muted-foreground m-0">
                                            {item.description}
                                        </FormDescription>
                                    </div>

                                    {/* Preset Quick Chips */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        {item.presets.map((preset, pIdx) => {
                                            const isSelected = currentValue === preset.text || (!preset.isCustom && currentValue.startsWith(preset.text.slice(0, 30)));
                                            return (
                                                <button
                                                    key={pIdx}
                                                    type="button"
                                                    onClick={() => handleSelectPreset(item.name, preset.text)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                                                        isSelected
                                                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                                                    }`}
                                                >
                                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                                                    {preset.isCustom && <Edit3 className="w-3 h-3 shrink-0" />}
                                                    <span>{preset.title}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Editable Text Field */}
                                    <FormControl>
                                        <div className="relative">
                                            <Textarea
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder={item.presets[0]?.text}
                                                className="min-h-20 text-xs sm:text-sm bg-background border-border/80 focus:border-primary transition-colors"
                                                maxLength={5000}
                                            />
                                        </div>
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
