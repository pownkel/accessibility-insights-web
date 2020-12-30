// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ColumnValueBag } from 'common/types/property-bag/column-value-bag';
import { GeneratedAssessmentInstance } from 'common/types/store-data/assessment-result-data';

export type InstanceGroupingConfiguration = {
    getGroupKey: (instance: GeneratedAssessmentInstance) => string;
    getGroupTitle: (instance: GeneratedAssessmentInstance) => string;
};

export const getGroupByPropertyConfig = (
    propertyName: string,
    displayedPropertyName: string,
): InstanceGroupingConfiguration => {
    const getPropertyValue = (instance: GeneratedAssessmentInstance<ColumnValueBag>): string =>
        instance.propertyBag[propertyName] ? `${instance.propertyBag[propertyName]}` : '(no value)';
    return {
        getGroupKey: getPropertyValue,
        getGroupTitle: (instance: GeneratedAssessmentInstance<ColumnValueBag>) =>
            `${displayedPropertyName} = ${getPropertyValue(instance)}`,
    };
};
