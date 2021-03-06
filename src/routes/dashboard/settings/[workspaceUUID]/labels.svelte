<script lang="ts">
    import { client } from "$lib/graphql/client";

    import {
        Mutation_AddLabelMutation,
        Mutation_DeleteLabelMutation,
        Mutation_UpdateLabelMutation,
    } from "$lib/graphql/operations";
    import { _ } from "svelte-i18n";
    import ConfirmModalContent from "$lib/components/confirmModalContent.svelte";
    import DialogModal, { getModal } from "$lib/components/dialogModal.svelte";
    import LabelPill from "$lib/components/dashboard/LabelPill.svelte";
    import type { Label } from "$lib/types";
    import { currentWorkspace, loading } from "$lib/stores/dashboard";

    let labels: Label[] = [];

    $: {
        if ($currentWorkspace && $currentWorkspace.labels) {
            labels = $currentWorkspace.labels;
            $loading = false;
        } else {
            $loading = true;
        }
    }

    async function onDeleteLabel(label: Label) {
        let modalRes = await getModal("deleteLabel").open();

        if (!modalRes) {
            return;
        }

        try {
            await client.mutate({
                mutation: Mutation_DeleteLabelMutation,
                variables: {
                    input: {
                        uuid: label.uuid,
                    },
                },
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function onEditLabel(label: Label) {
        let modalRes = await getModal("editLabel").open({ ...label });

        if (!modalRes) {
            return;
        }

        try {
            await client.mutate({
                mutation: Mutation_UpdateLabelMutation,
                variables: {
                    input: {
                        uuid: label.uuid,
                        name: modalRes.outputs.name,
                        color: modalRes.outputs.color,
                    },
                },
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function onNewLabel() {
        let modalRes = await getModal("newLabel").open();

        if (!modalRes) {
            return;
        }

        if (!$currentWorkspace) {
            return;
        }

        try {
            await client.mutate({
                mutation: Mutation_AddLabelMutation,
                variables: {
                    input: {
                        workspaceUuid: $currentWorkspace.uuid,
                        name: modalRes.outputs.name,
                        color: modalRes.outputs.color,
                    },
                },
            });
        } catch (error) {
            console.error(error);
        }
    }
</script>

<div class=" divide-y divide-base-300">
    {#each labels as label}
        <div class="flex space-x-4 py-4">
            <div class="flex grow">
                <LabelPill {label} />
            </div>
            <div class="flex items-center space-x-2">
                <button
                    on:click={() => onEditLabel(label)}
                    class="btn btn-primary btn-ghost btn-sm btn-sm rounded-full text-primary"
                >
                    {$_("Edit")}
                </button>
                <button
                    on:click={() => onDeleteLabel(label)}
                    class="btn btn-outline btn-accent btn-sm rounded-full"
                >
                    {$_("Delete")}
                </button>
            </div>
        </div>
    {/each}
    <div class="py-2">
        <a
            href="/"
            on:click|preventDefault={onNewLabel}
            class="ch flex space-x-4 p-2"
        >
            <div
                class="flex grow flex-col justify-center font-bold text-primary"
            >
                + {$_("new-label")}
            </div>
        </a>
    </div>
</div>

<DialogModal id="newLabel">
    <ConfirmModalContent
        title={$_("create-new-label")}
        confirmLabel={$_("Save")}
        inputs={[
            {
                name: "name",
                label: $_("name"),
                placeholder: $_("please-enter-a-label-name"),
                validation: {
                    required: true,
                },
            },
            {
                type: "colorPicker",
                name: "color",
                label: $_("color"),
                placeholder: $_("please-enter-a-label-color"),
                value: 0,
            },
        ]}
    />
</DialogModal>

<DialogModal id="editLabel">
    <ConfirmModalContent
        title={$_("edit-label")}
        confirmLabel={$_("Save")}
        inputs={[
            {
                name: "name",
                label: $_("name"),
                placeholder: $_("please-enter-a-label-name"),
                validation: {
                    required: true,
                },
            },
            {
                type: "colorPicker",
                name: "color",
                label: $_("color"),
                placeholder: $_("please-enter-a-label-color"),
                value: 0,
            },
        ]}
    />
</DialogModal>

<DialogModal id="deleteLabel">
    <ConfirmModalContent
        title={$_("delete-label")}
        confirmLabel={$_("Delete")}
        confirmColor="accent"
    >
        {$_("are-you-sure-you-want-to-delete-this-label")}
    </ConfirmModalContent>
</DialogModal>
