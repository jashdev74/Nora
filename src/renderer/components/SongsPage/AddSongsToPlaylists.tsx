/* eslint-disable no-console */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import Checkbox from '../Checkbox';
import Button from '../Button';
import Img from '../Img';

interface AddSongsToPlaylistProp {
  songIds: string[];
  title?: string;
}

interface SelectablePlaylistProp extends Playlist {
  isChecked: boolean;
  playlistCheckedStateUpdateFunc: (_state: boolean) => void;
}

const SelectablePlaylist = (props: SelectablePlaylistProp) => {
  const {
    playlistId,
    artworkPaths,
    name,
    songs,
    playlistCheckedStateUpdateFunc,
    isChecked,
  } = props;

  return (
    <div
      className={`playlist appear-from-bottom group ${playlistId} mb-6 mr-4 flex h-52 w-[9.5rem] flex-col justify-between rounded-xl p-4 text-font-color-black dark:text-font-color-white ${
        isChecked
          ? 'bg-background-color-3 !text-font-color-black dark:bg-dark-background-color-3 dark:!text-font-color-black'
          : 'hover:bg-background-color-2 hover:dark:bg-dark-background-color-2'
      }`}
      onClick={() => playlistCheckedStateUpdateFunc(!isChecked)}
      onKeyDown={() => playlistCheckedStateUpdateFunc(!isChecked)}
      role="button"
      tabIndex={0}
    >
      <div className="playlist-cover-and-checkbox-container relative h-[70%] overflow-hidden">
        <Checkbox
          id={playlistId}
          checkedStateUpdateFunction={playlistCheckedStateUpdateFunc}
          isChecked={isChecked}
          className="absolute bottom-3 right-3"
        />
        <div className="playlist-cover-container h-full cursor-pointer overflow-hidden rounded-lg">
          <Img
            src={artworkPaths.artworkPath}
            alt="Playlist Cover"
            loading="lazy"
            className="h-full"
          />
        </div>
      </div>
      <div className="playlist-info-container">
        <div
          className="title playlist-title w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-xl"
          title={name}
        >
          {name}
        </div>
        <div className="playlist-no-of-songs text-sm font-light">{`${
          songs.length
        } song${songs.length === 1 ? '' : 's'}`}</div>
      </div>
    </div>
  );
};

interface SelectPlaylist extends Playlist {
  isSelected: boolean;
}

const AddSongsToPlaylists = (props: AddSongsToPlaylistProp) => {
  const { changePromptMenuData, addNewNotifications } =
    React.useContext(AppUpdateContext);
  const { songIds, title } = props;
  const [playlists, setPlaylists] = React.useState([] as SelectPlaylist[]);

  React.useEffect(() => {
    window.api
      .getPlaylistData([], undefined, true)
      .then((res) => {
        if (res.length > 0) {
          setPlaylists(() =>
            res.map((playlist) => {
              return {
                ...playlist,
                isSelected:
                  songIds.length === 1 &&
                  playlist.songs.some((id) => songIds.includes(id)),
              };
            })
          );
        }
        return undefined;
      })
      .catch((err) => console.error(err));
  }, [songIds]);

  const addSongsToPlaylists = React.useCallback(() => {
    const selectedPlaylists = playlists.filter(
      (playlist) => playlist.isSelected
    );
    const promises = selectedPlaylists.map(async (playlist) => {
      if (playlist.playlistId === 'Favorites')
        return window.api
          .toggleLikeSongs(songIds, true)
          .catch((err) => console.error(err));
      return window.api
        .addSongsToPlaylist(playlist.playlistId, songIds)
        .catch((err) => console.error(err));
    });
    // eslint-disable-next-line promise/catch-or-return
    Promise.all(promises)
      .then((res) => {
        console.log(res);
        return addNewNotifications([
          {
            id: 'songAddedtoPlaylists',
            delay: 5000,
            icon: <span className="material-icons-round">playlist_add</span>,
            content: (
              <span>
                Added{' '}
                {selectedPlaylists.length > 1
                  ? `${selectedPlaylists.length} songs`
                  : `'${title}'`}{' '}
                to {`${selectedPlaylists.length} playlists.`}
              </span>
            ),
          },
        ]);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        changePromptMenuData(false);
      });
  }, [playlists, songIds, title, changePromptMenuData, addNewNotifications]);

  const playlistComponents = React.useMemo(
    () =>
      playlists.length > 0
        ? playlists.map((playlist) => {
            return (
              <SelectablePlaylist
                name={playlist.name}
                createdDate={playlist.createdDate}
                playlistId={playlist.playlistId}
                songs={playlist.songs}
                artworkPaths={playlist.artworkPaths}
                isArtworkAvailable={playlist.isArtworkAvailable}
                isChecked={playlist.isSelected}
                playlistCheckedStateUpdateFunc={(state) => {
                  setPlaylists((prevData) => {
                    return prevData.map((data) => {
                      if (data.playlistId === playlist.playlistId)
                        return { ...data, isSelected: state };
                      return data;
                    });
                  });
                }}
                key={playlist.playlistId}
              />
            );
          })
        : [],
    [playlists]
  );

  const noOfSelectedPlaylists = React.useMemo(
    () => playlists.filter((playlist) => playlist.isSelected).length,
    [playlists]
  );

  return (
    <>
      <div className="title-container mt-1 mb-4 flex items-center pr-4 text-3xl font-medium text-font-color-black dark:text-font-color-white">
        Select playlists to add{' '}
        {songIds.length > 1 ? `${songIds.length} songs` : `'${title}' song`}
      </div>
      {songIds.length > 1 && (
        <p>
          &bull; When adding multiple songs to playlists, songs that are already
          in selected playlists will be ignored.
        </p>
      )}
      {playlistComponents.length > 0 && (
        <div className="playlists-container mt-4 flex h-full flex-wrap">
          {playlistComponents}
        </div>
      )}
      <div className="buttons-and-other-info-container flex items-center justify-end">
        <span className="mr-12 text-font-color-highlight dark:text-dark-font-color-highlight">
          {noOfSelectedPlaylists} selected
        </span>
        <div className="buttons-container flex">
          <Button
            label="Cancel"
            iconName="close"
            clickHandler={() => changePromptMenuData(false)}
          />
          <Button
            label="Add to Playlist(s)"
            iconName="playlist_add"
            clickHandler={addSongsToPlaylists}
            className="!bg-background-color-3 px-6  text-font-color-black dark:!bg-dark-background-color-3 dark:!text-font-color-black"
          />
        </div>
      </div>
    </>
  );
};

export default AddSongsToPlaylists;
