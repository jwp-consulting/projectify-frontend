<script lang="ts">
    import { User } from "@steeze-ui/heroicons";
    import { _ } from "svelte-i18n";
    import SideNavMenuCategory from "./SideNavMenuCategory.svelte";
    import { currentWorkspace } from "$lib/stores/dashboard";
    import SearchField from "$lib/components/SearchField.svelte";
    import type { WorkspaceUser } from "$lib/types";
    import Fuse from "fuse.js";
    import { fuseSearchThreshold } from "$lib/stores/dashboard";
    import FilterWorkspaceUser from "$lib/components/FilterWorkspaceUser.svelte";

    let open = true;
    let searchInput = "";

    let workspaceUsers: WorkspaceUser[] = [];
    $: {
        const defaultWorkspaceUsers = $currentWorkspace
            ? $currentWorkspace.workspace_users || []
            : [];
        workspaceUsers =
            searchInput === ""
                ? defaultWorkspaceUsers
                : search(defaultWorkspaceUsers, searchInput);
    }

    function search(workspaceUsers: WorkspaceUser[], searchInput: string) {
        const searchEngine = new Fuse(workspaceUsers, {
            keys: ["user.email", "user.full_name"],
            threshold: fuseSearchThreshold,
            shouldSort: false,
        });
        const result = searchEngine.search(searchInput);
        return result.map((res: Fuse.FuseResult<WorkspaceUser>) => res.item);
    }
</script>

<SideNavMenuCategory label={$_("dashboard.members")} icon={User} bind:open />
{#if open}
    <div class="flex flex-col px-4 pt-2 pb-4">
        <div class="color-base-content p-2 text-xs font-bold capitalize">
            {$_("dashboard.filter-members")}
        </div>
        <SearchField
            bind:searchInput
            placeholder={$_("dashboard.member-name")}
        />
    </div>
    <div class="flex flex-col">
        <FilterWorkspaceUser workspaceUser={"unassigned"} />
        {#each workspaceUsers as workspaceUser (workspaceUser.uuid)}
            <FilterWorkspaceUser {workspaceUser} />
        {/each}
    </div>
{/if}
