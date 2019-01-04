// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { It, Mock, Times } from 'typemoq';

import { HTMLElementUtils } from '../../../common/html-element-utils';
import { NodeListBuilder } from '../../Common/node-list-builder';

describe('HTMLElementUtilsTest', () => {
    test('getContentWindow', () => {
        const testObject = new HTMLElementUtils();

        const frame = {
            contentWindow: 'content-window',
        } as any;

        const result = testObject.getContentWindow(frame);

        expect(result).toEqual(frame.contentWindow);
    });

    test('scrollIntoView', () => {
        const scrollMock = Mock.ofInstance(() => { });
        scrollMock
            .setup(s => s())
            .verifiable(Times.once());

        const element = {
            scrollIntoView: scrollMock.object,
        } as any;

        const testObject = new HTMLElementUtils();

        testObject.scrollInToView(element);
        scrollMock.verifyAll();
    });

    test('getAllElementsByTagName', () => {
        const tagName = 'tagName';

        const expectedElement = 'element' as any;
        const getElementsMock = Mock.ofInstance((_: string) => new Element());
        getElementsMock
            .setup(get => get(tagName))
            .returns(() => expectedElement);

        const dom = {
            getElementsByTagName: getElementsMock.object,
        } as any;

        const testObject = new HTMLElementUtils(dom);

        const result = testObject.getAllElementsByTagName(tagName);

        expect(result).toEqual(expectedElement);
    });

    test('querySelector', () => {
        const selector = 'selector';

        const expectedElement = 'element' as any;
        const querySelectorMock = Mock.ofInstance((_: string) => new Element());
        querySelectorMock
            .setup(qs => qs(selector))
            .returns(() => expectedElement);

        const dom = {
            querySelector: querySelectorMock.object,
        } as any;

        const testObject = new HTMLElementUtils(dom);

        const result = testObject.querySelector(selector);

        expect(result).toEqual(expectedElement);
    });

    test('querySelectorAll', () => {
        const selector = 'selector';

        const elements = ['element1' as any, 'element2' as any];

        const expectedElements: NodeListOf<Element> = NodeListBuilder.createNodeList(elements);

        const querySelectorAllMock = Mock.ofInstance((_: string) => null as NodeListOf<Element>);
        querySelectorAllMock
            .setup(qs => qs(selector))
            .returns(() => expectedElements);

        const dom = {
            querySelectorAll: querySelectorAllMock.object,
        } as any;

        const testObject = new HTMLElementUtils(dom);

        const result = testObject.querySelectorAll(selector);

        expect(result).toEqual(expectedElements);
    });

    test('attachShadow', () => {
        const attachMock = Mock.ofInstance((_: { mode: string }) => { });
        attachMock
            .setup(a => a(It.isValue({ mode: 'open' })))
            .verifiable(Times.once());

        const element = {
            attachShadow: attachMock.object,
        } as any;

        const testObject = new HTMLElementUtils();
        testObject.attachShadow(element);

        attachMock.verifyAll();
    });

    test('getTagName', () => {
        const element = {
            tagName: 'TAGNAME',
        } as any;

        const testObject = new HTMLElementUtils();

        const result = testObject.getTagName(element);

        expect(result).toEqual('tagname');
    });

    test('getcurrentFocusedElement', () => {
        const expectedElement = 'element' as any;

        const dom = {
            activeElement: expectedElement,
        } as any;

        const testObject = new HTMLElementUtils(dom);

        const result = testObject.getCurrentFocusedElement();

        expect(result).toEqual(expectedElement);
    });

    test('elementMatches', () => {
        const selectors = 'selectors';

        const expectedResult = true;
        const matchesMock = Mock.ofInstance((_: string) => true);
        matchesMock
            .setup(m => m(selectors))
            .returns(() => expectedResult);

        const element = {
            matches: matchesMock.object,
        } as any;

        const testObject = new HTMLElementUtils();
        const result = testObject.elementMatches(element, selectors);

        expect(result).toEqual(expectedResult);
    });

    test('getComputedStyle', () => {
        const element = 'element' as any;
        const style = { 'style': 'computed' } as any as CSSStyleDeclaration;

        const getComputedStyle = Mock.ofInstance((_: Element) => style);
        getComputedStyle
            .setup(fn => fn(element))
            .returns(() => style);
        const win = { getComputedStyle: getComputedStyle.object } as any as Window;

        const utils = new HTMLElementUtils(null, win);

        const actual = utils.getComputedStyle(element);

        expect(actual).toEqual(style);
    });

    test('getClientRects', () => {
        const rects = { length: 42 } as any as ClientRectList;

        const element = { getClientRects: () => rects } as any as Element;

        const utils = new HTMLElementUtils(null, null);

        const actual = utils.getClientRects(element);

        expect(actual).toEqual(rects);
    });

    test('getOffsetHeight', () => {
        const expected = 42;

        const element = { offsetHeight: expected } as any as HTMLElement;

        const utils = new HTMLElementUtils(null, null);

        const actual = utils.getOffsetHeight(element);

        expect(actual).toEqual(expected);
    });

    test('getOffsetWidth', () => {
        const expected = 2112;

        const element = { offsetWidth: expected } as any as HTMLElement;

        const utils = new HTMLElementUtils(null, null);

        const actual = utils.getOffsetWidth(element);

        expect(actual).toEqual(expected);
    });
});
