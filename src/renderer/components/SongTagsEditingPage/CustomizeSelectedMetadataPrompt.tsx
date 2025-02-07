/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import isLyricsSynced from 'main/utils/isLyricsSynced';
import React from 'react';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import Button from '../Button';
import Checkbox from '../Checkbox';
import Img from '../Img';
import { MetadataKeywords } from './SongTagsEditingPage';

interface SongMetadataResultProp {
  title: string;
  artists: string[];
  genres?: string[];
  album?: string;
  releasedYear?: number;
  lyrics?: string;
  artworkPaths?: string[];
  updateSongInfo: (_callback: (_prevData: SongTags) => SongTags) => void;
  updateMetadataKeywords: (_metadataKeywords: MetadataKeywords) => void;
}

const CustomizeSelectedMetadataPrompt = (props: SongMetadataResultProp) => {
  const { changePromptMenuData } = React.useContext(AppUpdateContext);
  const {
    title,
    artists,
    genres,
    artworkPaths,
    album,
    lyrics,
    releasedYear,
    updateSongInfo,
    updateMetadataKeywords,
  } = props;

  const [selectedArtwork, setSelectedArtwork] = React.useState(
    artworkPaths?.at(-1)
  );
  const [selectedMetadata, setSelectedMetadata] = React.useState({
    isTitleSelected: true,
    isArtistsSelected: true,
    isAlbumSelected: true,
    isReleasedYearSelected: true,
    isGenresSelected: true,
    isLyricsSelected: true,
  });
  const [showLyrics, setShowLyrics] = React.useState(false);

  const artworkComponents = React.useMemo(() => {
    return artworkPaths?.map((artwork) => {
      const isSelectedArtwork = selectedArtwork === artwork;

      return (
        <div
          className={`group mr-4 flex cursor-pointer flex-col items-center rounded-lg p-4 hover:bg-background-color-2/50 dark:hover:bg-dark-background-color-2/50 ${
            isSelectedArtwork &&
            'bg-background-color-2 shadow-lg dark:bg-dark-background-color-2'
          }`}
          onClick={() =>
            setSelectedArtwork((prevArtwork) =>
              prevArtwork === artwork ? '' : artwork
            )
          }
        >
          <Img
            src={artwork}
            className="w-40 rounded-md"
            showImgPropsOnTooltip
          />
          <Button
            label={isSelectedArtwork ? 'SELECTED' : 'SELECT'}
            className={`!mx-0 mt-4 bg-background-color-2 !py-1 group-hover:bg-background-color-1 dark:bg-dark-background-color-2 dark:group-hover:bg-dark-background-color-1 ${
              isSelectedArtwork &&
              '!dark:bg-dark-background-color-3 !dark:text-font-color-black !border-background-color-3 !bg-background-color-3 font-medium !text-font-color-black dark:!border-dark-background-color-3'
            }`}
            clickHandler={(e) => {
              e.stopPropagation();
              setSelectedArtwork((prevArtwork) =>
                prevArtwork === artwork ? '' : artwork
              );
            }}
          />
        </div>
      );
    });
  }, [artworkPaths, selectedArtwork]);

  const isLyricsSynchronised = React.useMemo(
    () => isLyricsSynced(lyrics || ''),
    [lyrics]
  );

  const updateSelectedMetadata = React.useCallback(() => {
    changePromptMenuData(false, undefined, '');
    const {
      isTitleSelected,
      isAlbumSelected,
      isArtistsSelected,
      isGenresSelected,
      isLyricsSelected,
      isReleasedYearSelected,
    } = selectedMetadata;
    updateSongInfo((prevData) => {
      return {
        ...prevData,
        title: isTitleSelected && title ? title : prevData.title || undefined,
        releasedYear:
          isReleasedYearSelected && typeof releasedYear === 'number'
            ? releasedYear
            : prevData.releasedYear || undefined,
        lyrics:
          isLyricsSelected && lyrics ? lyrics : prevData.lyrics || undefined,
        artworkPath: selectedArtwork || prevData.artworkPath || undefined,
        album:
          prevData.album && selectedArtwork
            ? {
                ...prevData?.album,
                artworkPath: selectedArtwork || prevData.artworkPath,
              }
            : prevData.album || undefined,
      } as SongTags;
    });
    updateMetadataKeywords({
      albumKeyword: isAlbumSelected ? album : undefined,
      artistKeyword: isArtistsSelected ? artists?.join(';') : undefined,
      genreKeyword: isGenresSelected ? genres?.join(';') : undefined,
    });
  }, [
    album,
    artists,
    changePromptMenuData,
    genres,
    lyrics,
    releasedYear,
    selectedArtwork,
    selectedMetadata,
    title,
    updateMetadataKeywords,
    updateSongInfo,
  ]);

  const updateAllMetadata = React.useCallback(() => {
    changePromptMenuData(false, undefined, '');
    updateSongInfo((prevData) => {
      return {
        ...prevData,
        title: title || prevData.title || undefined,
        releasedYear: releasedYear ?? prevData.releasedYear ?? undefined,
        lyrics: lyrics || prevData.lyrics || undefined,
        artworkPath: selectedArtwork || prevData.artworkPath || undefined,
        album: prevData.album
          ? {
              ...prevData?.album,
              artworkPath: selectedArtwork || prevData.artworkPath || undefined,
            }
          : undefined,
      } as SongTags;
    });
    updateMetadataKeywords({
      albumKeyword: album || undefined,
      artistKeyword: Array.isArray(artists) ? artists?.join(';') : undefined,
      genreKeyword: Array.isArray(genres) ? genres?.join(';') : undefined,
    });
  }, [
    album,
    artists,
    changePromptMenuData,
    genres,
    lyrics,
    releasedYear,
    selectedArtwork,
    title,
    updateMetadataKeywords,
    updateSongInfo,
  ]);

  const isAtLeastOneSelected = React.useMemo(
    () =>
      !(
        (Array.isArray(artworkPaths) &&
          artworkPaths.length > 0 &&
          selectedArtwork) ||
        (title && selectedMetadata.isTitleSelected) ||
        (album && selectedMetadata.isAlbumSelected) ||
        (Array.isArray(artists) &&
          artists.length > 0 &&
          selectedMetadata.isArtistsSelected) ||
        (Array.isArray(genres) &&
          genres.length > 0 &&
          selectedMetadata.isGenresSelected) ||
        (typeof releasedYear === 'number' &&
          selectedMetadata.isReleasedYearSelected) ||
        (lyrics && selectedMetadata.isLyricsSelected)
      ),
    [
      album,
      artists,
      artworkPaths,
      genres,
      lyrics,
      releasedYear,
      selectedArtwork,
      selectedMetadata,
      title,
    ]
  );

  const isAllMetadataSelected = React.useMemo(
    () => Object.values(selectedMetadata).every((bool) => bool),
    [selectedMetadata]
  );

  return (
    <div>
      <div className="title-container mt-1 mb-8 flex items-center pr-4 text-3xl font-medium text-font-color-highlight dark:text-dark-font-color-highlight">
        Customize Downloaded Metadata for '{title}'
      </div>
      <div className="artworks-container">
        <div className="title-container mb-4 text-xl font-medium text-font-color-highlight dark:text-dark-font-color-highlight">
          Select an artwork
        </div>
        <div className="artworks flex">{artworkComponents}</div>
      </div>

      <div className="other-info-container mt-10">
        <div className="title-container mb-4 flex justify-between text-xl font-medium text-font-color-highlight dark:text-dark-font-color-highlight">
          Customize Other Metadata
          <Button
            label={isAllMetadataSelected ? 'Unselect All' : 'Select All'}
            className="select-btn text-sm md:text-lg md:[&>.button-label-text]:hidden md:[&>.icon]:mr-0"
            iconName={isAllMetadataSelected ? 'remove_done' : 'checklist'}
            clickHandler={() =>
              setSelectedMetadata({
                isTitleSelected: !isAllMetadataSelected,
                isArtistsSelected: !isAllMetadataSelected,
                isAlbumSelected: !isAllMetadataSelected,
                isReleasedYearSelected: !isAllMetadataSelected,
                isGenresSelected: !isAllMetadataSelected,
                isLyricsSelected: !isAllMetadataSelected,
              })
            }
          />
        </div>
        <div className="other-infos pl-2">
          {title && (
            <div className="other-info mb-4 flex items-center rounded-lg p-2 odd:bg-background-color-2/50 odd:dark:bg-dark-background-color-2/50">
              <Checkbox
                isChecked={selectedMetadata.isTitleSelected}
                id="songTitle"
                className="!ml-4 !mr-6 !mt-0"
                checkedStateUpdateFunction={() =>
                  setSelectedMetadata((prevData) => ({
                    ...prevData,
                    isTitleSelected: !prevData?.isTitleSelected,
                  }))
                }
              />
              <div
                className={`info transition-opacity ${
                  !selectedMetadata.isTitleSelected && '!opacity-50'
                }`}
              >
                <div className="title text-xs uppercase opacity-50">
                  Song Title
                </div>
                <div className="data text-lg">{title}</div>
              </div>
            </div>
          )}
          {artists && (
            <div className="other-info mb-4 flex items-center rounded-lg p-2 odd:bg-background-color-2/50 odd:dark:bg-dark-background-color-2/50">
              <Checkbox
                isChecked={selectedMetadata.isArtistsSelected}
                id="songArtist"
                className="!ml-4 !mr-6 !mt-0"
                checkedStateUpdateFunction={() =>
                  setSelectedMetadata((prevData) => ({
                    ...prevData,
                    isArtistsSelected: !prevData.isArtistsSelected,
                  }))
                }
              />
              <div
                className={`info transition-opacity ${
                  !selectedMetadata.isArtistsSelected && '!opacity-50'
                }`}
              >
                <div className="title text-xs uppercase opacity-50">
                  Song Artists
                </div>
                <div className="data text-lg">{artists?.join(', ')}</div>
              </div>
            </div>
          )}
          {album && (
            <div className="other-info mb-4 flex items-center rounded-lg p-2 odd:bg-background-color-2/50 odd:dark:bg-dark-background-color-2/50">
              <Checkbox
                isChecked={selectedMetadata.isAlbumSelected}
                id="songAlbum"
                className="!ml-4 !mr-6 !mt-0"
                checkedStateUpdateFunction={() =>
                  setSelectedMetadata((prevData) => ({
                    ...prevData,
                    isAlbumSelected: !prevData.isAlbumSelected,
                  }))
                }
              />
              <div
                className={`info transition-opacity ${
                  !selectedMetadata.isAlbumSelected && '!opacity-50'
                }`}
              >
                <div className="title text-xs uppercase opacity-50">
                  Song Album
                </div>
                <div className="data text-lg">{album}</div>
              </div>
            </div>
          )}
          {genres && (
            <div className="other-info mb-4 flex items-center rounded-lg p-2 odd:bg-background-color-2/50 odd:dark:bg-dark-background-color-2/50">
              <Checkbox
                isChecked={selectedMetadata.isGenresSelected}
                id="songGenres"
                className="!ml-4 !mr-6 !mt-0"
                checkedStateUpdateFunction={() =>
                  setSelectedMetadata((prevData) => ({
                    ...prevData,
                    isGenresSelected: !prevData.isGenresSelected,
                  }))
                }
              />
              <div
                className={`info transition-opacity ${
                  !selectedMetadata.isGenresSelected && '!opacity-50'
                }`}
              >
                <div className="title text-xs uppercase opacity-50">
                  Song Genres
                </div>
                <div className="data text-lg">{genres?.join(', ')}</div>
              </div>
            </div>
          )}
          {releasedYear && (
            <div className="other-info mb-4 flex items-center rounded-lg p-2 odd:bg-background-color-2/50 odd:dark:bg-dark-background-color-2/50">
              <Checkbox
                isChecked={selectedMetadata.isReleasedYearSelected}
                id="songReleasedYear"
                className="!ml-4 !mr-6 !mt-0"
                checkedStateUpdateFunction={() =>
                  setSelectedMetadata((prevData) => ({
                    ...prevData,
                    isReleasedYearSelected: !prevData.isReleasedYearSelected,
                  }))
                }
              />
              <div
                className={`info transition-opacity ${
                  !selectedMetadata.isReleasedYearSelected && '!opacity-50'
                }`}
              >
                <div className="title text-xs uppercase opacity-50">
                  Released Year
                </div>
                <div className="data text-lg">{releasedYear}</div>
              </div>
            </div>
          )}
          {lyrics && (
            <div className="other-info mb-4 flex items-center overflow-hidden rounded-lg p-2 odd:bg-background-color-2/50 odd:dark:bg-dark-background-color-2/50">
              <Checkbox
                isChecked={selectedMetadata.isLyricsSelected}
                id="songLyrics"
                className="!ml-4 !mr-6 !mt-0"
                checkedStateUpdateFunction={() =>
                  setSelectedMetadata((prevData) => ({
                    ...prevData,
                    isLyricsSelected: !prevData.isLyricsSelected,
                  }))
                }
              />
              <div
                className={`info transition-opacity ${
                  !selectedMetadata.isLyricsSelected && '!opacity-50'
                }`}
              >
                <div className="title text-xs uppercase opacity-50">
                  Song Lyrics
                </div>
                <div className="data line-clamp-2 overflow-hidden truncate text-lg">
                  <div className="flex ">
                    {isLyricsSynchronised && (
                      <span className="material-icons-round-outlined mr-2 text-font-color-highlight dark:text-dark-font-color-highlight">
                        verified
                      </span>
                    )}{' '}
                    {isLyricsSynchronised ? 'Synced' : 'Unsynced'} Lyrics
                    Available
                    <Button
                      iconName={showLyrics ? 'visibility_off' : 'visibility'}
                      clickHandler={() =>
                        setShowLyrics((prevState) => !prevState)
                      }
                      className="!my-0 !ml-4 !mr-0 !border-0 !p-0"
                    />
                  </div>

                  {showLyrics && (
                    <pre className="mt-4 max-h-[400px] min-h-[200px] max-w-[95%] overflow-scroll bg-background-color-1 text-sm dark:bg-dark-background-color-1">
                      {lyrics}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="buttons-container mt-10 flex items-center justify-end">
        <Button
          label="Cancel"
          iconName="close"
          clickHandler={() => changePromptMenuData(false)}
        />
        <Button
          label="Add only Selected"
          iconName="add"
          className="!bg-background-color-3 px-4 text-lg text-font-color-black hover:border-background-color-3 dark:!bg-dark-background-color-3 dark:!text-font-color-black dark:hover:border-background-color-3"
          clickHandler={updateSelectedMetadata}
          isDisabled={isAtLeastOneSelected}
        />
        <Button
          label="Add All"
          iconName="done"
          className="!bg-background-color-3 px-4 text-lg text-font-color-black hover:border-background-color-3 dark:!bg-dark-background-color-3 dark:!text-font-color-black dark:hover:border-background-color-3"
          clickHandler={updateAllMetadata}
        />
      </div>
    </div>
  );
};

export default CustomizeSelectedMetadataPrompt;
