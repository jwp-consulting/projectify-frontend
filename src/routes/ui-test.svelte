<script lang="ts">
    export const prerender = false;
    import DatePicker from "$lib/components/datePicker.svelte";
    import InputDatePicker from "$lib/components/inputDatePicker.svelte";

    const monthDates = new Array(32).fill({}).map((_, inx) => {
        const date = new Date(1);
        date.setFullYear(2022);
        date.setMonth(inx);
        date.setDate(1);
        return date;
    });

    let date = new Date();
</script>

<div class="flex flex-wrap items-center justify-center bg-secondary p-8">
    <InputDatePicker input={{ value: date }} />
</div>
<div class="flex flex-wrap items-center justify-center bg-secondary p-8">
    <div class="m-2">
        <DatePicker bind:date />
    </div>
    <div class="m-2">
        <DatePicker bind:date />
    </div>
</div>
<div
    class="flex min-h-full flex-wrap items-center justify-center bg-secondary p-8"
>
    {#each monthDates as date}
        <div class="m-1">
            <DatePicker {date} />
        </div>
    {/each}
</div>
