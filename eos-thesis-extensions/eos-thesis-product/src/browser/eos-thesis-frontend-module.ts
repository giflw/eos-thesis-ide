/********************************************************************************
 * Copyright (C) 2020 TypeFox, EclipseSource and others.
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

import '../../src/browser/style/index.css';

import { FrontendApplicationContribution, WidgetFactory, bindViewContribution, PreferenceContribution } from '@theia/core/lib/browser';
import { AboutDialog } from '@theia/core/lib/browser/about-dialog';
import { CommandContribution } from '@theia/core/lib/common/command';
import { ContainerModule } from '@theia/core/shared/inversify';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { MenuContribution } from '@theia/core/lib/common/menu';
import { EosThesisAboutDialog } from './eos-thesis-about-dialog';
import { EosThesisContribution } from './eos-thesis-contribution';
import { EosThesisGettingStartedContribution } from './eos-thesis-getting-started-contribution';
import { EosThesisGettingStartedWidget } from './eos-thesis-getting-started-widget';
import { eosThesisPreferenceSchema } from './eos-thesis-preferences';

export default new ContainerModule((bind, _unbind, isBound, rebind) => {
    bindViewContribution(bind, EosThesisGettingStartedContribution);
    bind(FrontendApplicationContribution).toService(EosThesisGettingStartedContribution);
    bind(EosThesisGettingStartedWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(context => ({
        id: GettingStartedWidget.ID,
        createWidget: () => context.container.get<EosThesisGettingStartedWidget>(EosThesisGettingStartedWidget),
    })).inSingletonScope();
    if (isBound(AboutDialog)) {
        rebind(AboutDialog).to(EosThesisAboutDialog).inSingletonScope();
    } else {
        bind(AboutDialog).to(EosThesisAboutDialog).inSingletonScope();
    }

    bind(EosThesisContribution).toSelf().inSingletonScope();
    [CommandContribution, MenuContribution].forEach(serviceIdentifier =>
        bind(serviceIdentifier).toService(EosThesisContribution)
    );

    bind(PreferenceContribution).toConstantValue({ schema: eosThesisPreferenceSchema });
});
