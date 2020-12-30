// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    getGroupByPropertyConfig,
    InstanceGroupingConfiguration,
} from 'assessments/common/instance-grouping-config';
import { GeneratedAssessmentInstance } from 'common/types/store-data/assessment-result-data';

describe('InstanceGroupingConfiguration', () => {
    describe.each([undefined, 'value'])('Property value = %s', propertyValue => {
        type PropertyBag = { property: string };

        const propertyName = 'property';
        const displayedPropertyName = 'Property';
        let instance: GeneratedAssessmentInstance<PropertyBag>;
        let groupingConfig: InstanceGroupingConfiguration;

        beforeEach(() => {
            groupingConfig = getGroupByPropertyConfig(propertyName, displayedPropertyName);
            instance = {
                propertyBag: { property: propertyValue },
            } as GeneratedAssessmentInstance<PropertyBag>;
        });

        it('getGroupKey', () => {
            const groupKey = groupingConfig.getGroupKey(instance);

            expect(groupKey).toMatchSnapshot();
        });

        it('getGroupTitle', () => {
            const groupTitle = groupingConfig.getGroupTitle(instance);

            expect(groupTitle).toMatchSnapshot();
        });
    });
});
