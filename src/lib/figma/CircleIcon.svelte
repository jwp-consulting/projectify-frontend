<script lang="ts">
    import { Icon } from "@steeze-ui/svelte-icon";
    import type { CircleIconSize, CircleIconIcon } from "$lib/figma/types";
    import {
        DotsHorizontal,
        Pencil,
        Trash,
        ChevronUp,
        ChevronDown,
        X,
    } from "@steeze-ui/heroicons";

    export let size: CircleIconSize;
    export let icon: CircleIconIcon;
    export let disabled: boolean;

    const iconMapped = {
        ellipsis: DotsHorizontal,
        edit: Pencil,
        delete: Trash,
        up: ChevronUp,
        down: ChevronDown,
        close: X,
    }[icon];
    const sizeMapped = {
        small: "w-6 h-6 p-1",
        medium: "w-8 h-8 p-1.5",
    }[size];
</script>

<button
    class={`${sizeMapped} rounded-full border border-transparent text-base-content hover:bg-secondary focus:border-base-content focus:bg-base-100 focus:outline-none active:bg-disabled-background disabled:bg-transparent disabled:text-transparent`}
    {disabled}
>
    <Icon src={iconMapped} style="outline" />
</button>
