import React, { CSSProperties } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import Genre from 'renderer/components/GenresPage/Genre';
import { AppContext } from 'renderer/contexts/AppContext';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import useResizeObserver from 'renderer/hooks/useResizeObserver';

type Props = { genreData: Genre[] };

const AllGenreResults = (prop: Props) => {
  const { currentlyActivePage } = React.useContext(AppContext);
  const { updateCurrentlyActivePageData } = React.useContext(AppUpdateContext);
  const { genreData } = prop;

  const scrollOffsetTimeoutIdRef = React.useRef(null as NodeJS.Timeout | null);
  const containerRef = React.useRef(null as HTMLDivElement | null);
  const { height, width } = useResizeObserver(containerRef);
  const MIN_ITEM_WIDTH = 320;
  const MIN_ITEM_HEIGHT = 180;
  const noOfColumns = Math.floor(width / MIN_ITEM_WIDTH);
  const noOfRows = Math.ceil((genreData ? genreData.length : 1) / noOfColumns);
  const itemWidth =
    MIN_ITEM_WIDTH + ((width % MIN_ITEM_WIDTH) - 10) / noOfColumns;

  const row = React.useCallback(
    (props: {
      columnIndex: number;
      rowIndex: number;
      style: CSSProperties;
    }) => {
      const { columnIndex, rowIndex, style } = props;
      const index = rowIndex * noOfColumns + columnIndex;
      // eslint-disable-next-line no-console
      if (genreData && index < genreData.length) {
        const { genreId, name, songs, backgroundColor, artworkPaths } =
          genreData[index];
        return (
          <div style={{ ...style, display: 'flex', justifyContent: 'center' }}>
            <Genre
              index={index}
              artworkPaths={artworkPaths}
              genreId={genreId}
              title={name}
              backgroundColor={backgroundColor}
              songIds={songs.map((song) => song.songId)}
            />
          </div>
        );
      }
      return <div style={style} />;
    },
    [genreData, noOfColumns]
  );

  return (
    <div
      className={`genres-container flex h-full flex-wrap ${
        !(genreData && genreData.length > 0) && 'hidden'
      }`}
      ref={containerRef}
    >
      {genreData && genreData.length > 0 && (
        <Grid
          columnCount={noOfColumns || 3}
          columnWidth={itemWidth}
          rowCount={noOfRows || 3}
          rowHeight={MIN_ITEM_HEIGHT}
          height={height || 300}
          width={width || 500}
          overscanRowCount={2}
          initialScrollTop={currentlyActivePage.data?.scrollTopOffset ?? 0}
          onScroll={(data) => {
            if (scrollOffsetTimeoutIdRef.current)
              clearTimeout(scrollOffsetTimeoutIdRef.current);
            if (!data.scrollUpdateWasRequested && data.scrollTop !== 0)
              scrollOffsetTimeoutIdRef.current = setTimeout(
                () =>
                  updateCurrentlyActivePageData((currentPageData) => ({
                    ...currentPageData,
                    scrollTopOffset: data.scrollTop,
                  })),
                500
              );
          }}
        >
          {row}
        </Grid>
      )}
    </div>
  );
};

export default AllGenreResults;
