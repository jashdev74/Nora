/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-nested-ternary */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react/destructuring-assignment */
import React, { useContext } from 'react';
import { AppContext } from 'renderer/contexts/AppContext';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import calculateTimeFromSeconds from 'renderer/utils/calculateTimeFromSeconds';
import { valueRounder } from 'renderer/utils/valueRounder';
import Img from '../Img';
import MainContainer from '../MainContainer';
import SecondaryContainer from '../SecondaryContainer';
import SongArtist from '../SongsPage/SongArtist';
import ListeningActivityBarGraph from './ListeningActivityBarGraph';
import SongStat from './SongStat';

const SongInfoPage = () => {
  const { currentlyActivePage } = useContext(AppContext);
  const { changeCurrentActivePage, updateBodyBackgroundImage } =
    React.useContext(AppUpdateContext);

  const [songInfo, setSongInfo] = React.useState<SongData>();
  const [listeningData, setListeningData] = React.useState<SongListeningData>();

  const { currentMonth, currentYear } = React.useMemo(() => {
    const currentDate = new Date();
    return {
      currentDate,
      currentYear: currentDate.getFullYear(),
      currentMonth: currentDate.getMonth(),
    };
  }, []);

  let songDuration = '0 seconds';

  if (songInfo) {
    const { minutes, seconds } = calculateTimeFromSeconds(songInfo.duration);
    if (minutes === 0) songDuration = `${seconds} seconds`;
    else songDuration = `${minutes} minutes ${seconds} seconds`;
  }

  const fetchSongInfo = React.useCallback(() => {
    if (currentlyActivePage.data && currentlyActivePage.data.songId) {
      console.time('fetchTime');
      window.api.getSongInfo([currentlyActivePage.data.songId]).then((res) => {
        console.log(`Time end : ${console.timeEnd('fetchTime')}`);
        if (res && res.length > 0) {
          if (res[0].isArtworkAvailable)
            updateBodyBackgroundImage(true, res[0].artworkPaths?.artworkPath);
          setSongInfo(res[0]);
        }
      });

      window.api
        .getSongListeningData([currentlyActivePage.data.songId])
        .then((res) => {
          if (res && res.length > 0) setListeningData(res[0]);
        });
    }
  }, [currentlyActivePage.data, updateBodyBackgroundImage]);

  React.useEffect(() => {
    fetchSongInfo();
    const manageSongInfoUpdatesInSongInfoPage = (e: Event) => {
      if ('detail' in e) {
        const dataEvents = (e as DetailAvailableEvent<DataUpdateEvent[]>)
          .detail;
        for (let i = 0; i < dataEvents.length; i += 1) {
          const event = dataEvents[i];
          if (
            event.dataType === 'songs' ||
            event.dataType === 'songs/listeningData' ||
            event.dataType === 'songs/listeningData/fullSongListens' ||
            event.dataType === 'songs/listeningData/inNoOfPlaylists' ||
            event.dataType === 'songs/listeningData/listens' ||
            event.dataType === 'songs/listeningData/skips' ||
            event.dataType === 'songs/likes'
          )
            fetchSongInfo();
        }
      }
    };
    document.addEventListener(
      'app/dataUpdates',
      manageSongInfoUpdatesInSongInfoPage
    );
    return () => {
      document.removeEventListener(
        'app/dataUpdates',
        manageSongInfoUpdatesInSongInfoPage
      );
    };
  }, [fetchSongInfo]);

  const songArtists = React.useMemo(
    () =>
      songInfo && songInfo.artists ? (
        songInfo.artists.length > 0 ? (
          songInfo.artists.map((artist, index) => (
            <>
              <SongArtist
                artistId={artist.artistId}
                name={artist.name}
                key={artist.artistId + index}
                className="ml-1"
              />

              {songInfo.artists && songInfo.artists.length - 1 !== index
                ? ', '
                : ''}
            </>
          ))
        ) : (
          <span>&apos;Unknown Artist&apos;</span>
        )
      ) : (
        'Unknown Artist'
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      currentlyActivePage.data.artistName,
      currentlyActivePage.pageTitle,
      songInfo?.artists,
    ]
  );

  const { allTimeListens, thisYearListens, thisMonthListens } =
    React.useMemo(() => {
      let allTime = 0;
      let thisYearNoofListens = 0;
      let thisMonthNoOfListens = 0;
      if (listeningData) {
        const { listens } = listeningData;

        allTime =
          listens
            .map((x) => x.months)
            .flat(2)
            .reduce((prevValue, currValue) => prevValue + (currValue || 0)) ||
          0;

        for (let i = 0; i < listens.length; i += 1) {
          if (listens[i].year === currentYear) {
            thisYearNoofListens =
              listens[i].months
                .flat(2)
                .reduce(
                  (prevValue, currValue) => prevValue + (currValue || 0)
                ) || 0;

            thisMonthNoOfListens = listens[i].months[currentMonth].reduce(
              (prevValue, currValue) => prevValue + (currValue || 0)
            );
            console.log('thisMonth', thisMonthNoOfListens);
          }
        }
      }
      return {
        allTimeListens: allTime,
        thisYearListens: thisYearNoofListens,
        thisMonthListens: thisMonthNoOfListens,
      };
    }, [currentMonth, currentYear, listeningData]);

  const { totalSongFullListens, totalSongSkips } = React.useMemo(() => {
    if (listeningData) {
      const { fullListens = 0, skips = 0 } = listeningData;
      return {
        totalSongFullListens: valueRounder(fullListens),
        totalSongSkips: valueRounder(skips),
      };
    }
    return { totalSongFullListens: 0, totalSongSkips: 0 };
  }, [listeningData]);

  return (
    <>
      {songInfo && (
        <MainContainer className="song-information-container pt-8">
          <>
            <div className="appear-from-bottom container flex">
              <div className="song-cover-container mr-8 h-60 w-fit overflow-hidden rounded-md">
                <Img
                  src={songInfo.artworkPaths?.artworkPath}
                  alt={`${songInfo.title} cover`}
                  className="h-full object-cover"
                />
              </div>
              <div className="song-info flex max-w-[70%] flex-col justify-center text-font-color-black dark:text-font-color-white">
                <div
                  className="title info-type-1 mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-5xl font-medium text-font-color-highlight dark:text-dark-font-color-highlight"
                  title={songInfo.title}
                >
                  {songInfo.title}
                </div>
                <div className="song-artists info-type-2 mb-1 flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-base">
                  {songArtists}
                </div>
                <div
                  className="info-type-2 mb-5 overflow-hidden text-ellipsis whitespace-nowrap hover:underline"
                  title={songInfo.album ? songInfo.album.name : 'Unknown Album'}
                  onClick={() => {
                    if (songInfo.album) {
                      return currentlyActivePage.pageTitle === 'AlbumInfo' &&
                        currentlyActivePage.data.albumId === songInfo.album.name
                        ? changeCurrentActivePage('Home')
                        : changeCurrentActivePage('AlbumInfo', {
                            albumId: songInfo.album.albumId,
                          });
                    }
                    return undefined;
                  }}
                >
                  {songInfo.album ? songInfo.album.name : 'Unknown Album'}
                </div>
                <div
                  className="info-type-3 mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm"
                  title={songDuration}
                >
                  {songDuration}
                </div>

                {songInfo && songInfo.sampleRate && (
                  <div className="info-type-3 mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                    {songInfo.sampleRate / 1000} KHZ
                  </div>
                )}

                {songInfo && songInfo.bitrate && (
                  <div className="info-type-3 mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                    {Math.floor(songInfo.bitrate / 1000)} Kbps
                  </div>
                )}
              </div>
            </div>
            {listeningData && (
              <SecondaryContainer className="secondary-container song-stats-container mt-8 flex h-fit flex-row flex-wrap rounded-2xl p-2">
                <div className="flex items-center justify-between py-4">
                  <ListeningActivityBarGraph listeningData={listeningData} />
                  <div className="flex w-fit flex-wrap">
                    <SongStat
                      key={0}
                      title="All time Listens"
                      value={valueRounder(allTimeListens)}
                    />
                    <SongStat
                      key={1}
                      title="Listens This Month"
                      value={valueRounder(thisMonthListens)}
                    />
                    <SongStat
                      key={2}
                      title="Listens This Year"
                      value={valueRounder(thisYearListens)}
                    />
                    <SongStat
                      key={3}
                      title={
                        songInfo.isAFavorite
                          ? 'You loved this song'
                          : "You didn't like this song"
                      }
                      value={
                        <span
                          className={`${
                            songInfo.isAFavorite
                              ? 'material-icons-round'
                              : 'material-icons-round-outlined'
                          } icon ${
                            songInfo.isAFavorite && 'liked'
                          } text-[3.5rem] font-semibold`}
                        >
                          favorite
                        </span>
                      }
                    />
                    <SongStat
                      key={4}
                      title="Total Song Skips"
                      value={totalSongSkips}
                    />
                    <SongStat
                      key={5}
                      title="Full Song Listens"
                      value={totalSongFullListens}
                    />
                  </div>
                </div>
              </SecondaryContainer>
            )}
          </>
        </MainContainer>
      )}
    </>
  );
};

SongInfoPage.displayName = 'SongInfoPage';
export default SongInfoPage;
