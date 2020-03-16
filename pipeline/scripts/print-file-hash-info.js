// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// In the build loop it can be helpful to know the
// sha256/512 value of the installer to help debug signing
const hashUtil = require('app-builder-lib/out/util/hash');
const fs = require('fs');

const parentDir = process.argv[2];

const printFileInfo = async => {
    const files = fs.readdirSync(parentDir);
    files.forEach(f => {
        console.log(f);
        console.log(`  sha256 ${await hashUtil.hashFile(f, 'sha256', 'base64')}`);
        console.log(`  sha512 ${await hashUtil.hashFile(f, 'sha512', 'base64')}`);
    });
};

printFileInfo().catch(err => {
    console.error(err);
    process.exit(1);
});
