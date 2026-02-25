// A simple utility to set CSS variables programmatically if needed
export function loadBrandColor() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

    // Set the primary brand flavor via CSS variable manually here if needed.
    // We can let CSS handle it through the data-theme attribute by default.
    if (isDark) {
        document.documentElement.style.setProperty('--qm-brand', '#ffffff')
        document.documentElement.style.setProperty('--q-primary', '#ffffff')
    } else {
        document.documentElement.style.setProperty('--qm-brand', '#1a1a1a')
        document.documentElement.style.setProperty('--q-primary', '#1a1a1a')
    }
}
