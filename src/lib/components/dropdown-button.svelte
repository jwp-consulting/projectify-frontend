<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import IconChevronDown from "./icons/icon-chevron-down.svelte";

    export let label = "";
    export let open = false;
    export let icon: any | null = null;
    export let target: HTMLElement | null = null;
    export let dispatch = createEventDispatcher();
</script>

<button
    bind:this={target}
    tabindex="0"
    class="btn-filter btn btn-ghost"
    on:click={() => dispatch("click")}
>
    <svelte:component this={icon} />

    <span>{label}</span>

    <div class:rotate-180={open} class="icon-sm transition-all">
        <IconChevronDown />
    </div>
</button>
