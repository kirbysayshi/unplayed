import { customAlphabet } from "./vendor/nanoid/index.browser.js";

// Just skip "-" & "_" because they look gross haha
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const nanoid = customAlphabet(alphabet, 21);