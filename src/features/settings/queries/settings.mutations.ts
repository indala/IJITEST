import { mutationOptions, type QueryClient } from "@tanstack/react-query";
import { updateSettings } from "@/actions/settings";
import type { ActionResponse } from "@/db/contracts";
import { settingsKeys } from "./settings.keys";

function invalidateSettings(queryClient: QueryClient) {
    void queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    void queryClient.invalidateQueries({ queryKey: settingsKeys.public() });
    void queryClient.invalidateQueries({ queryKey: settingsKeys.publications() });
}

export const settingsMutationOptions = {
    update: (queryClient: QueryClient) => mutationOptions({
        mutationFn: (formData: FormData) => updateSettings(formData),
        onSuccess: (result: ActionResponse) => {
            if (result.success) invalidateSettings(queryClient);
        },
    }),
};
