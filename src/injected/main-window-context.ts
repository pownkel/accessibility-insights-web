// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
/// <reference path='./Window.d.ts' />
import { TargetPageActionMessageCreator } from './target-page-action-message-creator';
import { IBaseStore } from '../common/istore';
import { DevToolActionMessageCreator } from '../common/message-creators/dev-tool-action-message-creator';
import { DevToolState } from '../common/types/store-data/idev-tool-state';

export class MainWindowContext {
    private devToolStore: IBaseStore<DevToolState>;
    private devToolActionMessageCreator: DevToolActionMessageCreator;
    private targetPageActionMessageCreator: TargetPageActionMessageCreator;

    public constructor(
        devToolStore: IBaseStore<DevToolState>,
        devToolActionMessageCreator: DevToolActionMessageCreator,
        targetPageActionMessageCreator: TargetPageActionMessageCreator,
    ) {
        this.devToolStore = devToolStore;
        this.devToolActionMessageCreator = devToolActionMessageCreator;
        this.targetPageActionMessageCreator = targetPageActionMessageCreator;
    }

    public getDevToolStore(): IBaseStore<DevToolState> {
        return this.devToolStore;
    }

    public getDevToolActionMessageCreator(): DevToolActionMessageCreator {
        return this.devToolActionMessageCreator;
    }

    public getTargetPageActionMessageCreator(): TargetPageActionMessageCreator {
        return this.targetPageActionMessageCreator;
    }

    public static initialize(
        devToolStore: IBaseStore<DevToolState>,
        devToolActionMessageCreator: DevToolActionMessageCreator,
        targetPageActionMessageCreator: TargetPageActionMessageCreator,
    ): void {
        window.mainWindowContext = new MainWindowContext(
            devToolStore,
            devToolActionMessageCreator,
            targetPageActionMessageCreator,
        );
    }

    public static get(): MainWindowContext {
        return window.mainWindowContext;
    }

    public static getIfNotGiven(given: MainWindowContext): MainWindowContext {
        if (given) {
            return given;
        }
        return MainWindowContext.get();
    }
}
