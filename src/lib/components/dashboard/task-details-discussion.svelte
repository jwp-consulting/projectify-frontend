<script lang="ts">
    import { client } from "$lib/graphql/client";
    import { Mutation_AddChatMessage } from "$lib/graphql/operations";

    import { dateStringToLocal } from "$lib/utils/date";
    import UserProfilePicture from "../userProfilePicture.svelte";
    import { afterUpdate } from "svelte";
    import type { Task } from "$lib/types";

    export let task: Task;

    let chatMessageText = "";

    async function sendChatMessage() {
        let msg = chatMessageText.trim();
        chatMessageText = "";

        if (!msg) {
            return;
        }

        try {
            await client.mutate({
                mutation: Mutation_AddChatMessage,
                variables: {
                    input: {
                        taskUuid: task.uuid,
                        text: msg,
                    },
                },
            });
        } catch (error) {
            console.error(error);
        }
    }

    let messagesView: HTMLDivElement;

    afterUpdate(() => {
        if (!task.chat_messages) {
            throw new Error("Expected task.chat_messages");
        }
        if (messagesView && task.chat_messages.length > 0) {
            messagesView.scrollTo(0, messagesView.scrollHeight);
        }
    });
</script>

<div
    class="absolute top-0 left-0 flex h-full max-h-full w-full flex-col overflow-hidden"
>
    <div
        bind:this={messagesView}
        class="flex grow flex-col divide-y divide-base-300 overflow-y-auto px-4"
    >
        {#each task?.chat_messages || [] as message}
            <div class="flex space-x-4  py-6">
                <div class="shrink-0">
                    {#if message.author}
                        <UserProfilePicture
                            pictureProps={{
                                url: message.author.user.profile_picture,
                                size: 32,
                            }}
                        />
                    {/if}
                </div>
                <div class="grow space-y-2">
                    <div class="flex items-center space-x-2 text-xs">
                        {#if message.author}
                            <div class="grow font-bold">
                                {message.author.user.full_name ||
                                    message.author.user.email}
                            </div>
                        {/if}
                        <div class="font-bold opacity-50">
                            {dateStringToLocal(message.created, true)}
                        </div>
                    </div>

                    <div>{message.text}</div>
                </div>
            </div>
        {/each}
    </div>
    <div class="space-y-2 border-t border-base-300 p-4">
        <textarea
            rows="2"
            class="textarea textarea-bordered w-full resize-none p-4 leading-normal"
            placeholder={"Please enter message"}
            bind:value={chatMessageText}
            on:keypress={(e) => {
                if (!e.shiftKey && e.key === "Enter") {
                    e.preventDefault();
                    sendChatMessage();
                }
            }}
        />
        <div class="flex items-center gap-2">
            <div class="grow" />
            <button
                class="btn btn-primary btn-md"
                disabled={chatMessageText.length === 0}
                on:click={() => sendChatMessage()}>Send</button
            >
        </div>
    </div>
</div>
