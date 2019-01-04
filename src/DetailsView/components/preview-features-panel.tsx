// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { FeatureFlagStoreData } from '../../common/types/store-data/feature-flag-store-data';
import { DetailsViewActionMessageCreator } from '../actions/details-view-action-message-creator';
import { PreviewFeatureFlagsHandler } from '../handlers/preview-feature-flags-handler';
import { GenericPanel } from './generic-panel';
import { PreviewFeaturesContainer } from './preview-features-container';

export interface PreviewFeaturesPanelProps {
    isOpen: boolean;
    actionMessageCreator: DetailsViewActionMessageCreator;
    featureFlagData: FeatureFlagStoreData;
    previewFeatureFlagsHandler: PreviewFeatureFlagsHandler;
}

export class PreviewFeaturesPanel extends React.Component<PreviewFeaturesPanelProps> {
    public render(): JSX.Element {
        return (
            <GenericPanel
                title = "Preview features"
                isOpen={this.props.isOpen}
                className="preview-features-panel"
                onDismiss={this.props.actionMessageCreator.closePreviewFeaturesPanel}
                closeButtonAriaLabel="Close preview features panel"
                hasCloseButton={true}
                >
                    <PreviewFeaturesContainer
                        featureFlagData={this.props.featureFlagData}
                        actionMessageCreator={this.props.actionMessageCreator}
                        previewFeatureFlagsHandler={this.props.previewFeatureFlagsHandler}
                    />
            </GenericPanel>
        );
    }
}
