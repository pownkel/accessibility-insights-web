// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as AxeUtils from 'scanner/axe-utils';
import { RuleConfiguration } from 'scanner/iruleresults';

const consistentIdentificationId: string = 'consistent-identification';

export const consistentIdentificationConfiguration: RuleConfiguration = {
    checks: [
        {
            id: consistentIdentificationId,
            evaluate: evaluateConsistentIdentification,
        },
    ],
    rule: {
        id: 'consistent-identification',
        selector: '*',
        any: [consistentIdentificationId],
        matches: hasAccessibleName,
        enabled: false,
    },
};

function hasAccessibleName(node: HTMLElement): boolean {
    const accessibleName = AxeUtils.getAccessibleText(node, false);
    return accessibleName !== '';
}

function evaluateConsistentIdentification(node: HTMLElement): boolean {
    const accessibleName: string = AxeUtils.getAccessibleText(node, false);
    const role: string | null = node.getAttribute('role');

    this.data({
        accessibleName,
        role,
    });

    return true;
}
