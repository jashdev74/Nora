/* eslint-disable no-unused-vars */
import { createContext, ReactElement } from 'react';

export interface AppUpdateContextType {
  updateUserData: (
    callback: (prevState: UserData) => UserData | Promise<UserData> | void
  ) => void;
  updateCurrentSongData: (
    callback: (prevState: AudioPlayerData) => AudioPlayerData
  ) => void;
  updateContextMenuData: (
    isVisible: boolean,
    menuItems?: ContextMenuItem[],
    pageX?: number,
    pageY?: number,
    contextMenuData?: ContextMenuAdditionalData
  ) => void;
  changePromptMenuData: (
    isVisible: boolean,
    content?: ReactElement<any, any>,
    className?: string
  ) => void;
  addNewNotifications: (newNotifications: AppNotification[]) => void;
  updateNotifications: (
    callback: (currentNotifications: AppNotification[]) => AppNotification[]
  ) => void;
  changeCurrentActivePage: (pageTitle: PageTitles, data?: PageData) => void;
  updatePageHistoryIndex: (
    type: 'increment' | 'decrement' | 'home',
    pageIndex?: number
  ) => void;
  updateCurrentlyActivePageData: (
    callback: (currentPageData: PageData) => PageData
  ) => void;
  playSong: (songId: string, isStartPlay?: boolean) => void;
  updateCurrentSongPlaybackState: (isPlaying: boolean) => void;
  handleSkipBackwardClick: () => void;
  handleSkipForwardClick: (reason: SongSkipReason) => void;
  toggleShuffling: (isShuffling?: boolean) => void;
  toggleSongPlayback: () => void;
  toggleRepeat: () => void;
  toggleIsFavorite: (
    isFavorite: boolean,
    onlyChangeCurrentSongData?: boolean
  ) => void;
  toggleMutedState: (isMuted?: boolean) => void;
  updateVolume: (volume: number) => void;
  updateSongPosition: (position: number) => void;
  createQueue: (
    songIds: string[],
    queueType: QueueTypes,
    isShuffleQueue?: boolean,
    queueId?: string,
    startPlaying?: boolean
  ) => void;
  updateQueueData: (
    currentSongIndex?: number,
    queue?: string[],
    isShuffleQueue?: boolean,
    playCurrentSongIndex?: boolean,
    clearPreviousQueueData?: boolean
  ) => void;
  changeQueueCurrentSongIndex: (currentSongIndex: number) => void;
  updateMiniPlayerStatus: (isVisible: boolean) => void;
  updatePageSortingOrder: (page: PageSortTypes, state: unknown) => void;
  clearAudioPlayerData: () => void;
  updateBodyBackgroundImage: (isVisible: boolean, src?: string) => void;
  updateMultipleSelections: (
    id: string,
    selectionType: QueueTypes,
    type: 'add' | 'remove'
  ) => void;
  toggleMultipleSelections: (
    isEnabled?: boolean,
    selectionType?: QueueTypes,
    addSelections?: string[]
  ) => void;
  updateAppUpdatesState: (state: AppUpdatesState) => void;
}

export const AppUpdateContext = createContext({} as AppUpdateContextType);
