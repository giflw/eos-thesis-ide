/********************************************************************************
 * Copyright (C) 2021 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { injectable } from '@theia/core/shared/inversify';
import { FileUri } from '@theia/core/lib/node/file-uri';
import { EnvVariablesServerImpl } from '@theia/core/lib/node/env-variables';

const productName = 'eos-thesis';
const portableDirectory = path.resolve(process.execPath, '../data/server');
const portable = fs.existsSync(path.resolve(process.execPath, `../data/.${productName}.portable`))

@injectable()
export class TheiaBlueprintEnvVariableServer extends EnvVariablesServerImpl {

    protected readonly _configDirUri: string = FileUri.create(portable ? portableDirectory : path.join(os.homedir(), `.${productName}`)).toString(true);

    async getConfigDirUri(): Promise<string> {
        return this._configDirUri;
    }

}

