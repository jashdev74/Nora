import React from 'react';
import { Artist } from 'renderer/components/ArtistPage/Artist';
import Button from 'renderer/components/Button';
import SecondaryContainer from 'renderer/components/SecondaryContainer';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import { AppContext } from 'renderer/contexts/AppContext';

type Props = { artists: Artist[]; searchInput: string };

const ArtistsSearchResultsContainer = (props: Props) => {
  const { artists, searchInput } = props;
  const {
    isMultipleSelectionEnabled,
    multipleSelectionsData,
    currentlyActivePage,
  } = React.useContext(AppContext);
  const { toggleMultipleSelections, changeCurrentActivePage } =
    React.useContext(AppUpdateContext);

  const artistResults = React.useMemo(
    () =>
      artists.length > 0
        ? artists
            .map((artist, index) => {
              if (index < 5)
                return (
                  <Artist
                    index={index}
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${artist.artistId}-${index}`}
                    name={artist.name}
                    artworkPaths={artist.artworkPaths}
                    artistId={artist.artistId}
                    songIds={artist.songs.map((song) => song.songId)}
                    onlineArtworkPaths={artist.onlineArtworkPaths}
                    className="mb-4"
                    isAFavorite={artist.isAFavorite}
                  />
                );
              return undefined;
            })
            .filter((artist) => artist !== undefined)
        : [],
    [artists]
  );

  return (
    <SecondaryContainer
      className={`secondary-container artists-list-container mt-4 ${
        artistResults.length > 0
          ? 'active relative'
          : 'invisible absolute opacity-0'
      }`}
    >
      <>
        <div
          className={`title-container mt-1 mb-8 flex items-center pr-4 text-2xl font-medium text-font-color-highlight dark:text-dark-font-color-highlight ${
            artistResults.length > 0 && 'visible opacity-100'
          }`}
        >
          <div className="container flex">
            Artists{' '}
            <div className="other-stats-container ml-12 flex items-center text-xs">
              {artists && artists.length > 0 && (
                <span className="no-of-songs">{artists.length} results</span>
              )}
            </div>
          </div>
          <div className="other-controls-container flex">
            <Button
              label={
                isMultipleSelectionEnabled &&
                multipleSelectionsData.selectionType === 'artist'
                  ? 'Unselect All'
                  : 'Select'
              }
              className="select-btn text-sm md:text-lg md:[&>.button-label-text]:hidden md:[&>.icon]:mr-0"
              iconName={
                isMultipleSelectionEnabled &&
                multipleSelectionsData.selectionType === 'artist'
                  ? 'remove_done'
                  : 'checklist'
              }
              clickHandler={() =>
                toggleMultipleSelections(!isMultipleSelectionEnabled, 'artist')
              }
              isDisabled={
                isMultipleSelectionEnabled &&
                multipleSelectionsData.selectionType !== 'artist'
              }
              tooltipLabel={
                isMultipleSelectionEnabled ? 'Unselect All' : 'Select'
              }
            />
            {artists.length > 5 && (
              <Button
                label="Show All"
                iconName="apps"
                className="show-all-btn text-sm font-normal"
                clickHandler={() =>
                  currentlyActivePage.pageTitle === 'AllSearchResults' &&
                  currentlyActivePage.data.allSearchResultsPage.searchQuery ===
                    searchInput
                    ? changeCurrentActivePage('Home')
                    : changeCurrentActivePage('AllSearchResults', {
                        searchQuery: searchInput,
                        searchFilter: 'Artists' as SearchFilters,
                        searchResults: artists,
                      })
                }
              />
            )}
          </div>
        </div>
        <div className="artists-container mb-12 flex flex-wrap">
          {artistResults}
        </div>
      </>
    </SecondaryContainer>
  );
};

export default ArtistsSearchResultsContainer;
