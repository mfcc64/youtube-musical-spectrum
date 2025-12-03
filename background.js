/*
 * Copyright (c) 2025 Muhammad Faiz <mfcc64@gmail.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 */

"use strict";

chrome.runtime.onInstalled.addListener(v => {
    let first_time = false;

    if (v.reason == "install")
        first_time = true;

    if (v.reason == "update") {
        const va = v.previousVersion.split(".");
        const version = 1000000 * va[0] + 1000 * va[1] + 1 * va[2];
        if (version <= 17000000)
            first_time = true;
    }

    if (!first_time)
        return;

    const ts = 1 * new Date();
    chrome.runtime.openOptionsPage();
    chrome.runtime.setUninstallURL("https://mfcc64.github.io/ytms-uninstall/#ts" + ts);
});

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});
