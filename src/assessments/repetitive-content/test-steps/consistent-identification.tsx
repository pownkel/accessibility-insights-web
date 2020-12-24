// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AnalyzerConfigurationFactory } from 'assessments/common/analyzer-configuration-factory';
import { AssistedTestRecordYourResults } from 'assessments/common/assisted-test-record-your-results';
import { PropertyBagColumnRendererFactory } from 'assessments/common/property-bag-column-renderer-factory';
import { ReportInstanceField } from 'assessments/types/report-instance-field';
import { NewTabLink } from 'common/components/new-tab-link';
import { ConsistentIdentificationPropertyBag } from 'common/types/property-bag/consistent-identification';
import {
    NoValue,
    PropertyBagColumnRendererConfig,
} from 'common/types/property-bag/property-bag-column-renderer-config';
import { VisualizationType } from 'common/types/visualization-type';
import { link } from 'content/link';
import { TestAutomaticallyPassedNotice } from 'content/test/common/test-automatically-passed-notice';
import * as content from 'content/test/repetitive-content/consistent-identification';
import { AssessmentVisualizationEnabledToggle } from 'DetailsView/components/assessment-visualization-enabled-toggle';
import { ScannerUtils } from 'injected/scanner-utils';
import * as React from 'react';
import { Requirement } from '../../types/requirement';
import { RepetitiveContentTestStep } from './test-steps';

const consistentIdentificationDescription: JSX.Element = (
    <span>
        Functional components that appear on multiple pages must be identified consistently.
    </span>
);

const consistentIdentificationHowToTest: JSX.Element = (
    <div>
        <ol>
            <li>
                Examine the target page to identify any functional components (such as links,
                widgets, icons, images, headings, etc.) that appear on multiple pages.
            </li>
            <TestAutomaticallyPassedNotice />
            <li>
                Use the{' '}
                <NewTabLink href="https://developers.google.com/web/updates/2018/01/devtools">
                    Accessibility pane in the browser Developer Tools
                </NewTabLink>{' '}
                to verify that the component has the same accessible name each time it appears.
            </li>
            <AssistedTestRecordYourResults />
        </ol>
    </div>
);

const propertyBagConfig: PropertyBagColumnRendererConfig<ConsistentIdentificationPropertyBag>[] = [
    {
        propertyName: 'accessibleName',
        displayName: 'Accessible name',
        defaultValue: NoValue,
    },
    {
        propertyName: 'role',
        displayName: 'Role',
        defaultValue: NoValue,
    },
];

export const ConsistentIdentification: Requirement = {
    key: RepetitiveContentTestStep.consistentIdentification,
    name: 'Consistent identification',
    description: consistentIdentificationDescription,
    howToTest: consistentIdentificationHowToTest,
    isManual: false,
    columnsConfig: [
        {
            key: 'consistent-identification-info',
            name: 'Consisitent identification',
            onRender: PropertyBagColumnRendererFactory.getRenderer<ConsistentIdentificationPropertyBag>(
                propertyBagConfig,
            ),
        },
    ],
    guidanceLinks: [link.WCAG_3_2_4],
    reportInstanceFields: ReportInstanceField.fromColumns(propertyBagConfig),
    getAnalyzer: provider =>
        provider.createRuleAnalyzer(
            AnalyzerConfigurationFactory.forScanner({
                rules: ['consistent-identification'],
                key: RepetitiveContentTestStep.consistentIdentification,
                testType: VisualizationType.RepetitiveContentAssessment,
                resultProcessor: (scanner: ScannerUtils) => scanner.getPassingInstances,
            }),
        ),
    getDrawer: provider => provider.createHighlightBoxDrawer(),
    getVisualHelperToggle: props => <AssessmentVisualizationEnabledToggle {...props} />,
    ...content,
};
