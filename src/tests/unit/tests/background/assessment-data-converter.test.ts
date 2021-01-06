// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, Times } from 'typemoq';

import { AssessmentDataConverter } from 'background/assessment-data-converter';
import { UniquelyIdentifiableInstances } from 'background/instance-identifier-generator';
import { ManualTestStatus } from 'common/types/manual-test-status';
import {
    AssessmentInstancesMap,
    GeneratedAssessmentInstance,
    TestStepResult,
} from 'common/types/store-data/assessment-result-data';
import { TabStopEvent } from 'common/types/tab-stop-event';
import { DecoratedAxeNodeResult, HtmlElementAxeResults } from 'injected/scanner-utils';
import { DictionaryStringTo } from 'types/common-types';
import { InstanceGroupingConfiguration } from 'assessments/common/instance-grouping-config';

describe('AssessmentDataConverter', () => {
    let testSubject: AssessmentDataConverter;
    const uid: string = 'uid123';
    let testStep: string;
    const expectedGenericTestStepResult: TestStepResult = {
        id: uid,
        status: ManualTestStatus.UNKNOWN,
        isCapturedByUser: false,
        failureSummary: null,
        isVisualizationSupported: true,
        isVisualizationEnabled: true,
        isVisible: true,
    };
    let identifierStub: string;
    let selectorStub: string;
    let htmlStub: string;
    let generateInstanceIdentifierMock: IMock<(instance: UniquelyIdentifiableInstances) => string>;

    beforeEach(() => {
        testSubject = new AssessmentDataConverter(() => uid);
        generateInstanceIdentifierMock = Mock.ofInstance(instance => null);
        testStep = 'test step';
        identifierStub = 'some identifier';
        selectorStub = 'some selector';
        htmlStub = 'some html';
    });

    describe('generateAssessmentInstancesMap', () => {
        it('should ignore selectors with no rule results.', () => {
            const selectorMap: DictionaryStringTo<HtmlElementAxeResults> = {
                [selectorStub]: {
                    ruleResults: {},
                    target: [selectorStub],
                },
            };
            const previouslyGeneratedInstances = {};
            const instanceMap = testSubject.generateAssessmentInstancesMap(
                previouslyGeneratedInstances,
                selectorMap,
                testStep,
                undefined,
                null,
                null,
                undefined,
            );

            expect(instanceMap).toEqual(previouslyGeneratedInstances);
        });

        it('should produce an empty map (not null) if previouslyGeneratedInstances is null and there are no rule results to add', () => {
            const selectorMap: DictionaryStringTo<HtmlElementAxeResults> = {
                [selectorStub]: {
                    ruleResults: {},
                    target: [selectorStub],
                },
            };
            const expectedResult = {};
            const instanceMap = testSubject.generateAssessmentInstancesMap(
                null,
                selectorMap,
                testStep,
                undefined,
                null,
                null,
                undefined,
            );

            expect(instanceMap).toEqual(expectedResult);
        });

        it('should create a new instance wrapping the generated result if there is no existing instance matching the selector', () => {
            const selectorMap: DictionaryStringTo<HtmlElementAxeResults> = {
                [selectorStub]: {
                    ruleResults: {
                        rule1: {
                            html: htmlStub,
                            id: 'id1',
                            status: false,
                        } as DecoratedAxeNodeResult,
                    },
                    target: [selectorStub],
                },
            };
            const expectedResult = {
                [identifierStub]: {
                    html: htmlStub,
                    propertyBag: null,
                    target: [selectorStub],
                    testStepResults: {
                        [testStep]: {
                            id: 'id1',
                            status: ManualTestStatus.UNKNOWN,
                            isCapturedByUser: false,
                            failureSummary: undefined,
                            isVisible: true,
                            isVisualizationEnabled: false,
                            isVisualizationSupported: true,
                        },
                    },
                },
            };
            setupGenerateInstanceIdentifierMock(
                { target: [selectorStub], html: htmlStub },
                identifierStub,
            );
            const instanceMap = testSubject.generateAssessmentInstancesMap(
                {},
                selectorMap,
                testStep,
                generateInstanceIdentifierMock.object,
                () => ManualTestStatus.UNKNOWN,
                () => true,
                undefined,
            );

            expect(instanceMap).toEqual(expectedResult);
        });

        it("should merge check results' data into the instance's propertyBag", () => {
            const expectedPropertyBag = {
                someProperty: 1,
            };

            const selectorMap: DictionaryStringTo<HtmlElementAxeResults> = {
                [selectorStub]: {
                    ruleResults: {
                        rule1: {
                            any: [
                                {
                                    id: 'rule1',
                                    data: expectedPropertyBag,
                                },
                            ],
                            html: htmlStub,
                            id: 'id1',
                            status: true,
                        } as DecoratedAxeNodeResult,
                    },
                    target: [selectorStub],
                },
            };

            setupGenerateInstanceIdentifierMock(
                { target: [selectorStub], html: htmlStub },
                identifierStub,
            );
            const instanceMap = testSubject.generateAssessmentInstancesMap(
                null,
                selectorMap,
                testStep,
                generateInstanceIdentifierMock.object,
                () => ManualTestStatus.UNKNOWN,
                () => true,
                undefined,
            );

            expect(instanceMap[identifierStub].propertyBag).toEqual(expectedPropertyBag);
        });

        it.each([ManualTestStatus.FAIL, ManualTestStatus.UNKNOWN, ManualTestStatus.PASS])(
            'should use getInstanceStatus to determine the status of the generated step result',
            (getInstanceStatusResult: ManualTestStatus) => {
                const selectorMap: DictionaryStringTo<HtmlElementAxeResults> = {
                    [selectorStub]: {
                        ruleResults: {
                            rule1: {
                                html: htmlStub,
                                id: 'id1',
                                status: false,
                            } as DecoratedAxeNodeResult,
                        },
                        target: [selectorStub],
                    },
                };

                setupGenerateInstanceIdentifierMock(
                    { target: [selectorStub], html: htmlStub },
                    identifierStub,
                );
                const instanceMap = testSubject.generateAssessmentInstancesMap(
                    {},
                    selectorMap,
                    testStep,
                    generateInstanceIdentifierMock.object,
                    () => getInstanceStatusResult,
                    () => true,
                    undefined,
                );

                expect(instanceMap[identifierStub].testStepResults[testStep].status).toEqual(
                    getInstanceStatusResult,
                );
            },
        );

        it.each([true, false])(
            'should use isVisualizationSupported to determine the corresponding property of the generated step result',
            (isVisualizationSupportedResult: boolean) => {
                const selectorMap: DictionaryStringTo<HtmlElementAxeResults> = {
                    [selectorStub]: {
                        ruleResults: {
                            rule1: {
                                html: htmlStub,
                                id: 'id1',
                                status: false,
                            } as DecoratedAxeNodeResult,
                        },
                        target: [selectorStub],
                    },
                };

                setupGenerateInstanceIdentifierMock(
                    { target: [selectorStub], html: htmlStub },
                    identifierStub,
                );
                const instanceMap = testSubject.generateAssessmentInstancesMap(
                    {},
                    selectorMap,
                    testStep,
                    generateInstanceIdentifierMock.object,
                    () => ManualTestStatus.UNKNOWN,
                    () => isVisualizationSupportedResult,
                    undefined,
                );

                expect(
                    instanceMap[identifierStub].testStepResults[testStep].isVisualizationSupported,
                ).toEqual(isVisualizationSupportedResult);
            },
        );

        it('should merge results for a previously seen selector into the existing instance data', () => {
            const anotherTestStep = 'another test step';
            const selectorMap: DictionaryStringTo<HtmlElementAxeResults> = {
                [selectorStub]: {
                    ruleResults: {
                        rule1: {
                            any: [
                                {
                                    id: 'rule1',
                                    data: { someProperty: 1 },
                                },
                            ],
                            html: htmlStub,
                            id: 'id1',
                            status: false,
                        } as DecoratedAxeNodeResult,
                    },
                    target: [selectorStub],
                },
            };
            const previouslyGeneratedInstances: AssessmentInstancesMap = {
                [identifierStub]: {
                    html: htmlStub,
                    propertyBag: { someProperty: 3 },
                    target: [selectorStub],
                    testStepResults: {
                        [anotherTestStep]: {
                            id: 'id2',
                            status: ManualTestStatus.UNKNOWN,
                            isCapturedByUser: false,
                            failureSummary: undefined,
                            isVisible: true,
                            isVisualizationEnabled: true,
                            isVisualizationSupported: true,
                        },
                    },
                },
            };
            const expectedResult = {
                [identifierStub]: {
                    html: htmlStub,
                    propertyBag: { someProperty: 3 },
                    target: [selectorStub],
                    testStepResults: {
                        [testStep]: {
                            id: 'id1',
                            status: ManualTestStatus.UNKNOWN,
                            isCapturedByUser: false,
                            failureSummary: undefined,
                            isVisible: true,
                            isVisualizationEnabled: false,
                            isVisualizationSupported: true,
                        },
                        [anotherTestStep]: {
                            id: 'id2',
                            status: ManualTestStatus.UNKNOWN,
                            isCapturedByUser: false,
                            failureSummary: undefined,
                            isVisible: true,
                            isVisualizationEnabled: true,
                            isVisualizationSupported: true,
                        },
                    },
                },
            };

            setupGenerateInstanceIdentifierMock(
                { target: [selectorStub], html: htmlStub },
                identifierStub,
            );
            const instanceMap = testSubject.generateAssessmentInstancesMap(
                previouslyGeneratedInstances,
                selectorMap,
                testStep,
                generateInstanceIdentifierMock.object,
                () => ManualTestStatus.UNKNOWN,
                () => true,
                undefined,
            );

            expect(instanceMap).toEqual(expectedResult);
        });

        it('should use instanceGroupingConfiguration to generate instance grouping data', () => {
            const propertyBag = { property: 'value' };
            const selectorMap: DictionaryStringTo<HtmlElementAxeResults> = {
                [selectorStub]: {
                    ruleResults: {
                        rule1: {
                            html: htmlStub,
                            id: 'id1',
                            status: false,
                            any: [
                                {
                                    id: 'rule1',
                                    data: propertyBag,
                                },
                            ],
                        } as DecoratedAxeNodeResult,
                    },
                    target: [selectorStub],
                },
            };

            const partialResult = {
                html: htmlStub,
                target: [selectorStub],
                propertyBag: propertyBag,
            };

            const getKeyMock = Mock.ofType<(instance: GeneratedAssessmentInstance) => string>();
            const getTitleMock = Mock.ofType<(instance: GeneratedAssessmentInstance) => string>();
            const groupKey = 'groupKey';
            const resultMatcher = It.isObjectWith<GeneratedAssessmentInstance>(partialResult);
            getKeyMock.setup(gk => gk(resultMatcher)).returns(() => groupKey);

            setupGenerateInstanceIdentifierMock(
                { target: [selectorStub], html: htmlStub },
                identifierStub,
            );
            const instanceMap = testSubject.generateAssessmentInstancesMap(
                {},
                selectorMap,
                testStep,
                generateInstanceIdentifierMock.object,
                () => ManualTestStatus.UNKNOWN,
                () => false,
                {
                    getGroupKey: getKeyMock.object,
                    getGroupTitle: getTitleMock.object,
                },
            );

            expect(instanceMap[identifierStub].groupBy).toBeDefined();
            expect(instanceMap[identifierStub].groupBy).toEqual(groupKey);
        });
    });

    describe('getInstanceGroups', () => {
        const instancesMap = {
            instance1: {
                groupBy: 'group1',
            } as GeneratedAssessmentInstance,
            instance2: {
                groupBy: 'group1',
            } as GeneratedAssessmentInstance,
            instance3: {
                groupBy: 'group2',
            } as GeneratedAssessmentInstance,
        } as AssessmentInstancesMap;
        let getGroupTitleMock: IMock<(instance: GeneratedAssessmentInstance) => string>;
        let instanceGroupingConfiguration: InstanceGroupingConfiguration;

        beforeEach(() => {
            getGroupTitleMock = Mock.ofInstance(() => null);
            instanceGroupingConfiguration = {
                getGroupTitle: getGroupTitleMock.object,
            } as InstanceGroupingConfiguration;
        });

        afterEach(() => {
            getGroupTitleMock.verifyAll();
        });

        it('returns existing groups it grouping config is undefined', () => {
            const existingGroups = {
                group1: {
                    title: 'group1',
                    isExpanded: true,
                },
            };

            const result = testSubject.getInstanceGroups(instancesMap, undefined, existingGroups);

            expect(result).toEqual(existingGroups);
        });

        it('creates new grouping data', () => {
            getGroupTitleMock
                .setup(ggt => ggt(It.isAny()))
                .returns(instance => instance.groupBy)
                .verifiable(Times.exactly(2));

            const expectedGroups = {
                group1: {
                    title: 'group1',
                    isExpanded: true,
                },
                group2: {
                    title: 'group2',
                    isExpanded: true,
                },
            };

            const actualGroups = testSubject.getInstanceGroups(
                instancesMap,
                instanceGroupingConfiguration,
            );

            expect(actualGroups).toEqual(expectedGroups);
        });

        it('does not overwrite existing grouping data', () => {
            getGroupTitleMock
                .setup(ggt => ggt(It.isAny()))
                .returns(instance => instance.groupBy)
                .verifiable(Times.once());

            const existingGroups = {
                group1: {
                    title: 'title',
                    isExpanded: false,
                },
            };

            const expectedGroups = {
                group2: {
                    title: 'group2',
                    isExpanded: true,
                },
                ...existingGroups,
            };

            const actualGroups = testSubject.getInstanceGroups(
                instancesMap,
                instanceGroupingConfiguration,
                existingGroups,
            );

            expect(actualGroups).toEqual(expectedGroups);
        });
    });

    test('generateAssessmentInstancesMapForEvents: previouslyGeneratedInstances is null', () => {
        const stepName = 'random step name';
        const previouslyGeneratedInstances = null;
        const eventStub: TabStopEvent = {
            target: [selectorStub],
            html: htmlStub,
            timestamp: 99,
        };

        const expectedGeneratedInstance: AssessmentInstancesMap = {
            [identifierStub]: {
                target: eventStub.target,
                html: eventStub.html,
                testStepResults: {
                    [stepName]: expectedGenericTestStepResult,
                },
                propertyBag: {
                    timestamp: 99,
                },
                selector: selectorStub,
            },
        };

        setupGenerateInstanceIdentifierMock(eventStub, identifierStub);
        const actual = testSubject.generateAssessmentInstancesMapForEvents(
            previouslyGeneratedInstances,
            [eventStub],
            stepName,
            generateInstanceIdentifierMock.object,
        );

        expect(actual).toEqual(expectedGeneratedInstance);
    });

    test("generateAssessmentInstancesMapForEvents: previouslyGeneratedInstances exists but doesn't match event", () => {
        const stepName = 'random step name';

        const eventStub: TabStopEvent = {
            target: [selectorStub],
            html: htmlStub,
            timestamp: 99,
        };

        const previouslyGeneratedInstances = {
            notARealInstance: null,
        };

        const expectedGeneratedInstance: AssessmentInstancesMap = {
            [identifierStub]: {
                target: eventStub.target,
                html: eventStub.html,
                testStepResults: {
                    [stepName]: expectedGenericTestStepResult,
                },
                propertyBag: {
                    timestamp: eventStub.timestamp,
                },
                selector: selectorStub,
            },
            notARealInstance: null,
        };

        setupGenerateInstanceIdentifierMock(eventStub, identifierStub);
        const actual = testSubject.generateAssessmentInstancesMapForEvents(
            previouslyGeneratedInstances,
            [eventStub],
            stepName,
            generateInstanceIdentifierMock.object,
        );

        expect(actual).toEqual(expectedGeneratedInstance);
    });

    test('generateAssessmentInstancesMapForEvents: previouslyGeneratedInstances exists and selector matches event', () => {
        const oldTimestamp = 99;
        const newTimestamp = 88;
        const eventStub: TabStopEvent = {
            target: [selectorStub],
            html: htmlStub,
            timestamp: newTimestamp,
        };
        const stepNameOne = 'random step name 1';
        const stepNameTwo = 'random step name 2';

        const previouslyGeneratedInstances = {
            [identifierStub]: {
                target: eventStub.target,
                html: eventStub.html,
                testStepResults: {
                    [stepNameOne]: expectedGenericTestStepResult,
                },
                propertyBag: {
                    timestamp: oldTimestamp,
                },
                selector: selectorStub,
            },
        };

        const expectedGeneratedInstance: AssessmentInstancesMap = {
            [identifierStub]: {
                target: eventStub.target,
                html: eventStub.html,
                testStepResults: {
                    [stepNameTwo]: expectedGenericTestStepResult,
                    [stepNameOne]: expectedGenericTestStepResult,
                },
                propertyBag: {
                    timestamp: oldTimestamp,
                },
                selector: selectorStub,
            },
        };

        setupGenerateInstanceIdentifierMock(eventStub, identifierStub);
        const actual = testSubject.generateAssessmentInstancesMapForEvents(
            previouslyGeneratedInstances,
            [eventStub],
            stepNameTwo,
            generateInstanceIdentifierMock.object,
        );

        expect(actual).toEqual(expectedGeneratedInstance);
    });

    test('generateFailureInstance with description', () => {
        const description = 'description';
        const path = null;
        const snippet = null;
        const expectedResult = {
            id: uid,
            html: snippet,
            description: description,
            selector: path,
        };

        expect(testSubject.generateFailureInstance(description, path, snippet)).toEqual(
            expectedResult,
        );
    });

    test('generateFailureInstance with description and path', () => {
        const description = 'description';
        const path = 'path';
        const snippet = 'snippet';
        const expectedResult = {
            id: uid,
            description: description,
            selector: path,
            html: snippet,
        };

        expect(testSubject.generateFailureInstance(description, path, snippet)).toEqual(
            expectedResult,
        );
    });

    function setupGenerateInstanceIdentifierMock(
        instance: UniquelyIdentifiableInstances,
        identifier: string,
    ): void {
        generateInstanceIdentifierMock
            .setup(giim => giim(It.isValue(instance)))
            .returns(() => identifier);
    }
});
