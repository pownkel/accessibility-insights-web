// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { NamedSFC } from '../../common/react/named-sfc';
import { ContentPageDeps, ContentProvider, ContentReference } from '../../views/content/content-page';
import { Page } from '../page/page';

export type ContentDeps = { contentProvider: ContentProvider } & ContentPageDeps;

export type ContentProps = { deps: ContentDeps, reference: ContentReference };

export const Content = NamedSFC<ContentProps>('Content', ({ deps, reference }) => {
    const { contentProvider } = deps;
    const ContentPage = contentProvider.contentFromReference(reference);
    return <Page>
        <div className="content-container">
            <div className="content-left">
            </div>
            <div className="content">
                <ContentPage deps={deps} />
            </div>
            <div className="content-right">
            </div>
        </div>
    </Page>;
});
