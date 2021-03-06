import type { ThemeColors } from "$lib/types";

import {
    getStyleFor,
    themeToArray,
} from "./../components/theme-builder/theme-utils";

import { browser } from "$app/env";
import { get, writable } from "svelte/store";

export const isDarkMode = writable<boolean | null>(null);

function setThemeToNode(node: HTMLElement, dark: boolean): void {
    node.setAttribute("data-theme", dark ? "app-dark" : "app-light");
    if (dark) {
        node.classList.add("dark");
    } else {
        node.classList.remove("dark");
    }
}

const localsThemeKey = "theme";

function systemPreferenceIsDarkMode(): boolean {
    const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
    return matchMedia.matches;
}

if (browser) {
    if (window.matchMedia) {
        const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

        const localTheme = localStorage.getItem(localsThemeKey);

        if (localTheme === null) {
            isDarkMode.set(matchMedia.matches);
        } else {
            isDarkMode.set(localTheme == "dark");
        }

        matchMedia.addEventListener("change", (e) => {
            const dark = get(isDarkMode);
            if (dark == null) {
                setThemeToNode(document.body, e.matches);
            }
        });
    }

    window.addEventListener("storage", (event) => {
        if (event.key === localsThemeKey) {
            const localTheme = event.newValue;
            isDarkMode.set(localTheme == "dark");
        }
    });

    isDarkMode.subscribe((value) => {
        console.log("isDarkMode", value);

        if (value == null) {
            value = systemPreferenceIsDarkMode();
        }

        setThemeToNode(document.body, value);
    });
}

export function saveDarkMode(value: boolean | null): void {
    if (value === null) {
        localStorage.removeItem(localsThemeKey);
    } else {
        localStorage.setItem(localsThemeKey, value ? "dark" : "light");
    }
    isDarkMode.set(value);
}

export type UserTheme = {
    light?: ThemeColors;
    dark?: ThemeColors;
};

export const userTheme = writable<UserTheme | null>(null);

export function setUserThemeFor(
    theme: ThemeColors | null,
    isDarkMode: boolean
): void {
    // XXX
    if (!theme) {
        throw new Error("Expected theme");
    }
    let ut = get(userTheme);

    if (!ut) {
        ut = {};
    }

    if (isDarkMode) {
        ut.dark = theme;
    } else {
        ut.light = theme;
    }

    userTheme.set(ut);
}

export function getUserThemeFor(isDarkMode: boolean): ThemeColors {
    const themes = get(userTheme);
    const theme = themes && themes[isDarkMode ? "dark" : "light"];
    if (!theme) {
        throw new Error("Expected theme");
    }
    return theme;
}

export function applyStyleToBody(themes: UserTheme): void {
    if (!browser) {
        return;
    }
    const dm = get(isDarkMode);
    if (!dm) {
        return;
    }
    if (!themes) {
        return;
    }
    const curTheme = themes[dm ? "dark" : "light"];
    if (!curTheme) {
        throw new Error("Expected curTheme");
    }
    const themeArray = themeToArray(curTheme);
    if (!themeArray) {
        return;
    }
    const styles = getStyleFor(themeArray);
    document.body.setAttribute("style", styles);
}

if (browser) {
    const userThemeKey = "userTheme";

    const themeStr = localStorage.getItem(userThemeKey);
    if (themeStr) {
        const theme = JSON.parse(themeStr) as UserTheme;
        userTheme.set(theme);
    }

    window.addEventListener("storage", (event) => {
        if (event.key === userThemeKey) {
            const themes = JSON.parse(event.newValue as string) as UserTheme;
            userTheme.set(themes);
            applyStyleToBody(themes);
        }
    });

    userTheme.subscribe((themes: UserTheme | null) => {
        if (!themes) {
            return;
        }
        const themeStr = JSON.stringify(themes);
        localStorage.setItem(userThemeKey, themeStr);
        applyStyleToBody(themes);
    });
}
