// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { FeatureFlagStoreData } from './../types/store-data/feature-flag-store-data.d';
import { IInstallationData } from  './installation-data';

export interface ILocalStorageData {
    url?: string;
    featureFlags?: FeatureFlagStoreData;
    launchPanelSetting?: LaunchPanelType;
    installationData?: IInstallationData;
}
