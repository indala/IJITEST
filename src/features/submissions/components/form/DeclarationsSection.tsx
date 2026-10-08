import type { Control } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { FormValues } from "../../schemas/submission.schema";

interface DeclarationsSectionProps {
    control: Control<FormValues>;
}

const declarations = [
    {
        name: "competingInterests" as const,
        label: "Competing Interests",
        description: "Disclose any competing interests, or explicitly state that there are none.",
        placeholder: "Example: The authors declare no competing interests.",
    },
    {
        name: "fundingStatement" as const,
        label: "Funding",
        description: "Identify funding sources, or explicitly state that the research received no external funding.",
        placeholder: "Example: This research received no external funding.",
    },
    {
        name: "ethicalApproval" as const,
        label: "Ethics Approval",
        description: "Provide the approving body and reference where applicable, or explain why approval was not applicable.",
        placeholder: "Example: Ethical approval was not applicable because this study did not involve human participants or animals.",
    },
    {
        name: "dataAvailability" as const,
        label: "Data Availability",
        description: "State where supporting data can be accessed, include a persistent link/DOI when available, or explain why data are restricted or not applicable.",
        placeholder: "Example: The data supporting this study are available in [repository] at [DOI/URL].",
    },
];

export function DeclarationsSection({ control }: DeclarationsSectionProps) {
    return (
        <section className="space-y-6 pt-10 border-t border-border/50" aria-labelledby="submission-declarations-heading">
            <div>
                <h3 id="submission-declarations-heading" className="m-0">Research Declarations</h3>
                <p className="text-caption text-muted-foreground mt-1">
                    Required for the publication record. Provide accurate statements; examples are not automatically selected or submitted.
                </p>
            </div>
            {declarations.map((declaration) => (
                <FormField
                    key={declaration.name}
                    control={control}
                    name={declaration.name}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{declaration.label}</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    value={field.value ?? ""}
                                    placeholder={declaration.placeholder}
                                    className="min-h-24"
                                    maxLength={5000}
                                />
                            </FormControl>
                            <FormDescription>{declaration.description}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ))}
        </section>
    );
}
