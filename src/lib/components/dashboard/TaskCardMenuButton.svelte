<script lang="ts">
    import {
        copyDashboardURL,
        currentWorkspaceBoardSections,
        currentWorkspaceBoardUuid,
        deleteTask,
        openTaskDetails,
    } from "$lib/stores/dashboard";
    import { _ } from "svelte-i18n";
    import IconTrash from "../icons/icon-trash.svelte";
    import IconArrowSRight from "../icons/icon-arrow-s-right.svelte";
    import IconCopyLink from "../icons/icon-copy-link.svelte";
    import IconChatAlt from "../icons/icon-chat-alt.svelte";
    import IconArrowSUp from "../icons/icon-arrow-s-up.svelte";
    import IconArrowSDown from "../icons/icon-arrow-s-down.svelte";
    import IconSortAscending from "../icons/icon-sort-ascending.svelte";
    import IconSortDescending from "../icons/icon-sort-descending.svelte";
    import IconArrowExpand from "../icons/icon-arrow-expand.svelte";
    import IconSwitchVertical from "../icons/icon-switch-vertical.svelte";
    import type { DropDownMenuItem } from "../globalDropDown.svelte";
    import { Icon } from "@steeze-ui/svelte-icon";
    import { DotsHorizontal } from "@steeze-ui/heroicons";
    import { getDropDown } from "../globalDropDown.svelte";
    import { moveTaskAfter } from "$lib/stores/dashboard";
    import type { Task, WorkspaceBoardSection } from "$lib/types";

    export let task: Task;
    export let workspaceBoardSection: WorkspaceBoardSection | null;
    let dropDownMenuBtnRef: HTMLElement;

    function openDropDownMenu() {
        if (!workspaceBoardSection) {
            throw new Error("Expected workspaceBoardSection");
        }
        const uuid = workspaceBoardSection.uuid;
        if (!workspaceBoardSection.tasks) {
            throw new Error("Expected workspaceBoardSection.tasks");
        }
        const tasks = workspaceBoardSection.tasks;
        let lastTask = tasks[tasks.length - 1];
        let prevTask = tasks[tasks.indexOf(task) - 1];
        let nextTask = tasks[tasks.indexOf(task) + 1];
        let isFirst = task.uuid == tasks[0].uuid;
        let isLast = task.uuid == lastTask.uuid;

        let menuSectionsItems = $currentWorkspaceBoardSections
            .filter((itSec: WorkspaceBoardSection) => itSec.uuid != uuid)
            .map((it: WorkspaceBoardSection) => {
                return {
                    label: it.title,
                    icon: IconArrowSRight,
                    onClick: () => {
                        moveTaskAfter(task.uuid, it.uuid);
                    },
                };
            });

        let dropDownItems: DropDownMenuItem[] = [
            {
                label: $_("open-task"),
                icon: IconArrowExpand,

                onClick: () => {
                    if (!$currentWorkspaceBoardUuid) {
                        throw new Error("Expected $currentWorkspaceBoardUuid");
                    }
                    openTaskDetails($currentWorkspaceBoardUuid, task.uuid);
                },
            },
            {
                label: $_("move-to-section"),
                icon: IconSwitchVertical,
                items: menuSectionsItems,
            },
            {
                label: $_("move-to-top"),
                icon: IconSortAscending,
                hidden: isFirst === true,
                onClick: () => {
                    moveTaskAfter(task.uuid, uuid, null);
                },
            },
            {
                label: $_("move-to-bottom"),
                icon: IconSortDescending,
                hidden: isLast === true,
                onClick: () => {
                    moveTaskAfter(task.uuid, uuid, lastTask.uuid);
                },
            },
            {
                label: $_("move-to-previous-position"),
                icon: IconArrowSUp,
                hidden: isFirst === true,
                onClick: () => {
                    moveTaskAfter(task.uuid, uuid, prevTask?.uuid);
                },
            },
            {
                label: $_("move-to-next-position"),
                icon: IconArrowSDown,
                hidden: isLast === true,
                onClick: () => {
                    moveTaskAfter(task.uuid, uuid, nextTask?.uuid);
                },
            },
            {
                label: $_("copy-link"),
                icon: IconCopyLink,
                onClick: () => {
                    if (!$currentWorkspaceBoardUuid) {
                        throw new Error("Expected $currentWorkspaceBoardUuid");
                    }
                    copyDashboardURL($currentWorkspaceBoardUuid, task.uuid);
                },
            },
            {
                label: $_("goto-to-updates"),
                icon: IconChatAlt,
                onClick: () => {
                    openTaskDetails(task.uuid, "updates");
                },
            },
            {
                label: $_("delete-task"),
                icon: IconTrash,
                onClick: () => {
                    deleteTask(task);
                },
            },
        ];
        const dropDown = getDropDown();
        if (!dropDown) {
            throw new Error("Expected dropDown");
        }
        dropDown.open(dropDownItems, dropDownMenuBtnRef);
    }
</script>

<button
    class="flex h-5 w-5 flex-row items-center"
    bind:this={dropDownMenuBtnRef}
    on:click|stopPropagation={openDropDownMenu}
    ><Icon
        src={DotsHorizontal}
        theme="outline"
        class="h-5 w-5 text-base-content"
    /></button
>
