// Function to compare two arrays for equality
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}
// Function to create a deep copy of an array
function copyArray(array) {
    return JSON.parse(JSON.stringify(array));// Serialize and deserialize for deep cloning
}
