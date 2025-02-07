/* eslint-disable jsx-a11y/label-has-associated-control */

type Props = {
  songYear?: number;
  updateSongInfo: (callback: (prevSongInfo: SongTags) => SongTags) => void;
};

const SongYearInput = (props: Props) => {
  const { songYear, updateSongInfo } = props;
  return (
    <div className="tag-input mb-6 flex w-[45%] min-w-[10rem] flex-col">
      <label htmlFor="song-year-id3-tag">Released Year</label>
      <input
        type="number"
        maxLength={4}
        minLength={4}
        id="song-year-id3-tag"
        className="mt-2 mr-2 w-[90%] rounded-3xl border-[.15rem] border-background-color-2 bg-background-color-1 py-3 px-4 text-font-color-black dark:border-dark-background-color-2 dark:bg-dark-background-color-1 dark:text-font-color-white"
        name="song-year"
        placeholder="Released Year"
        value={songYear ?? ''}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const releasedYear = Number(e.currentTarget.value);
          updateSongInfo(
            (prevData): SongTags => ({
              ...prevData,
              releasedYear: releasedYear ?? prevData.releasedYear,
            })
          );
        }}
      />
    </div>
  );
};

export default SongYearInput;
