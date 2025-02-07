/* eslint-disable default-param-last */
/* eslint-disable no-use-before-define */
/* eslint-disable global-require */
import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  globalShortcut,
  shell,
  protocol,
  crashReporter,
  nativeTheme,
  Tray,
  Menu,
  nativeImage,
} from 'electron';
import path from 'path';
import os from 'os';
import * as dotenv from 'dotenv';
// import * as Sentry from '@sentry/electron';

import log from './log';
import {
  getSongsData,
  getUserData,
  setUserData as saveUserData,
  resetAppCache,
  getListeningData,
  getBlacklistData,
} from './filesystem';
import { resolveHtmlPath } from './utils/util';
import updateSongId3Tags from './updateSongId3Tags';
import { version } from '../../package.json';
import search from './search';
import {
  searchSongMetadataResultsInInternet,
  fetchSongMetadataFromInternet,
} from './utils/fetchSongMetadataFromInternet';
import deleteSongsFromSystem from './core/deleteSongsFromSystem';
import removeMusicFolder from './core/removeMusicFolder';
import restoreBlacklistedSongs from './core/restoreBlacklistedSongs';
import addWatchersToFolders from './fs/addWatchersToFolders';
import addMusicFolder from './core/addMusicFolder';
import getArtistInfoFromNet from './core/getArtistInfoFromNet';
import getSongLyrics from './core/getSongLyrics';
import sendAudioDataFromPath from './core/sendAudioDataFromPath';
import getAssetPath from './utils/getAssetPath';
import addWatchersToParentFolders from './fs/addWatchersToParentFolders';
import manageTaskbarPlaybackButtonControls from './core/manageTaskbarPlaybackButtonControls';
import checkForStartUpSongs from './core/checkForStartUpSongs';
import checkForNewSongs from './core/checkForNewSongs';
import sendAudioData from './core/sendAudioData';
import toggleLikeSongs from './core/toggleLikeSongs';
import sendSongID3Tags from './core/sendSongId3Tags';
import removeSongFromPlaylist from './core/removeSongFromPlaylist';
import addSongsToPlaylist from './core/addSongsToPlaylist';
import removePlaylists from './core/removePlaylists';
import addNewPlaylist from './core/addNewPlaylist';
import getAllSongs from './core/getAllSongs';
import toggleLikeArtists from './core/toggleLikeArtists';
import fetchSongInfoFromLastFM from './core/fetchSongInfoFromLastFM';
import clearSongHistory from './core/clearSongHistory';
import clearSearchHistoryResults from './core/clearSeachHistoryResults';
import getSongInfo from './core/getSongInfo';
import updateSongListeningData from './core/updateSongListeningData';
import getGenresInfo from './core/getGenresInfo';
import sendPlaylistData from './core/sendPlaylistData';
import fetchAlbumData from './core/fetchAlbumData';
import fetchArtistData from './core/fetchArtistData';
import changeAppTheme from './core/changeAppTheme';
import saveLyricsToSong from './saveLyricsToSong';
import getMusicFolderData from './core/getMusicFolderData';
import {
  closeAllAbortControllers,
  saveAbortController,
} from './fs/controlAbortControllers';
import blacklistSongs from './core/blacklistSongs';
import resetAppData from './resetAppData';
import { clearTempArtworkFolder } from './other/artworks';
import blacklistFolders from './core/blacklistFolders';
import restoreBlacklistedFolders from './core/restoreBlacklistedFolder';
import toggleBlacklistFolders from './core/toggleBlacklistFolders';

// / / / / / / / CONSTANTS / / / / / / / / /
const DEFAULT_APP_PROTOCOL = 'nora';

const MAIN_WINDOW_MIN_SIZE_X = 700;
const MAIN_WINDOW_MIN_SIZE_Y = 500;
const MAIN_WINDOW_MAX_SIZE_X = 10000;
const MAIN_WINDOW_MAX_SIZE_Y = 5000;
const MAIN_WINDOW_ASPECT_RATIO = 0;

const MAIN_WINDOW_DEFAULT_SIZE_X = 1280;
const MAIN_WINDOW_DEFAULT_SIZE_Y = 720;

const MINI_PLAYER_MIN_SIZE_X = 270;
const MINI_PLAYER_MIN_SIZE_Y = 200;
const MINI_PLAYER_MAX_SIZE_X = 510;
const MINI_PLAYER_MAX_SIZE_Y = 300;
const MINI_PLAYER_ASPECT_RATIO = 17 / 10;
const abortController = new AbortController();

// / / / / / / VARIABLES / / / / / / /
let mainWindow: BrowserWindow;
let tray: Tray;
let isMiniPlayer = false;
let isConnectedToInternet = false;

// / / / / / / INITIALIZATION / / / / / / /

export const IS_DEVELOPMENT =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const appIcon = nativeImage.createFromPath(
  getAssetPath('images', 'logo_light_mode.png')
);

dotenv.config({ debug: IS_DEVELOPMENT });
saveAbortController('main', abortController);

// Sentry.init({
//   dsn: 'https://c3f3263c53334e51849caaa8a4d677e2@o1402111.ingest.sentry.io/4504757172764672',
// });
// ? / / / / / / / / / / / / / / / / / / / / / / /
if (IS_DEVELOPMENT) require('electron-debug')();

const APP_INFO = {
  environment: IS_DEVELOPMENT ? 'DEV' : 'PRODUCTION',
  appVersion: `v${version}`,
  systemInfo: {
    cpu: os.cpus()[0].model,
    os: os.release(),
    architechture: os.arch(),
    platform: os.platform(),
    totalMemory: `${os.totalmem()} (~${Math.floor(
      os.totalmem() / (1024 * 1024 * 1024)
    )} GB)`,
  },
};

log(`STARTING UP NORA`, APP_INFO, 'WARN');

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch((err: unknown) =>
      log(
        `====== ERROR OCCURRED WHEN TRYING TO INSTALL EXTENSIONS TO DEVTOOLS ======\nERROR : ${err}`
      )
    );
};

const createWindow = async () => {
  if (IS_DEVELOPMENT) installExtensions();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 700,
    minHeight: 500,
    minWidth: 700,
    title: 'Nora',
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    visualEffectState: 'followWindow',
    roundedCorners: true,
    frame: false,
    backgroundColor: '#212226',
    icon: appIcon,
    titleBarStyle: 'hidden',
    show: false,
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));
  mainWindow.once('ready-to-show', () => {
    if (app.hasSingleInstanceLock()) {
      log('Started checking for new songs during the application start.');
      checkForNewSongs();
      addWatchersToFolders();
      addWatchersToParentFolders();
    }
  });
  mainWindow.webContents.setWindowOpenHandler((edata: { url: string }) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

app
  .whenReady()
  .then(() => {
    // Behaviour on second instance for parent process
    const hasSingleInstanceLock = app.requestSingleInstanceLock();
    if (!hasSingleInstanceLock) {
      log(
        'Another app instance is currently active. Quitting this instance.',
        undefined,
        'WARN'
      );
      return app.quit();
    }
    if (BrowserWindow.getAllWindows().length === 0) createWindow();

    app.on('second-instance', handleSecondInstances);

    if (!app.isDefaultProtocolClient(DEFAULT_APP_PROTOCOL)) {
      log(
        'No default protocol registered. Starting the default protocol registration process.'
      );
      const res = app.setAsDefaultProtocolClient(DEFAULT_APP_PROTOCOL);
      if (res) log('Default protocol registered successfully.');
      else log('Default protocol registration failed.');
    }

    protocol.registerFileProtocol('nora', registerFileProtocol);

    tray = new Tray(appIcon);
    const trayContextMenu = Menu.buildFromTemplate([
      {
        label: 'Show/Hide Nora',
        type: 'normal',
        click: () =>
          mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show(),
        role: 'hide',
      },
      { type: 'separator' },
      { label: 'Exit', type: 'normal', click: () => app.quit(), role: 'close' },
    ]);

    tray.setContextMenu(trayContextMenu);
    tray.setToolTip('Nora');

    tray.addListener('click', () => tray.popUpContextMenu(trayContextMenu));
    tray.addListener('double-click', () => {
      if (mainWindow.isVisible()) mainWindow.hide();
      else mainWindow.show();
    });

    // powerMonitor.addListener('shutdown', (e) => e.preventDefault());

    mainWindow.webContents.once('did-finish-load', manageWindowFinishLoad);

    app.on('before-quit', handleBeforeQuit);

    mainWindow.on('moved', manageAppMoveEvent);

    mainWindow.on('resized', () => {
      manageAppMoveEvent();
      manageAppResizeEvent();
    });

    app.setPath('crashDumps', path.join(app.getPath('userData'), 'crashDumps'));

    app.on('will-finish-launching', () => {
      crashReporter.start({ uploadToServer: false });
      log(
        `APP STARTUP COMMAND LINE ARGUMENTS\nARGS : [ ${process.argv.join(
          ', '
        )} ]`
      );
    });

    mainWindow.webContents.addListener('zoom-changed', (_, dir) =>
      log(`Renderer zoomed ${dir}. ${mainWindow.webContents.getZoomLevel()}`)
    );

    // ? / / / / / / / / /  IPC RENDERER EVENTS  / / / / / / / / / / / /
    if (mainWindow) {
      ipcMain.on('app/close', () => app.quit());

      ipcMain.on('app/minimize', () => mainWindow.minimize());

      ipcMain.on('app/toggleMaximize', () =>
        mainWindow.isMaximized()
          ? mainWindow.unmaximize()
          : mainWindow.maximize()
      );

      ipcMain.on('app/hide', () => mainWindow.hide());

      ipcMain.on('app/show', () => mainWindow.show());

      ipcMain.on('app/changeAppTheme', (_, theme?: AppTheme) =>
        changeAppTheme(theme)
      );

      ipcMain.on(
        'app/player/songPlaybackStateChange',
        (_: unknown, isPlaying: boolean) => {
          console.log(`Player playback status : ${isPlaying}`);
          manageTaskbarPlaybackButtonControls(mainWindow, true, isPlaying);
        }
      );

      ipcMain.handle('app/checkForStartUpSongs', () => checkForStartUpSongs());

      mainWindow.on('focus', () => {
        mainWindow.webContents.send('app/focused');
        mainWindow.flashFrame(false);
      });
      mainWindow.on('blur', () => mainWindow.webContents.send('app/blurred'));

      mainWindow.on('enter-full-screen', () => {
        console.log('Entered full screen');
        mainWindow.webContents.send('app/enteredFullscreen');
      });
      mainWindow.on('leave-full-screen', () => {
        console.log('Left full screen');
        mainWindow.webContents.send('app/leftFullscreen');
      });

      ipcMain.on('app/getSongPosition', (_event: unknown, position: number) =>
        saveUserData('currentSong.stoppedPosition', position)
      );

      ipcMain.handle('app/addMusicFolder', (_, sortType: SongSortTypes) =>
        addMusicFolder(mainWindow, sortType)
      );

      ipcMain.handle('app/getSong', (_event: unknown, id: string) =>
        sendAudioData(id)
      );

      ipcMain.handle(
        'app/getSongFromUnknownSource',
        (_event: unknown, songPath: string) => sendAudioDataFromPath(songPath)
      );

      ipcMain.handle(
        'app/toggleLikeSongs',
        (_, songIds: string[], likeSong?: boolean) =>
          toggleLikeSongs(songIds, likeSong)
      );

      ipcMain.handle(
        'app/toggleLikeArtists',
        (_, artistIds: string[], likeArtist?: boolean) =>
          toggleLikeArtists(artistIds, likeArtist)
      );

      ipcMain.handle(
        'app/getAllSongs',
        (
          _,
          sortType?: SongSortTypes,
          pageNo?: number,
          maxResultsPerPage?: number
        ) => getAllSongs(sortType, pageNo, maxResultsPerPage)
      );

      ipcMain.handle(
        'app/saveUserData',
        (_event: unknown, dataType: UserDataTypes, data: string) =>
          saveUserData(dataType, data)
      );

      ipcMain.handle('app/getUserData', () => getUserData());

      ipcMain.handle(
        'app/search',
        (
          _,
          searchFilters: SearchFilters,
          value: string,
          updateSearchHistory?: boolean
        ) => search(searchFilters, value, updateSearchHistory)
      );

      ipcMain.handle(
        'app/getSongLyrics',
        (
          _,
          trackInfo: LyricsRequestTrackInfo,
          lyricsType?: LyricsTypes,
          lyricsRequestType?: LyricsRequestTypes
        ) => getSongLyrics(trackInfo, lyricsType, lyricsRequestType)
      );

      ipcMain.handle(
        'app/saveLyricsToSong',
        (_, songPath: string, lyrics: SongLyrics) =>
          saveLyricsToSong(songPath, lyrics)
      );

      ipcMain.handle(
        'app/getSongInfo',
        (
          _,
          songIds: string[],
          sortType?: SongSortTypes,
          limit?: number,
          preserveIdOrder = false
        ) => getSongInfo(songIds, sortType, limit, preserveIdOrder)
      );

      ipcMain.handle('app/getSongListeningData', (_, songIds: string[]) =>
        getListeningData(songIds)
      );

      ipcMain.handle(
        'app/updateSongListeningData',
        (
          _,
          songId: string,
          dataType: ListeningDataTypes,
          dataUpdateType: ListeningDataUpdateTypes
        ) => updateSongListeningData(songId, dataType, dataUpdateType)
      );

      ipcMain.on(
        'app/savePageSortState',
        (_, pageType: PageSortTypes, state: unknown) => {
          saveUserData(pageType, state);
        }
      );

      ipcMain.handle('app/getArtistArtworks', (_, artistId: string) =>
        getArtistInfoFromNet(artistId)
      );

      ipcMain.handle(
        'app/fetchSongInfoFromNet',
        (_, songTitle: string, songArtists: string[]) =>
          fetchSongInfoFromLastFM(songTitle, songArtists)
      );

      ipcMain.handle(
        'app/searchSongMetadataResultsInInternet',
        (_, songTitle: string, songArtists: string[]) =>
          searchSongMetadataResultsInInternet(songTitle, songArtists)
      );

      ipcMain.handle(
        'app/fetchSongMetadataFromInternet',
        (_, source: SongMetadataSource, sourceId: string) =>
          fetchSongMetadataFromInternet(source, sourceId)
      );

      ipcMain.handle(
        'app/getArtistData',
        (_, artistIdsOrNames?: string[], sortType?: ArtistSortTypes) =>
          fetchArtistData(artistIdsOrNames, sortType)
      );

      ipcMain.handle(
        'app/getGenresData',
        (_, genreIds?: string[], sortType?: GenreSortTypes) =>
          getGenresInfo(genreIds, sortType)
      );

      ipcMain.handle(
        'app/getAlbumData',
        (_, albumIds?: string[], sortType?: AlbumSortTypes) =>
          fetchAlbumData(albumIds, sortType)
      );

      ipcMain.handle(
        'app/getPlaylistData',
        (
          _,
          playlistIds?: string[],
          sortType?: AlbumSortTypes,
          onlyMutablePlaylists = false
        ) => sendPlaylistData(playlistIds, sortType, onlyMutablePlaylists)
      );

      ipcMain.handle(
        'app/addNewPlaylist',
        (_, playlistName: string, songIds?: string[], artworkPath?: string) =>
          addNewPlaylist(playlistName, songIds, artworkPath)
      );

      ipcMain.handle('app/removePlaylists', (_, playlistIds: string[]) =>
        removePlaylists(playlistIds)
      );

      ipcMain.handle(
        'app/addSongsToPlaylist',
        (_, playlistId: string, songIds: string[]) =>
          addSongsToPlaylist(playlistId, songIds)
      );

      ipcMain.handle(
        'app/removeSongFromPlaylist',
        (_, playlistId: string, songId: string) =>
          removeSongFromPlaylist(playlistId, songId)
      );

      ipcMain.handle('app/clearSongHistory', () => clearSongHistory());

      ipcMain.handle(
        'app/deleteSongsFromSystem',
        (_, absoluteFilePaths: string[], isPermanentDelete: boolean) =>
          deleteSongsFromSystem(
            absoluteFilePaths,
            abortController.signal,
            isPermanentDelete
          )
      );

      ipcMain.handle('app/resyncSongsLibrary', async () => {
        await checkForNewSongs();
        sendMessageToRenderer(
          'Library resync successfull.',
          'RESYNC_SUCCESSFUL'
        );
      });

      ipcMain.handle('app/getBlacklistData', getBlacklistData);

      ipcMain.handle('app/blacklistSongs', (_, songIds: string[]) =>
        blacklistSongs(songIds)
      );

      ipcMain.handle('app/restoreBlacklistedSongs', (_, songIds: string[]) =>
        restoreBlacklistedSongs(songIds)
      );

      ipcMain.handle(
        'app/updateSongId3Tags',
        (
          _,
          songIdOrPath: string,
          tags: SongTags,
          sendUpdatedData?: boolean,
          isKnownSource = true
        ) =>
          updateSongId3Tags(songIdOrPath, tags, sendUpdatedData, isKnownSource)
      );

      ipcMain.handle('app/getImgFileLocation', getImagefileLocation);

      ipcMain.handle(
        'app/getSongId3Tags',
        (_, songId: string, isKnownSource = true) =>
          sendSongID3Tags(songId, isKnownSource)
      );

      ipcMain.handle('app/clearSearchHistory', (_, searchText?: string[]) =>
        clearSearchHistoryResults(searchText)
      );

      ipcMain.on('app/resetApp', () => resetApp());

      ipcMain.on('app/openLogFile', () =>
        shell.openPath(path.join(app.getPath('userData'), 'logs.txt'))
      );

      ipcMain.on('revealSongInFileExplorer', (_, songId: string) =>
        revealSongInFileExplorer(songId)
      );

      ipcMain.on('app/openInBrowser', (_, url: string) =>
        shell.openExternal(url)
      );

      ipcMain.handle(
        'app/getRendererLogs',
        (
          _: unknown,
          logs: string,
          forceRestart = false,
          forceMainRestart = false
        ) => getRendererLogs(logs, forceRestart, forceMainRestart)
      );

      ipcMain.handle('app/removeAMusicFolder', (_, absolutePath: string) =>
        removeMusicFolder(absolutePath)
      );

      ipcMain.handle('app/toggleMiniPlayer', (_, isMiniPlayerActive: boolean) =>
        toggleMiniPlayer(isMiniPlayerActive)
      );

      ipcMain.handle(
        'app/toggleMiniPlayerAlwaysOnTop',
        (_, isMiniPlayerAlwaysOnTop: boolean) =>
          toggleMiniPlayerAlwaysOnTop(isMiniPlayerAlwaysOnTop)
      );

      ipcMain.handle('app/toggleAutoLaunch', (_, autoLaunchState: boolean) =>
        toggleAutoLaunch(autoLaunchState)
      );

      ipcMain.handle(
        'app/getFolderData',
        (_, folderPaths?: string[], sortType?: FolderSortTypes) =>
          getMusicFolderData(folderPaths, sortType)
      );

      ipcMain.handle('app/blacklistFolders', (_, folderPaths: string[]) =>
        blacklistFolders(folderPaths)
      );

      ipcMain.handle(
        'app/restoreBlacklistedFolders',
        (_, folderPaths: string[]) => restoreBlacklistedFolders(folderPaths)
      );

      ipcMain.handle(
        'app/toggleBlacklistedFolders',
        (_, folderPaths: string[], isBlacklistFolder?: boolean) =>
          toggleBlacklistFolders(folderPaths, isBlacklistFolder)
      );

      ipcMain.on(
        'app/networkStatusChange',
        (_: unknown, isConnected: boolean) => {
          log(
            isConnected
              ? `APP CONNECTED TO THE INTERNET SUCCESSFULLY`
              : `APP DISCONNECTED FROM THE INTERNET`
          );
          isConnectedToInternet = isConnected;
        }
      );

      ipcMain.on('app/openDevTools', () => {
        log('USER REQUESTED FOR DEVTOOLS.');
        mainWindow.webContents.openDevTools({ mode: 'detach', activate: true });
      });

      ipcMain.on('app/restartRenderer', (_: unknown, reason: string) => {
        log(`RENDERER REQUESTED A RENDERER REFRESH.\nREASON : ${reason}`);
        restartRenderer();
      });

      ipcMain.on('app/restartApp', (_: unknown, reason: string) =>
        restartApp(reason)
      );

      //  / / / / / / / / / / / GLOBAL SHORTCUTS / / / / / / / / / / / / / /
      globalShortcut.register('F5', () => {
        const isFocused = mainWindow.isFocused();
        log('USER REQUESTED RENDERER REFRESH USING GLOBAL SHORTCUT.', {
          isFocused,
        });
        if (isFocused) restartRenderer();
      });

      globalShortcut.register('F12', () => {
        log(
          'USER REQUESTED FOR DEVTOOLS USING GLOBAL SHORTCUT. - REQUEST WONT BE SERVED.'
        );
        // mainWindow.webContents.openDevTools({ mode: 'detach', activate: true });
      });
    }
    return undefined;
  })
  .catch((err) => console.log(err));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// / / / / / / / / / / / / / / / / / / / / / / / / / / / /
function manageWindowFinishLoad() {
  const userData = getUserData();
  if (userData.windowPositions.mainWindow) {
    const { x, y } = userData.windowPositions.mainWindow;
    mainWindow.setPosition(x, y, true);
  } else {
    mainWindow.center();
    const [x, y] = mainWindow.getPosition();
    saveUserData('windowPositions.mainWindow', { x, y });
  }
  mainWindow.show();

  if (IS_DEVELOPMENT)
    mainWindow.webContents.openDevTools({ mode: 'detach', activate: true });

  log(`STARTING UP THE RENDERER.`, undefined, 'WARN');

  manageTaskbarPlaybackButtonControls(mainWindow, true, false);

  nativeTheme.addListener('updated', watchForSystemThemeChanges);
}

function handleBeforeQuit() {
  mainWindow.webContents.send('app/beforeQuitEvent');
  closeAllAbortControllers();
  clearTempArtworkFolder();
  log(
    `QUITING NORA`,
    { uptime: `${Math.floor(process.uptime())} seconds` },
    'WARN'
  );
}

export function sendMessageToRenderer(
  message: string,
  code?: MessageCodes,
  data?: object
) {
  mainWindow.webContents.send(
    'app/sendMessageToRendererEvent',
    message,
    code,
    data
  );
}

let dataUpdateEventTimeOutId: NodeJS.Timer;
let dataEventsCache: DataUpdateEvent[] = [];
export function dataUpdateEvent(
  dataType: DataUpdateEventTypes,
  data = [] as string[],
  message?: string
) {
  if (dataUpdateEventTimeOutId) clearTimeout(dataUpdateEventTimeOutId);
  log(
    `Data update event fired with updated '${dataType}'.${
      data.length > 0 || message ? '\n' : ''
    }${data.length > 0 ? `DATA : ${data}; ` : ''}${
      message ? `MESSAGE : ${data}; ` : ''
    }`
  );
  addEventsToCache(dataType, data, message);
  dataUpdateEventTimeOutId = setTimeout(() => {
    console.log(dataEventsCache);
    mainWindow.webContents.send(
      'app/dataUpdateEvent',
      dataEventsCache,
      data,
      message
    );
    dataEventsCache = [];
  }, 1000);
}

function addEventsToCache(
  dataType: DataUpdateEventTypes,
  data = [] as string[],
  message?: string
) {
  for (let i = 0; i < dataEventsCache.length; i += 1) {
    if (dataEventsCache[i].dataType === dataType) {
      if (data.length > 0 || message) {
        return dataEventsCache[i].eventData.push({ data, message });
      }
      return undefined;
    }
  }
  return dataEventsCache.push({
    dataType,
    eventData: data.length > 0 || message ? [{ data, message }] : [],
  } satisfies DataUpdateEvent);
}

function registerFileProtocol(
  request: { url: string },
  // eslint-disable-next-line no-unused-vars
  callback: (arg: string) => void
) {
  const urlWithQueries = decodeURI(request.url).replace(
    /nora:[/\\]{1,2}localFiles[/\\]{1,2}/gm,
    ''
  );

  try {
    const [url] = urlWithQueries.split('?');
    return callback(url);
  } catch (error) {
    log(
      `====== ERROR OCCURRED WHEN TRYING TO LOCATE A RESOURCE IN THE SYSTEM. =======\nREQUEST : ${urlWithQueries}\nERROR : ${error}`
    );
    return callback('404');
  }
}

function manageAppMoveEvent() {
  const [x, y] = mainWindow.getPosition();
  log(
    `User moved the ${
      isMiniPlayer ? 'mini-player' : 'main window'
    } to (x: ${x}, y: ${y}) coordinates.`
  );
  if (isMiniPlayer) saveUserData('windowPositions.miniPlayer', { x, y });
  else saveUserData('windowPositions.mainWindow', { x, y });
}

function manageAppResizeEvent() {
  const [x, y] = mainWindow.getSize();
  log(
    `User resized the ${
      isMiniPlayer ? 'mini-player' : 'main window'
    } to (x: ${x}, y: ${y}) diamensions.`
  );
  if (isMiniPlayer) saveUserData('windowDiamensions.miniPlayer', { x, y });
  else saveUserData('windowDiamensions.mainWindow', { x, y });
}

async function handleSecondInstances(_: unknown, argv: string[]) {
  log('User requested for a second instance of the app.');
  if (app.hasSingleInstanceLock()) {
    if (mainWindow?.isMinimized()) mainWindow?.restore();
    mainWindow?.focus();
  }
  process.argv = argv;
  mainWindow?.webContents.send(
    'app/playSongFromUnknownSource',
    await checkForStartUpSongs()
  );
}

function restartApp(reason: string) {
  log(`RENDERER REQUESTED A FULL APP REFRESH.\nREASON : ${reason}`);
  mainWindow.webContents.send('app/beforeQuitEvent');
  closeAllAbortControllers();
  app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
  app.exit(0);
}

async function revealSongInFileExplorer(songId: string) {
  const songs = getSongsData();

  for (let x = 0; x < songs.length; x += 1) {
    if (songs[x].songId === songId)
      return shell.showItemInFolder(songs[x].path);
  }
  return log(
    `Revealing song file in explorer failed because song couldn't be found in the library.`,
    undefined,
    'WARN'
  );
}

const songsOutsideLibraryData: SongOutsideLibraryData[] = [];

export const getSongsOutsideLibraryData = () => songsOutsideLibraryData;

export const addToSongsOutsideLibraryData = (data: SongOutsideLibraryData) =>
  songsOutsideLibraryData.push(data);

export const updateSongsOutsideLibraryData = (
  songidOrPath: string,
  data: SongOutsideLibraryData
) => {
  for (let i = 0; i < songsOutsideLibraryData.length; i += 1) {
    if (
      songsOutsideLibraryData[i].path === songidOrPath ||
      songsOutsideLibraryData[i].songId === songidOrPath
    ) {
      songsOutsideLibraryData[i] = data;
      return undefined;
    }
  }
  log(
    `songIdOrPath ${songidOrPath} does't exist on songsOutsideLibraryData.`,
    undefined,
    'ERROR'
  );
  throw new Error(
    `songIdOrPath ${songidOrPath} does't exist on songsOutsideLibraryData.`
  );
};

async function getImagefileLocation() {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Select an Image',
    buttonLabel: 'Select Image',
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'webp', 'png'] }],
    properties: ['openFile'],
  });
  if (canceled) throw new Error('PROMPT_CLOSED_BEFORE_INPUT' as MessageCodes);
  return filePaths[0];
}

async function resetApp() {
  log('!-!-!-!-!-!  STARTED THE RESETTING PROCESS OF THE APP.  !-!-!-!-!-!');
  try {
    resetAppCache();
    await resetAppData();
    log(
      `########## SUCCESSFULLY RESETTED THE APP. RESTARTING THE APP NOW. ##########`
    );
    sendMessageToRenderer(
      'Successfully resetted the app. Restarting the app now.'
    );
  } catch (error) {
    sendMessageToRenderer('Resetting the app failed. Reloading the app now.');
    log(
      `====== ERROR OCCURRED WHEN RESETTING THE APP. RELOADING THE APP NOW.  ======\nERROR : ${error}`
    );
  } finally {
    mainWindow.webContents.reload();
    log(`====== RELOADING THE RENDERER ======`);
  }
}

function toggleMiniPlayerAlwaysOnTop(isMiniPlayerAlwaysOnTop: boolean) {
  if (mainWindow) {
    if (isMiniPlayer) mainWindow.setAlwaysOnTop(isMiniPlayerAlwaysOnTop);
    saveUserData(
      'preferences.isMiniPlayerAlwaysOnTop',
      isMiniPlayerAlwaysOnTop
    );
  }
}

async function getRendererLogs(
  logs: string,
  forceRestart = false,
  forceMainRestart = false
) {
  log(logs);
  if (forceRestart) return mainWindow.reload();
  if (forceMainRestart) {
    app.relaunch();
    return app.exit();
  }
  return undefined;
}

function restartRenderer() {
  mainWindow.webContents.send('app/beforeQuitEvent');
  mainWindow.reload();
  if (isMiniPlayer) {
    toggleMiniPlayer(false);
    log('APP TOGGLED BACK TO THE MAIN WINDOW DUE TO AN APP REFRESH.');
  }
}

function watchForSystemThemeChanges() {
  if (IS_DEVELOPMENT)
    sendMessageToRenderer(
      `App theme changed to ${nativeTheme.themeSource}`,
      'APP_THEME_CHANGE'
    );
  if (mainWindow.webContents) {
    mainWindow.webContents.send(
      'app/systemThemeChange',
      nativeTheme.shouldUseDarkColors,
      nativeTheme.themeSource === 'system'
    );
  }
}

function toggleMiniPlayer(isActivateMiniPlayer: boolean) {
  if (mainWindow) {
    log(
      `Toggled the mini-player to be ${
        isActivateMiniPlayer ? 'enabled' : 'disabled'
      }.`
    );
    isMiniPlayer = isActivateMiniPlayer;
    const { windowPositions, windowDiamensions, preferences } = getUserData();
    if (isActivateMiniPlayer) {
      if (mainWindow.fullScreen) mainWindow.setFullScreen(false);

      mainWindow.setMaximumSize(MINI_PLAYER_MAX_SIZE_X, MINI_PLAYER_MAX_SIZE_Y);
      mainWindow.setMinimumSize(MINI_PLAYER_MIN_SIZE_X, MINI_PLAYER_MIN_SIZE_Y);
      mainWindow.setAlwaysOnTop(preferences.isMiniPlayerAlwaysOnTop ?? false);
      if (windowDiamensions.miniPlayer) {
        const { x, y } = windowDiamensions.miniPlayer;
        mainWindow.setSize(x, y, true);
      } else
        mainWindow.setSize(
          MINI_PLAYER_MIN_SIZE_X,
          MINI_PLAYER_MIN_SIZE_Y,
          true
        );
      if (windowPositions.miniPlayer) {
        const { x, y } = windowPositions.miniPlayer;
        mainWindow.setPosition(x, y, true);
      } else {
        mainWindow.center();
        const [x, y] = mainWindow.getPosition();
        saveUserData('windowPositions.miniPlayer', { x, y });
      }
      mainWindow.setAspectRatio(MINI_PLAYER_ASPECT_RATIO);
    } else {
      mainWindow.setMaximumSize(MAIN_WINDOW_MAX_SIZE_X, MAIN_WINDOW_MAX_SIZE_Y);
      mainWindow.setMinimumSize(MAIN_WINDOW_MIN_SIZE_X, MAIN_WINDOW_MIN_SIZE_Y);
      mainWindow.setAlwaysOnTop(false);
      if (windowDiamensions.mainWindow) {
        const { x, y } = windowDiamensions.mainWindow;
        mainWindow.setSize(x, y, true);
      } else
        mainWindow.setSize(
          MAIN_WINDOW_DEFAULT_SIZE_X,
          MAIN_WINDOW_DEFAULT_SIZE_Y,
          true
        );
      if (windowPositions.mainWindow) {
        const { x, y } = windowPositions.mainWindow;
        mainWindow.setPosition(x, y, true);
      } else {
        mainWindow.center();
        const [x, y] = mainWindow.getPosition();
        saveUserData('windowPositions.mainWindow', { x, y });
      }
      mainWindow.setAspectRatio(MAIN_WINDOW_ASPECT_RATIO);
    }
  }
}

async function toggleAutoLaunch(autoLaunchState: boolean) {
  const options = app.getLoginItemSettings();
  const userData = getUserData();
  const openAsHidden =
    userData?.preferences?.openWindowAsHiddenOnSystemStart ?? false;

  log(`AUTO LAUNCH STATE : ${options.openAtLogin}`);

  app.setLoginItemSettings({
    openAtLogin: autoLaunchState,
    name: 'Nora',
    openAsHidden,
  });

  saveUserData('preferences.autoLaunchApp', autoLaunchState);
}

export const checkIfConnectedToInternet = () => isConnectedToInternet;
