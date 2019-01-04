// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { createCallChainExtensionPoint } from '../../../../common/extensibility/extension-point';

describe('ExtensionPoint', () => {

    const magicString = 'TestX';
    const magicNumber = 2112;

    type EXT = {
        one: (str: string) => void,
        two: (int: number) => void,
    };

    const base = {
        one: jest.fn<{ str: string }>(),
        two: jest.fn<{ int: number }>(),
    };

    const componentOne = {
        one: jest.fn<{ str: string }>(),
        two: jest.fn<{ int: number }>(),
    };

    const componentTwo = {
        one: jest.fn<{ str: string }>(),
        two: jest.fn<{ int: number }>(),
    };

    const ep = createCallChainExtensionPoint(magicString, base as EXT);

    const extOne = ep.define(componentOne);
    const extTwo = ep.define(componentTwo);

    it('works with empty extension list', () => {

        const result = ep.apply([]);

        result.one(magicString);
        result.two(magicNumber);

        expect(base.one).toBeCalledWith(magicString);
        expect(base.two).toBeCalledWith(magicNumber);

    });

    it('works with one extension in list', () => {

        const result = ep.apply([extOne]);

        result.one(magicString);
        result.two(magicNumber);

        expect(base.one).toBeCalledWith(magicString);
        expect(componentOne.one).toBeCalledWith(magicString);
        expect(base.two).toBeCalledWith(magicNumber);
        expect(componentOne.two).toBeCalledWith(magicNumber);

    });

    it('works with two extensions in list', () => {

        const result = ep.apply([extOne, extTwo]);

        result.one(magicString);
        result.two(magicNumber);

        expect(base.one).toBeCalledWith(magicString);
        expect(componentOne.one).toBeCalledWith(magicString);
        expect(componentTwo.one).toBeCalledWith(magicString);
        expect(base.two).toBeCalledWith(magicNumber);
        expect(componentOne.two).toBeCalledWith(magicNumber);
        expect(componentTwo.two).toBeCalledWith(magicNumber);

    });

    it('works with bad extensions in list', () => {

        const badExtensions = [
            null,
            undefined,
            [],
            {},
            { type: 'Extension' },
        ];

        const result = ep.apply([extOne, ...badExtensions, extTwo]);

        result.one(magicString);
        result.two(magicNumber);

        expect(base.one).toBeCalledWith(magicString);
        expect(componentOne.one).toBeCalledWith(magicString);
        expect(componentTwo.one).toBeCalledWith(magicString);
        expect(base.two).toBeCalledWith(magicNumber);
        expect(componentOne.two).toBeCalledWith(magicNumber);
        expect(componentTwo.two).toBeCalledWith(magicNumber);

    });
});
