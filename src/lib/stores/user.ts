import { writable } from "svelte/store";
import { client } from "$lib/graphql/client";

import {
    Mutation_Singup,
    Mutation_EmailConfirmation,
    Mutation_Login,
    Mutation_Logout,
    Mutation_RequesetPasswordReset,
    Mutation_ConfirmPasswordReset,
} from "$lib/graphql/operations";
import { getUser } from "$lib/repository";
import { goto } from "$app/navigation";
import type { User } from "$lib/types";

export const user = writable<User>(null);
export const userIsLoading = writable(true);
export const singinRedirect = { to: null };

export const singUp = async (email: string, password: string) => {
    try {
        const res = await client.mutate({
            mutation: Mutation_Singup,
            variables: { input: { email, password } },
        });

        if (res.data.signup !== null) {
            const userData = res.data.signup;
            return userData;
        }
    } catch (error) {
        console.error(error);
    }
    return null;
};

export const emailConfirmation = async (email: string, token: string) => {
    try {
        const res = await client.mutate({
            mutation: Mutation_EmailConfirmation,
            variables: { input: { email, token } },
        });
        if (res.data.emailConfirmation !== null) {
            const userData = res.data.emailConfirmation;
            return userData;
        }
    } catch (error) {
        console.error(error);
    }
    return null;
};

export const login = async (email: string, password: string) => {
    try {
        const res = await client.mutate({
            mutation: Mutation_Login,
            variables: { input: { email, password } },
        });

        console.log(res);
        if (res.data.login !== null) {
            const userData = res.data.login;
            user.set(userData);

            if (singinRedirect.to) {
                if (singinRedirect.to) {
                    goto(singinRedirect.to);
                }

                singinRedirect.to = null;
            }

            return userData;
        }
    } catch (error) {
        console.error(error);
    }
    return null;
};

export const logout = async () => {
    try {
        await client.mutate({
            mutation: Mutation_Logout,
        });
        client.resetStore();
    } catch (error) {
        console.error(error);
    }
    user.set(null);
    userIsLoading.set(false);
};

export const fetchUser = async () => {
    userIsLoading.set(true);
    try {
        const res = await getUser();

        const userData = res;
        user.set(userData);
        return userData;
    } catch (error) {
        console.log(error);
    }
    userIsLoading.set(false);
    return null;
};

export const requestPasswordReset = async (email: string) => {
    try {
        const res = await client.mutate({
            mutation: Mutation_RequesetPasswordReset,
            variables: { input: { email } },
        });

        if (res.data.requestPasswordReset !== null) {
            return res.data.requestPasswordReset.email;
        }
    } catch (error) {
        return { error };
    }
};

export const confirmPasswordReset = async (
    email: string,
    token: string,
    newPassword: string
) => {
    try {
        const res = await client.mutate({
            mutation: Mutation_ConfirmPasswordReset,
            variables: { input: { email, token, newPassword } },
        });
        if (res.data.confirmPasswordReset !== null) {
            return res.data.confirmPasswordReset.user;
        }
    } catch (error) {
        return { error };
    }
};
