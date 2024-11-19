// Function to compare two arrays for equality
function arraysEqual(a, b) {
    if (a === b) return true; // Same reference
    if (a == null || b == null) return false; // Null checks
    if (a.length !== b.length) return false; // Length mismatch
    
    // Compare each element
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true; // Arrays are equal
}
// Function to create a deep copy of an array
function copyArray(array) {
    return JSON.parse(JSON.stringify(array));// Serialize and deserialize for deep cloning
}
