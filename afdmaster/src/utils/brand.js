/*
 * Copyright (C) 2026 Luiz Gustavo Dias Pulz
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

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
