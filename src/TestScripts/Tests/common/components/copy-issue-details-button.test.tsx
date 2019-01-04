// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Enzyme from 'enzyme';
import * as React from 'react';

import { CopyIssueDetailsButton, CopyIssueDetailsButtonProps} from '../../../../common/components/copy-issue-details-button';
import { Mock, It, Times, IMock } from 'typemoq';
import { CreateIssueDetailsTextData } from '../../../../common/types/create-issue-details-text-data';
import { IssueDetailsTextGenerator } from '../../../../background/issue-details-text-generator';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

describe('CopyIssueDetailsButtonTest', () => {
    let props: CopyIssueDetailsButtonProps;
    let onClickMock: IMock<(event: React.MouseEvent<any>) => void>;
    beforeEach(() => {
        onClickMock = Mock.ofInstance((e) => {});
        props = {
            deps: {
                windowUtils: null,
                issueDetailsTextGenerator: {
                    buildText: (_) => 'sample text',
                } as IssueDetailsTextGenerator,
            },
            issueDetailsData: {
                pageTitle: 'title',
                pageUrl: 'url',
                ruleResult: {},
            } as CreateIssueDetailsTextData,
            onClick: onClickMock.object,
        };
    });

    test('render', () => {
        const result = Enzyme.shallow(<CopyIssueDetailsButton {...props}/>);
        expect(result.getElement()).toMatchSnapshot();
    });

    test('render after click shows toast', () => {
        const result = Enzyme.shallow(<CopyIssueDetailsButton {...props}/>);
        const button = result.find(DefaultButton);
        onClickMock
            .setup(m => m(It.isAny()))
            .verifiable(Times.once());
        button.simulate('click');
        expect(result.getElement()).toMatchSnapshot();
        onClickMock.verifyAll();
    })
});

