<script lang="ts">
    import { page } from "$app/stores";
    import IllustrationErrotPage from "$lib/components/illustrations/illustration-errot-page.svelte";

    import PageLayout from "$lib/components/layouts/pageLayout.svelte";
    import { _ } from "svelte-i18n";

    type Error = {
        message: string;
        backBtnLabel: string;
        backBtnUrl: string;
    };
    const errorSomethingWrong: Error = {
        message: $_("something-went-wrong"),
        backBtnLabel: $_("go-to-homepage"),
        backBtnUrl: "/",
    };
    const errors: Map<string, Error> = new Map([
        ["something-wrong", errorSomethingWrong],
        [
            "workspace-not-found",
            {
                message: $_("workspace-not-found"),
                backBtnLabel: $_("retun-to-dashboard"),
                backBtnUrl: "/dashboard",
            },
        ],
        [
            "board-not-found",
            {
                message: $_("board-not-found"),
                backBtnLabel: $_("retun-to-dashboard"),
                backBtnUrl: "/dashboard",
            },
        ],
        [
            "task-not-found",
            {
                message: $_("task-not-found"),
                backBtnLabel: $_("retun-to-dashboard"),
                backBtnUrl: "/dashboard",
            },
        ],
        [
            "user-agent",
            {
                message: $_("this-application-is-best-used-on-a-pc"),
                backBtnLabel: $_("go-to-homepage"),
                backBtnUrl: "/",
            },
        ],
    ]);

    let code: string;
    $: code = $page.params["code"];
    let error: Error | null;
    $: {
        if (code) {
            const maybeError = errors.get(code);
            if (!maybeError) {
                throw new Error("Expected maybeError");
            }
            error = maybeError;
        } else {
            error = errorSomethingWrong;
        }
    }
</script>

{#if error}
    <PageLayout>
        <main
            class="flex grow flex-col items-center justify-center bg-base-200 p-4"
        >
            <div class="pb-2">
                <IllustrationErrotPage />
            </div>
            <div class="font-bold">{error.message}</div>
            <a
                href={error.backBtnUrl}
                class="btn-action btn btn-md m-3 rounded-full px-8"
                >{error.backBtnLabel}</a
            >
        </main>
    </PageLayout>
{/if}
