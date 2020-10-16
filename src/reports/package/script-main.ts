// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { reporterFactory } from 'reports/package/reporter-factory';

const summaryResults = {
    serviceName: 'service name',
    axeVersion: 'axe version',
    userAgent: 'user agent',
    scanDetails: {
        baseUrl: 'https://url.com',
        basePageTitle: 'page title',
        scanStart: new Date(),
        scanComplete: new Date(),
        durationSeconds: 3, 
    },
    results: {
        passed: [],
        failed: [],
        unscannable: [],
    },
}

const reportBody = reporterFactory().fromSummaryResults(summaryResults).asElement();

const domContainer = document.querySelector('#report-body');
ReactDOM.render(reportBody, domContainer);
