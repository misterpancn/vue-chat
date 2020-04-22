import { autoUpdater } from 'electron-updater'
import config from '../../store/config/config'
import { ipcMain } from 'electron'
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */
export default function handleUpdate (mainWindow) {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = false
  autoUpdater.setFeedURL(config.downloadAddress);
  autoUpdater.on('error', (err) => {
    if (mainWindow) mainWindow.webContents.send('update-error', String(err))
  })
  autoUpdater.on('update-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-available', info)
  })
  autoUpdater.on('update-not-available', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-not-available', info)
  })
  autoUpdater.on('download-progress', (progress) => {
    if (mainWindow) mainWindow.webContents.send('update-download-progress', progress)
  })
  autoUpdater.on('update-downloaded', (info) => {
    if (mainWindow) mainWindow.webContents.send('update-downloaded', info)
  })
  ipcMain.on('check-for-update', () => {
    autoUpdater.checkForUpdates()
  })
  ipcMain.on('update-download', () => {
    autoUpdater.downloadUpdate()
  })
  ipcMain.on('update-install', () => {
    autoUpdater.quitAndInstall()
  })
}
