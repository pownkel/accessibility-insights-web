// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, Mock, Times } from 'typemoq';

import { ClientUtils } from '../../../../injected/client-utils';
import { DrawerUtils } from '../../../../injected/visualization/drawer-utils';
import { TabbableElementsHelper } from './../../../../common/tabbable-elements-helper';
import { WindowUtils } from './../../../../common/window-utils';
import { CenterPositionCalculator } from './../../../../injected/visualization/center-position-calculator';
import { IPoint } from './../../../../injected/visualization/ipoint';
import { TestDocumentCreator } from './../../../Common/test-document-creator';
import { DrawerUtilsMockBuilder } from './drawer-utils-mock-builder';

describe('CenterPositionCalculatorTest', () => {
    let windowUtilsMock: IMock<WindowUtils>;
    let tabbableElementsHelperMock: IMock<TabbableElementsHelper>;
    let querySelectorMock: IMock<any>;
    let documentMock;
    const bodyStub = {bodyStub: true} as any;
    const styleStub = {styleStub: true} as any;

    beforeEach(() => {
        windowUtilsMock = Mock.ofType(WindowUtils);
        tabbableElementsHelperMock = Mock.ofType(TabbableElementsHelper);
        querySelectorMock = Mock.ofInstance(() => HTMLElement);
        documentMock = {
            documentElement: {docElement: true},
            querySelector: querySelectorMock.object,
        };
    });

    function createCenterPositionCalculator(drawerUtils: DrawerUtils): CenterPositionCalculator {
        const centerPositionCalculator = new CenterPositionCalculator(
            drawerUtils,
            windowUtilsMock.object,
            tabbableElementsHelperMock.object,
            new ClientUtils(window),
        );

        return centerPositionCalculator;
    }

    test('getElementCenterPosition', () => {
        const element = document.createElement('div');
        const expectedPosition: IPoint = {
            x: 12,
            y: 12,
        };

        setupDefaultQuerySelectorMock();
        setupDefaultWindowUtilsMock();
        const drawerUtilsMock = new DrawerUtilsMockBuilder(documentMock, styleStub)
            .setupGetContainerOffset(10)
            .setupGetContainerSize(4)
            .build();

        const centerPositionCalculator = createCenterPositionCalculator(drawerUtilsMock.object);

        expect(centerPositionCalculator.getElementCenterPosition(element)).toEqual(expectedPosition);

        drawerUtilsMock.verifyAll();
        querySelectorMock.verifyAll();
        windowUtilsMock.verifyAll();
    });

    test('getElementCenterPosition: area outsied of doc', () => {
        const dom = TestDocumentCreator.createTestDocument(`
                    <img id="img1" src="planets.gif" width="145" height="126" alt="Planets" usemap="#planetmap">
                    <map id="map1" name="planetmap">
                        <area id="id1" shape="poly" coords="10,20,80,60,0,40" alt="Venus" href="venus.htm">
                    </map>
                `);

        const img: HTMLImageElement = dom.querySelector('#img1') as HTMLImageElement;
        const area: HTMLElement = dom.querySelector('#id1') as HTMLElement;
        const map: HTMLMapElement = dom.querySelector('#map1') as HTMLMapElement;

        setupDefaultQuerySelectorMock();
        setupDefaultWindowUtilsMock();
        const drawerUtilsMock = new DrawerUtilsMockBuilder(documentMock, styleStub)
            .setupIsOutsideOfDocument(true)
            .setupGetContainerOffsetNeverCall()
            .build();

        setupDefaultTabbableElementsHelperMock(area, map, img);

        const centerPositionCalculator = createCenterPositionCalculator(drawerUtilsMock.object);

        expect(centerPositionCalculator.getElementCenterPosition(area)).toBeNull();

        drawerUtilsMock.verifyAll();
        querySelectorMock.verifyAll();
        windowUtilsMock.verifyAll();
    });

    test('getElementCenterPosition: default area', () => {
        const expectedPosition: IPoint = {
            x: 12,
            y: 12,
        };
        const dom = TestDocumentCreator.createTestDocument(`
                    <img id="img1" src="planets.gif" width="145" height="126" alt="Planets" usemap="#planetmap">
                    <map id="map1" name="planetmap">
                        <area id="id1" shape="default" alt="Venus" href="venus.htm">
                    </map>
                `);
        const img: HTMLImageElement = dom.querySelector('#img1') as HTMLImageElement;
        const area: HTMLElement = dom.querySelector('#id1') as HTMLElement;
        const map: HTMLMapElement = dom.querySelector('#map1') as HTMLMapElement;

        setupDefaultQuerySelectorMock();
        setupDefaultWindowUtilsMock();

        const drawerUtilsMock = new DrawerUtilsMockBuilder(documentMock, styleStub)
            .setupGetContainerOffset(10)
            .setupGetContainerSize(4)
            .build();

        setupDefaultTabbableElementsHelperMock(area, map, img);

        const centerPositionCalculator = createCenterPositionCalculator(drawerUtilsMock.object);

        expect(centerPositionCalculator.getElementCenterPosition(area)).toEqual(expectedPosition);

        drawerUtilsMock.verifyAll();
        querySelectorMock.verifyAll();
        windowUtilsMock.verifyAll();
    });

    test('getElementCenterPosition: circle area', () => {
        const expectedPosition: IPoint = {
            x: 100,
            y: 68,
        };
        const dom = TestDocumentCreator.createTestDocument(`
                    <img id="img1" src="planets.gif" width="145" height="126" alt="Planets" usemap="#planetmap">
                    <map id="map1" name="planetmap">
                        <area id="id1" shape="circle" coords="90,58,3" alt="Mercury" href="mercur.htm">
                    </map>
                `);
        const img: HTMLImageElement = dom.querySelector('#img1') as HTMLImageElement;
        const area: HTMLElement = dom.querySelector('#id1') as HTMLElement;
        const map: HTMLMapElement = dom.querySelector('#map1') as HTMLMapElement;
        const drawerUtilsMock = new DrawerUtilsMockBuilder(documentMock, styleStub)
            .setupGetContainerSizeNeverCall()
            .setupGetContainerOffset(10)
            .build();

        setupDefaultTabbableElementsHelperMock(area, map, img);

        setupDefaultQuerySelectorMock();
        setupDefaultWindowUtilsMock();

        const centerPositionCalculator = createCenterPositionCalculator(drawerUtilsMock.object);

        expect(centerPositionCalculator.getElementCenterPosition(area)).toEqual(expectedPosition);

        drawerUtilsMock.verifyAll();
        querySelectorMock.verifyAll();
        windowUtilsMock.verifyAll();
    });

    test('getElementCenterPosition: poly area', () => {
        const expectedPosition: IPoint = {
            x: 40,
            y: 50,
        };
        const dom = TestDocumentCreator.createTestDocument(`
                    <img id="img1" src="planets.gif" width="145" height="126" alt="Planets" usemap="#planetmap">
                    <map id="map1" name="planetmap">
                        <area id="id1" shape="poly" coords="10,20,80,60,0,40" alt="Venus" href="venus.htm">
                    </map>
                `);
        const img: HTMLImageElement = dom.querySelector('#img1') as HTMLImageElement;
        const area: HTMLElement = dom.querySelector('#id1') as HTMLElement;
        const map: HTMLMapElement = dom.querySelector('#map1') as HTMLMapElement;

        const drawerUtilsMock = new DrawerUtilsMockBuilder(documentMock, styleStub)
            .setupGetContainerOffset(10)
            .setupGetContainerSizeNeverCall()
            .build();

        setupDefaultQuerySelectorMock();
        setupDefaultWindowUtilsMock();
        setupDefaultTabbableElementsHelperMock(area, map, img);

        const centerPositionCalculator = createCenterPositionCalculator(drawerUtilsMock.object);

        expect(centerPositionCalculator.getElementCenterPosition(area)).toEqual(expectedPosition);

        drawerUtilsMock.verifyAll();
        querySelectorMock.verifyAll();
        windowUtilsMock.verifyAll();
    });

    test('getElementCenterPosition: rect area', () => {
        const expectedPosition: IPoint = {
            x: 51,
            y: 73,
        };
        const dom = TestDocumentCreator.createTestDocument(`
                    <img id="img1" src="planets.gif" width="145" height="126" alt="Planets" usemap="#planetmap">
                    <map id="map1" name="planetmap">
                        <area id="id1" shape="rect" coords="0,0,82,126" alt="Sun" href="sun.htm">
                    </map>
                `);
        const img: HTMLImageElement = dom.querySelector('#img1') as HTMLImageElement;
        const area: HTMLElement = dom.querySelector('#id1') as HTMLElement;
        const map: HTMLMapElement = dom.querySelector('#map1') as HTMLMapElement;

        const drawerUtilsMock = new DrawerUtilsMockBuilder(documentMock, styleStub)
            .setupGetContainerOffset(10)
            .setupGetContainerSizeNeverCall()
            .build();

        setupDefaultQuerySelectorMock();
        setupDefaultWindowUtilsMock();
        setupDefaultTabbableElementsHelperMock(area, map, img);

        const centerPositionCalculator = createCenterPositionCalculator(drawerUtilsMock.object);

        expect(centerPositionCalculator.getElementCenterPosition(area)).toEqual(expectedPosition);

        drawerUtilsMock.verifyAll();
        querySelectorMock.verifyAll();
        windowUtilsMock.verifyAll();
    });

    test('getElementCenterPosition: invalid area', () => {
        const expectedPosition: IPoint = {
            x: 10,
            y: 10,
        };
        const dom = TestDocumentCreator.createTestDocument(`
                    <img id="img1" src="planets.gif" width="145" height="126" alt="Planets" usemap="#planetmap">
                    <map id="map1" name="planetmap">
                        <area id="id1" shape="invalid" coords="0,0,82,126" alt="Sun" href="sun.htm">
                    </map>
                `);
        const img: HTMLImageElement = dom.querySelector('#img1') as HTMLImageElement;
        const area: HTMLElement = dom.querySelector('#id1') as HTMLElement;
        const map: HTMLMapElement = dom.querySelector('#map1') as HTMLMapElement;

        const drawerUtilsMock = new DrawerUtilsMockBuilder(documentMock, styleStub)
            .setupGetContainerOffset(10)
            .setupGetContainerSizeNeverCall()
            .build();

        setupDefaultQuerySelectorMock();
        setupDefaultWindowUtilsMock();
        setupDefaultTabbableElementsHelperMock(area, map, img);

        const centerPositionCalculator = createCenterPositionCalculator(drawerUtilsMock.object);

        expect(centerPositionCalculator.getElementCenterPosition(area)).toEqual(expectedPosition);

        drawerUtilsMock.verifyAll();
        querySelectorMock.verifyAll();
        windowUtilsMock.verifyAll();
    });

    test('getElementCenterPosition outside of doc', () => {
        const element = document.createElement('div');

        const drawerUtilsMock = new DrawerUtilsMockBuilder(documentMock, styleStub)
            .setupIsOutsideOfDocument(true)
            .setupGetContainerOffsetNeverCall()
            .build();

        setupDefaultQuerySelectorMock();
        setupDefaultWindowUtilsMock();

        const centerPositionCalculator = createCenterPositionCalculator(drawerUtilsMock.object);

        expect(centerPositionCalculator.getElementCenterPosition(element)).toBeNull();

        drawerUtilsMock.verifyAll();
        querySelectorMock.verifyAll();
        windowUtilsMock.verifyAll();
    });

    function setupDefaultQuerySelectorMock(): void {
        querySelectorMock
            .setup(q => q('body'))
            .returns(selector => bodyStub)
            .verifiable(Times.once());
    }

    function setupDefaultWindowUtilsMock(): void {
        windowUtilsMock
            .setup(w => w.getComputedStyle(bodyStub as any))
            .returns(() => styleStub as any)
            .verifiable(Times.once());

        windowUtilsMock
            .setup(w => w.getComputedStyle(documentMock.documentElement))
            .returns(() => styleStub as any)
            .verifiable(Times.once());
    }

    function setupDefaultTabbableElementsHelperMock(area: HTMLElement, map: HTMLMapElement, img: HTMLImageElement): void {
        tabbableElementsHelperMock
            .setup(t => t.getAncestorMap(area))
            .returns(() => map)
            .verifiable(Times.once());

        tabbableElementsHelperMock
            .setup(t => t.getMappedImage(map))
            .returns(() => img)
            .verifiable(Times.once());
    }
});
