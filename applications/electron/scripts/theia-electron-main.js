const path = require('path');
const os = require('os');
const fs = require('fs')
const { app } = require('electron');

const productName = 'eos-thesis';
const portable = fs.existsSync(path.resolve(process.execPath, `../data/.${productName}.portable`))
if (portable) {
    const userDataPath = path.resolve(app.getAppPath(), '../../', 'data/userData');
    const pluginsPath = path.resolve(app.getAppPath(), '../../', 'data/plugins');

    [userDataPath, pluginsPath].forEach(p => fs.existsSync(p) ? fs.mkdirSync(p, {recursive : true}) : null)

    app.setPath('userData', userDataPath);
}

// Update to override the supported VS Code API version.
// process.env.VSCODE_API_VERSION = '1.50.0'

// Use a set of builtin plugins in our application.
process.env.THEIA_DEFAULT_PLUGINS = `local-dir:${path.resolve(__dirname, '../', 'plugins')}`;

// Lookup inside the user's home folder for more plugins, and accept user-defined paths.
process.env.THEIA_PLUGINS = [
    process.env.THEIA_PLUGINS, (portable ? `local-dir:${pluginsPath}` : `local-dir:${path.resolve(os.homedir(), `.${productName}`, 'plugins')}`),
].filter(Boolean).join(',');

// Handover to the auto-generated electron application handler.
require('../lib/backend/electron-main.js');
