// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AnalyzerConfigurationFactory } from 'assessments/common/analyzer-configuration-factory';
import { onRenderSnippetColumn } from 'assessments/common/element-column-renderers';
import { ReportInstanceField } from 'assessments/types/report-instance-field';
import { NewTabLink } from 'common/components/new-tab-link';
import { VisualizationType } from 'common/types/visualization-type';
import { link } from 'content/link';
import * as content from 'content/test/semantics/headers-attribute';
import { AssessmentVisualizationEnabledToggle } from 'DetailsView/components/assessment-visualization-enabled-toggle';
import * as React from 'react';

import { ManualTestRecordYourResults } from '../../common/manual-test-record-your-results';
import * as Markup from '../../markup';
import { Requirement } from '../../types/requirement';
import { SemanticsTestStep } from './test-steps';

const headersAttributeDescription: JSX.Element = (
    <span>
        The <Markup.CodeTerm>headers</Markup.CodeTerm> attribute of a <Markup.Tag tagName="td" />{' '}
        element must reference the correct <Markup.Tag tagName="th" /> element(s).
    </span>
);

const headersAttributeHowToTest: JSX.Element = (
    <div>
        <p>
            This procedure uses the{' '}
            <NewTabLink href="https://chrome.google.com/webstore/detail/web-developer/bfbameneiokkgbdmiekhjnmfkcnldhhm">
                Web Developer
            </NewTabLink>{' '}
            browser extension.
        </p>
        <ol>
            <li>
                Use the Web Developer browser extension (
                <Markup.Term>Information {'>'} Display table information</Markup.Term>) to reveal
                any <Markup.CodeTerm>headers</Markup.CodeTerm> attributes on the page. Note: The{' '}
                <Markup.CodeTerm>headers</Markup.CodeTerm> attributes are displayed on the data
                cells, and not on the <Markup.Tag tagName="th" /> cells they reference.
            </li>

            <li>
                If a table has <Markup.CodeTerm>headers</Markup.CodeTerm> attributes, inspect the
                HTML to verify that they are coded correctly:
                <ol>
                    <li>
                        Each header cell (<Markup.Tag tagName="th" /> element) must have an{' '}
                        <Markup.CodeTerm>id</Markup.CodeTerm> attribute.
                    </li>
                    <li>
                        Each data cell (<Markup.Tag tagName="td" /> element) must have a{' '}
                        <Markup.CodeTerm>headers</Markup.CodeTerm> attribute.
                    </li>
                    <li>
                        Each data cell's <Markup.CodeTerm>headers</Markup.CodeTerm> attribute must
                        reference all cells that function as headers for that data cell.
                    </li>
                </ol>
                Note: If a <Markup.CodeTerm>headers</Markup.CodeTerm> attribute references an
                element that is missing or invalid, it will fail an automated check.
            </li>
            <ManualTestRecordYourResults isMultipleFailurePossible={true} />
        </ol>
    </div>
);

const key = SemanticsTestStep.headersAttribute;

export const HeadersAttribute: Requirement = {
    key,
    name: 'Headers attribute',
    description: headersAttributeDescription,
    howToTest: headersAttributeHowToTest,
    isManual: false,
    ...content,
    guidanceLinks: [link.WCAG_1_3_1],
    getAnalyzer: provider =>
        provider.createRuleAnalyzer(
            AnalyzerConfigurationFactory.forScanner({
                rules: ['headers-attribute'],
                key,
                testType: VisualizationType.SemanticsAssessment,
            }),
        ),
    getDrawer: provider => provider.createTableHeaderAttributeDrawer(),
    getVisualHelperToggle: props => <AssessmentVisualizationEnabledToggle {...props} />,
    reportInstanceFields: [ReportInstanceField.fromSnippet('element', 'Element')],
    columnsConfig: [
        {
            key: 'element',
            name: 'Element',
            onRender: onRenderSnippetColumn,
        },
    ],
};
