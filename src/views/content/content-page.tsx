// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { flatten, toPairs } from 'lodash';
import * as React from 'react';

import { NamedSFC } from '../../common/react/named-sfc';
import { createMarkup, Markup, MarkupDeps } from './markup';

export type HyperlinkDefinition = { href: string, text: string };
type HyperlinkDefinitionMap = { [KEY in string]: { href: string, text: string } };
type HyperlinkComponentMap<M extends HyperlinkDefinitionMap> = { [KEY in keyof M]: React.SFC };
export function linkTo(text: string, href: string): HyperlinkDefinition {
    return { text, href };
}

export type ContentPageDeps = MarkupDeps;
export type ContentPageProps = { deps: ContentPageDeps };
export type ContentPageComponent = React.SFC<ContentPageProps> & { displayName: 'ContentPageComponent' };
export type ContentReference = string | ContentPageComponent;
type CreateProps<M extends HyperlinkDefinitionMap> = {
    Markup: Markup,
    Link: HyperlinkComponentMap<M>,
};
export function ContentCreator<M extends HyperlinkDefinitionMap>(linkMap?: M) {

    function mapLinks(markup: Markup): HyperlinkComponentMap<M> {
        const map: Partial<HyperlinkComponentMap<M>> = {};

        if (linkMap) {
            toPairs(linkMap).forEach(([key, { href, text }]) => {
                map[key] = () => <markup.HyperLink href={href}>{text}</markup.HyperLink>;
            });
        }

        return map as HyperlinkComponentMap<M>;
    }

    function create(fn: (props: CreateProps<M>) => JSX.Element): ContentPageComponent {

        return NamedSFC<ContentPageProps>('ContentPageComponent', props => {
            const { deps } = props;
            const markup = createMarkup(deps);
            return fn({ Markup: markup, Link: mapLinks(markup) });
        }) as ContentPageComponent;
    }

    return create;
}

export interface ContentProvider {
    getPage(path: string): ContentPageComponent;
    allPaths(): string[];
    pathTo(component: ContentPageComponent): string;
    contentFromReference(content: ContentReference): ContentPageComponent;
    pathFromReference(content: ContentReference): string;
}
type ContentTree = { [K in string]: (ContentTree | ContentPageComponent) };
export function ContentProvider(root: ContentTree): ContentProvider {

    const create = ContentCreator();

    const notFoundPage = (path: string) => create(() => <h1>Cannot find {path}</h1>);

    function isContentPageComponent(leaf: any | ContentPageComponent): leaf is ContentPageComponent {
        return leaf
            && (leaf as ContentPageComponent).displayName
            && (leaf as ContentPageComponent).displayName === 'ContentPageComponent';
    }

    type TreeEntry = { path: string, leaf: ContentPageComponent };
    const flattenTree: ((ContentTree) => TreeEntry[]) = (tree: ContentTree) => {
        const prefixEntry = (prefix: string) => ({ path, leaf }: TreeEntry) => ({ path: prefix + '/' + path, leaf } as TreeEntry);

        const entries = toPairs(tree).map(([key, leaf]) =>
            isContentPageComponent(leaf)
                ? { path: key, leaf } as TreeEntry
                : flattenTree(leaf).map(prefixEntry(key)));

        return flatten(entries);
    };
    const rootEntries = flattenTree(root);

    function findPage(tree: ContentTree, [head, ...tail]: string[]): ContentPageComponent {
        if (!tree) {
            return null;
        }

        const branch = tree[head];
        if (isContentPageComponent(branch)) {
            if (tail.length === 0) {
                return branch;
            } else {
                return null;
            }
        } else {
            return findPage(branch, tail);
        }
    }

    function getPage(path: string) {
        return findPage(root, path.split('/')) || notFoundPage(path);
    }

    const allPaths = () => rootEntries.map(entry => entry.path);

    const pathTo = (component: ContentPageComponent) => {
        const entry = rootEntries.find(e => e.leaf === component);
        return entry ? entry.path : null;
    };

    const contentFromReference = (reference: ContentReference) => isContentPageComponent(reference) ? reference : getPage(reference);
    const pathFromReference = (reference: ContentReference) => isContentPageComponent(reference) ? pathTo(reference) : reference;

    return { getPage, allPaths, pathTo, contentFromReference, pathFromReference };
}


export const ContentPage = {
    create: ContentCreator(),
    provider: ContentProvider,
};
