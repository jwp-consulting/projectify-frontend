<script lang="ts" context="module">
    export type ToolBarItem = {
        label: string;
        icon: any;
        onClick: (...arg0: any[]) => void;
        disabled?: boolean;
        hidden?: boolean;
        tooltip?: string;
    };
</script>

<script lang="ts">
    export let items: ToolBarItem[];
</script>

{#each items as it}
    {#if !it.hidden}
        <button
            title={it.tooltip}
            disabled={it.disabled}
            class="btn btn-ghost btn-xs flex h-10 shrink-0 items-center justify-center px-3"
            on:click|stopPropagation={it.onClick}
        >
            <svelte:component this={it.icon} />
            <span>{it.label}</span>
        </button>
    {/if}
{/each}
