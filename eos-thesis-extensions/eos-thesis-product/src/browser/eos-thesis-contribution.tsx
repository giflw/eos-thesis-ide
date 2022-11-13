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

import { inject, injectable } from '@theia/core/shared/inversify';
import { CommonMenus } from '@theia/core/lib/browser/common-frontend-contribution';
import { Command, CommandContribution, CommandRegistry } from '@theia/core/lib/common/command';
import { MenuContribution, MenuModelRegistry, MenuPath } from '@theia/core/lib/common/menu';
import { WindowService } from '@theia/core/lib/browser/window/window-service';

export namespace EosThesisMenus {
    export const EOS_THESIS_HELP: MenuPath = [...CommonMenus.HELP, 'eos-thesis'];
}
export namespace EosThesisCommands {
    export const CATEGORY = 'EosThesis';
    export const REPORT_ISSUE: Command = {
        id: 'eos-thesis:report-issue',
        category: CATEGORY,
        label: 'Report Issue'
    };
    export const DOCUMENTATION: Command = {
        id: 'eos-thesis:documentation',
        category: CATEGORY,
        label: 'Documentation'
    };
}

@injectable()
export class EosThesisContribution implements CommandContribution, MenuContribution {

    @inject(WindowService)
    protected readonly windowService: WindowService;

    static REPORT_ISSUE_URL = 'https://github.com/giflw/eos-thesis-ide/issues/new?assignees=&labels=&template=bug_report.md';
    static DOCUMENTATION_URL = 'https://github.com/giflw/eos-thesis-ide#readme';

    registerCommands(commandRegistry: CommandRegistry): void {
        commandRegistry.registerCommand(EosThesisCommands.REPORT_ISSUE, {
            execute: () => this.windowService.openNewWindow(EosThesisContribution.REPORT_ISSUE_URL, { external: true })
        });
        commandRegistry.registerCommand(EosThesisCommands.DOCUMENTATION, {
            execute: () => this.windowService.openNewWindow(EosThesisContribution.DOCUMENTATION_URL, { external: true })
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(EosThesisMenus.EOS_THESIS_HELP, {
            commandId: EosThesisCommands.REPORT_ISSUE.id,
            label: EosThesisCommands.REPORT_ISSUE.label,
            order: '1'
        });
        menus.registerMenuAction(EosThesisMenus.EOS_THESIS_HELP, {
            commandId: EosThesisCommands.DOCUMENTATION.id,
            label: EosThesisCommands.DOCUMENTATION.label,
            order: '2'
        });
    }
}
