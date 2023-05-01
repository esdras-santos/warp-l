// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export default function assert(condition: boolean, message?: string) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}