// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { initializeFabricIcons } from '../common/fabric-icons';
import { MainWindowInitializer } from './main-window-initializer';
import { WindowInitializer } from './window-initializer';


/// <reference path='./Window.d.ts' />

if (!window.windowInitializer) {
    initializeFabricIcons();

    if (window.top === window) {
        window.windowInitializer = new MainWindowInitializer();
    }
    else {
        window.windowInitializer = new WindowInitializer();
    }

    window.windowInitializer.initialize();
}
