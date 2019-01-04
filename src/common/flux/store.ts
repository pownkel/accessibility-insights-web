// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { EventHandlerList } from './event-handler-list';

export interface IStore {
    addChangedListener(handler: Function): void;
    removeChangedListener(handler: Function): void;
}

export class Store implements IStore {
    private _changedHandlers = new EventHandlerList();


    public addChangedListener(handler: Function): void {
        this._changedHandlers.subscribe(handler as any);
    }

    public removeChangedListener(handler: Function): void {
        this._changedHandlers.unsubscribe(handler as any);
    }

    protected emitChanged(): void {
        this._changedHandlers.invokeHandlers(this);
    }
}
