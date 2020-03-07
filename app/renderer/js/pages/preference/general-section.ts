import { ipcRenderer, remote, OpenDialogOptions } from 'electron';

import path from 'path';
import fs from 'fs-extra';

const { app, dialog } = remote;
const currentBrowserWindow = remote.getCurrentWindow();

import BaseSection from './base-section';
import * as ConfigUtil from '../../utils/config-util';
import * as EnterpriseUtil from '../../utils/enterprise-util';
import * as t from '../../utils/translation-util';
import supportedLocales from '../../../../translations/supported-locales.json';

interface GeneralSectionProps {
	$root: Element;
}

export default class GeneralSection extends BaseSection {
	props: GeneralSectionProps;
	constructor(props: GeneralSectionProps) {
		super();
		this.props = props;
	}

	template(): string {
		return `
            <div class="settings-pane">
                <div class="title">${t.__('Appearance')}</div>
                <div id="appearance-option-settings" class="settings-card">
					<div class="setting-row" id="tray-option">
						<div class="setting-description">${t.__('Show app icon in system tray')}</div>
						<div class="setting-control"></div>
					</div>
					<div class="setting-row" id="menubar-option" style= "display:${process.platform === 'darwin' ? 'none' : ''}">
						<div class="setting-description">${t.__('Auto hide menu bar (Press Alt key to display)')}</div>
						<div class="setting-control"></div>
					</div>
					<div class="setting-row" id="sidebar-option">
						<div class="setting-description">${t.__('Show sidebar')} (<span class="code">${process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S'}</span>)</div>
						<div class="setting-control"></div>
					</div>
					<div class="setting-row" id="badge-option">
						<div class="setting-description">${t.__('Show app unread badge')}</div>
						<div class="setting-control"></div>
					</div>
					<div class="setting-row" id="dock-bounce-option" style= "display:${process.platform === 'darwin' ? '' : 'none'}">
						<div class="setting-description">${t.__('Bounce dock on new private message')}</div>
						<div class="setting-control"></div>
					</div>
					<div class="setting-row" id="flash-taskbar-option" style= "display:${process.platform === 'win32' ? '' : 'none'}">
						<div class="setting-description">${t.__('Flash taskbar on new message')}</div>
						<div class="setting-control"></div>
					</div>
				</div>
				<div class="title">${t.__('Desktop Notifications')}</div>
				<div class="settings-card">
					<div class="setting-row" id="show-notification-option">
						<div class="setting-description">${t.__('Show desktop notifications')}</div>
						<div class="setting-control"></div>
					</div>
					<div class="setting-row" id="silent-option">
						<div class="setting-description">${t.__('Mute all sounds from Zulip')}</div>
						<div class="setting-control"></div>
					</div>
				</div>
				<div class="title">${t.__('App Updates')}</div>
				<div class="settings-card">
				<div class="setting-row" id="autoupdate-option">
						<div class="setting-description">${t.__('Enable auto updates')}</div>
						<div class="setting-control"></div>
					</div>
					<div class="setting-row" id="betaupdate-option">
						<div class="setting-description">${t.__('Get beta updates')}</div>
						<div class="setting-control"></div>
					</div>
				</div>
				<div class="title">${t.__('Functionality')}</div>
                <div class="settings-card">
					<div class="setting-row" id="startAtLogin-option">
						<div class="setting-description">${t.__('Start app at login')}</div>
						<div class="setting-control"></div>
					</div>
					<div class="setting-row" id="start-minimize-option">
						<div class="setting-description">${t.__('Always start minimized')}</div>
						<div class="setting-control"></div>
					</div>
					<div class="setting-row" id="quitOnClose-option">
						<div class="setting-description">${t.__('Quit when the window is closed')}</div>
						<div class="setting-control"></div>
					</div>
					<div class="setting-row" id="enable-spellchecker-option">
						<div class="setting-description">${t.__('Enable spellchecker (requires restart)')}</div>
						<div class="setting-control"></div>
					</div>
				</div>
				<div class="title">${t.__('Advanced')}</div>
				<div class="settings-card">

					<div class="setting-row" id="enable-error-reporting">
						<div class="setting-description">${t.__('Enable error reporting (requires restart)')}</div>
						<div class="setting-control"></div>
					</div>
					
					<div class="setting-row" id="app-language">
						<div class="setting-description">${t.__('App language (requires restart)')}</div>
						<div  id="lang-div" class="lang-div"></div>
					</div>

					<div class="setting-row" id="add-custom-css">
						<div class="setting-description">
							${t.__('Add custom CSS')}
						</div>
						<button class="custom-css-button green">${t.__('Upload')}</button>
					</div>
					<div class="setting-row" id="remove-custom-css">
						<div class="setting-description">
							<div class="selected-css-path" id="custom-css-path">${ConfigUtil.getConfigItem('customCSS')}</div>
						</div>
						<div class="action red" id="css-delete-action">
							<i class="material-icons">indeterminate_check_box</i>
							<span>${t.__('Delete')}</span>
						</div>
					</div>
					<div class="setting-row" id="download-folder">
						<div class="setting-description">
							${t.__('Default download location')}
						</div>
						<button class="download-folder-button green">${t.__('Change')}</button>
					</div>
					<div class="setting-row">
						<div class="setting-description">
							<div class="download-folder-path">${ConfigUtil.getConfigItem('downloadsPath', `${app.getPath('downloads')}`)}</div>
						</div>
					</div>
					<div class="setting-row" id="prompt-download">
						<div class="setting-description">${t.__('Ask where to save files before downloading')}</div>
						<div class="setting-control"></div>
					</div>
				</div>
				<div class="title">${t.__('Reset Application Data')}</div>
                <div class="settings-card">
					<div class="setting-row" id="resetdata-option">
						<div class="setting-description">${t.__('This will delete all application data including all added accounts and preferences')}
						</div>
						<button class="reset-data-button red w-150">${t.__('Reset App Data')}</button>
					</div>
				</div>
			</div>
		`;
	}

	init(): void {
		this.props.$root.innerHTML = this.template();
		this.updateTrayOption();
		this.updateBadgeOption();
		this.updateSilentOption();
		this.autoUpdateOption();
		this.betaUpdateOption();
		this.updateSidebarOption();
		this.updateStartAtLoginOption();
		this.updateResetDataOption();
		this.showDesktopNotification();
		this.enableSpellchecker();
		this.minimizeOnStart();
		this.addCustomCSS();
		this.showCustomCSSPath();
		this.removeCustomCSS();
		this.downloadFolder();
		this.updateQuitOnCloseOption();
		this.updatePromptDownloadOption();
		this.enableErrorReporting();
		this.setLocale();

		// Platform specific settings

		// Flashing taskbar on Windows
		if (process.platform === 'win32') {
			this.updateFlashTaskbar();
		}
		// Dock bounce on macOS
		if (process.platform === 'darwin') {
			this.updateDockBouncing();
		}

		// Auto hide menubar on Windows and Linux
		if (process.platform !== 'darwin') {
			this.updateMenubarOption();
		}
	}

	updateTrayOption(): void {
		this.generateSettingOption({
			$element: document.querySelector('#tray-option .setting-control'),
			value: ConfigUtil.getConfigItem('trayIcon', true),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('trayIcon');
				ConfigUtil.setConfigItem('trayIcon', newValue);
				ipcRenderer.send('forward-message', 'toggletray');
				this.updateTrayOption();
			}
		});
	}

	updateMenubarOption(): void {
		this.generateSettingOption({
			$element: document.querySelector('#menubar-option .setting-control'),
			value: ConfigUtil.getConfigItem('autoHideMenubar', false),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('autoHideMenubar');
				ConfigUtil.setConfigItem('autoHideMenubar', newValue);
				ipcRenderer.send('toggle-menubar', newValue);
				this.updateMenubarOption();
			}
		});
	}

	updateBadgeOption(): void {
		this.generateSettingOption({
			$element: document.querySelector('#badge-option .setting-control'),
			value: ConfigUtil.getConfigItem('badgeOption', true),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('badgeOption');
				ConfigUtil.setConfigItem('badgeOption', newValue);
				ipcRenderer.send('toggle-badge-option', newValue);
				this.updateBadgeOption();
			}
		});
	}

	updateDockBouncing(): void {
		this.generateSettingOption({
			$element: document.querySelector('#dock-bounce-option .setting-control'),
			value: ConfigUtil.getConfigItem('dockBouncing', true),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('dockBouncing');
				ConfigUtil.setConfigItem('dockBouncing', newValue);
				this.updateDockBouncing();
			}
		});
	}

	updateFlashTaskbar(): void {
		this.generateSettingOption({
			$element: document.querySelector('#flash-taskbar-option .setting-control'),
			value: ConfigUtil.getConfigItem('flashTaskbarOnMessage', true),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('flashTaskbarOnMessage');
				ConfigUtil.setConfigItem('flashTaskbarOnMessage', newValue);
				this.updateFlashTaskbar();
			}
		});
	}

	autoUpdateOption(): void {
		this.generateSettingOption({
			$element: document.querySelector('#autoupdate-option .setting-control'),
			disabled: EnterpriseUtil.configItemExists('autoUpdate'),
			value: ConfigUtil.getConfigItem('autoUpdate', true),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('autoUpdate');
				ConfigUtil.setConfigItem('autoUpdate', newValue);
				if (!newValue) {
					ConfigUtil.setConfigItem('betaUpdate', false);
					this.betaUpdateOption();
				}
				this.autoUpdateOption();
			}
		});
	}

	betaUpdateOption(): void {
		this.generateSettingOption({
			$element: document.querySelector('#betaupdate-option .setting-control'),
			value: ConfigUtil.getConfigItem('betaUpdate', false),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('betaUpdate');
				if (ConfigUtil.getConfigItem('autoUpdate')) {
					ConfigUtil.setConfigItem('betaUpdate', newValue);
					this.betaUpdateOption();
				}
			}
		});
	}

	updateSilentOption(): void {
		this.generateSettingOption({
			$element: document.querySelector('#silent-option .setting-control'),
			value: ConfigUtil.getConfigItem('silent', false),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('silent', true);
				ConfigUtil.setConfigItem('silent', newValue);
				this.updateSilentOption();
				currentBrowserWindow.webContents.send('toggle-silent', newValue);
			}
		});
	}

	showDesktopNotification(): void {
		this.generateSettingOption({
			$element: document.querySelector('#show-notification-option .setting-control'),
			value: ConfigUtil.getConfigItem('showNotification', true),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('showNotification', true);
				ConfigUtil.setConfigItem('showNotification', newValue);
				this.showDesktopNotification();
			}
		});
	}

	updateSidebarOption(): void {
		this.generateSettingOption({
			$element: document.querySelector('#sidebar-option .setting-control'),
			value: ConfigUtil.getConfigItem('showSidebar', true),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('showSidebar');
				ConfigUtil.setConfigItem('showSidebar', newValue);
				ipcRenderer.send('forward-message', 'toggle-sidebar', newValue);
				this.updateSidebarOption();
			}
		});
	}

	updateStartAtLoginOption(): void {
		this.generateSettingOption({
			$element: document.querySelector('#startAtLogin-option .setting-control'),
			value: ConfigUtil.getConfigItem('startAtLogin', false),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('startAtLogin');
				ConfigUtil.setConfigItem('startAtLogin', newValue);
				ipcRenderer.send('toggleAutoLauncher', newValue);
				this.updateStartAtLoginOption();
			}
		});
	}

	updateQuitOnCloseOption(): void {
		this.generateSettingOption({
			$element: document.querySelector('#quitOnClose-option .setting-control'),
			value: ConfigUtil.getConfigItem('quitOnClose', false),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('quitOnClose');
				ConfigUtil.setConfigItem('quitOnClose', newValue);
				this.updateQuitOnCloseOption();
			}
		});
	}

	enableSpellchecker(): void {
		this.generateSettingOption({
			$element: document.querySelector('#enable-spellchecker-option .setting-control'),
			value: ConfigUtil.getConfigItem('enableSpellchecker', true),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('enableSpellchecker');
				ConfigUtil.setConfigItem('enableSpellchecker', newValue);
				this.enableSpellchecker();
			}
		});
	}

	enableErrorReporting(): void {
		this.generateSettingOption({
			$element: document.querySelector('#enable-error-reporting .setting-control'),
			value: ConfigUtil.getConfigItem('errorReporting', true),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('errorReporting');
				ConfigUtil.setConfigItem('errorReporting', newValue);
				this.enableErrorReporting();
			}
		});
	}

	async clearAppDataDialog(): Promise<void> {
		const clearAppDataMessage = 'By clicking proceed you will be removing all added accounts and preferences from Zulip. When the application restarts, it will be as if you are starting Zulip for the first time.';
		const getAppPath = path.join(app.getPath('appData'), app.name);

		const { response } = await dialog.showMessageBox({
			type: 'warning',
			buttons: ['YES', 'NO'],
			defaultId: 0,
			message: 'Are you sure',
			detail: clearAppDataMessage
		});
		if (response === 0) {
			fs.remove(getAppPath);
			setTimeout(() => ipcRenderer.send('forward-message', 'hard-reload'), 1000);
		}
	}

	async customCssDialog(): Promise<void> {
		const showDialogOptions: OpenDialogOptions = {
			title: 'Select file',
			properties: ['openFile'],
			filters: [{ name: 'CSS file', extensions: ['css'] }]
		};

		const { filePaths, canceled } = await dialog.showOpenDialog(showDialogOptions);
		if (!canceled) {
			ConfigUtil.setConfigItem('customCSS', filePaths[0]);
			ipcRenderer.send('forward-message', 'hard-reload');
		}
	}

	updateResetDataOption(): void {
		const resetDataButton = document.querySelector('#resetdata-option .reset-data-button');
		resetDataButton.addEventListener('click', () => {
			this.clearAppDataDialog();
		});
	}

	setLocale(): void {
		const langDiv: HTMLSelectElement = document.querySelector('.lang-div');
		// This path is for the JSON file that stores key: value pairs for supported locales
		const langList = this.generateSelectTemplate(supportedLocales, 'lang-menu');
		langDiv.innerHTML += langList;
		// langMenu is the select-option dropdown menu formed after executing the previous command
		const langMenu: HTMLSelectElement = document.querySelector('.lang-menu');

		// The next three lines set the selected language visible on the dropdown button
		let language = ConfigUtil.getConfigItem('appLanguage');
		language = language && langMenu.options.namedItem(language) ? language : 'en-US';
		langMenu.options.namedItem(language).selected = true;

		langMenu.addEventListener('change', (event: Event) => {
			ConfigUtil.setConfigItem('appLanguage', (event.target as HTMLSelectElement).value);
		});
	}

	minimizeOnStart(): void {
		this.generateSettingOption({
			$element: document.querySelector('#start-minimize-option .setting-control'),
			value: ConfigUtil.getConfigItem('startMinimized', false),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('startMinimized');
				ConfigUtil.setConfigItem('startMinimized', newValue);
				this.minimizeOnStart();
			}
		});
	}

	addCustomCSS(): void {
		const customCSSButton = document.querySelector('#add-custom-css .custom-css-button');
		customCSSButton.addEventListener('click', () => {
			this.customCssDialog();
		});
	}

	showCustomCSSPath(): void {
		if (!ConfigUtil.getConfigItem('customCSS')) {
			const cssPATH: HTMLElement = document.querySelector('#remove-custom-css');
			cssPATH.style.display = 'none';
		}
	}

	removeCustomCSS(): void {
		const removeCSSButton = document.querySelector('#css-delete-action');
		removeCSSButton.addEventListener('click', () => {
			ConfigUtil.setConfigItem('customCSS', '');
			ipcRenderer.send('forward-message', 'hard-reload');
		});
	}

	async downloadFolderDialog(): Promise<void> {
		const showDialogOptions: OpenDialogOptions = {
			title: 'Select Download Location',
			properties: ['openDirectory']
		};

		const { filePaths, canceled } = await dialog.showOpenDialog(showDialogOptions);
		if (!canceled) {
			ConfigUtil.setConfigItem('downloadsPath', filePaths[0]);
			const downloadFolderPath: HTMLElement = document.querySelector('.download-folder-path');
			downloadFolderPath.textContent = filePaths[0];
		}
	}

	downloadFolder(): void {
		const downloadFolder = document.querySelector('#download-folder .download-folder-button');
		downloadFolder.addEventListener('click', () => {
			this.downloadFolderDialog();
		});
	}

	updatePromptDownloadOption(): void {
		this.generateSettingOption({
			$element: document.querySelector('#prompt-download .setting-control'),
			value: ConfigUtil.getConfigItem('promptDownload', false),
			clickHandler: () => {
				const newValue = !ConfigUtil.getConfigItem('promptDownload');
				ConfigUtil.setConfigItem('promptDownload', newValue);
				this.updatePromptDownloadOption();
			}
		});
	}
}
