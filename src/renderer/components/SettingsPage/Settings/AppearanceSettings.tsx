/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';

import Img from 'renderer/components/Img';

import HomeImgLight from '../../../../../assets/images/webp/home-skeleton-light.webp';
import HomeImgDark from '../../../../../assets/images/webp/home-skeleton-dark.webp';
import HomeImgLightDark from '../../../../../assets/images/webp/home-skeleton-light-dark.webp';

type Props = { themeData?: AppThemeData };

const ThemeSettings = (props: Props) => {
  const { themeData: theme } = props;

  const focusInput = React.useCallback(
    (e: React.KeyboardEvent<HTMLLabelElement>) => {
      if (e.key === 'Enter') {
        const inputId = e.currentTarget.htmlFor;
        const inputElement = document.getElementById(inputId);
        inputElement?.click();
      }
    },
    []
  );

  return theme ? (
    <>
      <div className="title-container mt-1 mb-4 flex items-center text-2xl font-medium text-font-color-highlight dark:text-dark-font-color-highlight">
        <span className="material-icons-round-outlined mr-2">dark_mode</span>
        Appearance
      </div>
      <ul className="list-disc pl-6 marker:bg-font-color-highlight dark:marker:bg-dark-font-color-highlight">
        <li>
          <div className="description">
            Change the of the application as you need. We don&apos;t judge you
            for it.
          </div>
          <div className="theme-change-radio-btns flex max-w-3xl items-center justify-between pt-4 pl-4">
            <label
              htmlFor="lightThemeRadioBtn"
              tabIndex={0}
              className={`theme-change-radio-btn mb-2 flex cursor-pointer flex-col items-center rounded-md bg-background-color-2/75  p-6 outline-2 outline-offset-1 focus-within:!outline hover:bg-background-color-2 dark:bg-dark-background-color-2/75 dark:hover:bg-dark-background-color-2 ${
                !theme.useSystemTheme &&
                !theme.isDarkMode &&
                '!bg-background-color-3 dark:!bg-dark-background-color-3'
              }`}
              onKeyDown={focusInput}
            >
              <input
                type="radio"
                name="theme"
                className="peer invisible absolute -left-[9999px] mr-4"
                value="lightTheme"
                id="lightThemeRadioBtn"
                defaultChecked={!theme.useSystemTheme && !theme.isDarkMode}
                onClick={() => window.api.changeAppTheme('light')}
              />
              <Img src={HomeImgLight} className="w-40 shadow-md" />
              <span className="mt-4 peer-checked:!text-font-color-black dark:peer-checked:!text-font-color-black">
                Light Theme
              </span>
            </label>

            <label
              htmlFor="darkThemeRadioBtn"
              tabIndex={0}
              className={`theme-change-radio-btn mb-2 flex cursor-pointer flex-col items-center rounded-md bg-background-color-2/75  p-6 outline-2 outline-offset-1 focus-within:!outline hover:bg-background-color-2 dark:bg-dark-background-color-2/75 dark:hover:bg-dark-background-color-2 ${
                !theme.useSystemTheme &&
                theme.isDarkMode &&
                '!bg-background-color-3 dark:!bg-dark-background-color-3'
              }`}
              onKeyDown={focusInput}
            >
              <input
                type="radio"
                name="theme"
                className="peer invisible absolute -left-[9999px] mr-4"
                value="darkTheme"
                id="darkThemeRadioBtn"
                defaultChecked={!theme.useSystemTheme && theme.isDarkMode}
                onClick={() => window.api.changeAppTheme('dark')}
              />
              <Img src={HomeImgDark} className="w-40 shadow-md" />
              <span className="mt-4 peer-checked:!text-font-color-black dark:peer-checked:!text-font-color-black">
                Dark Theme
              </span>
            </label>

            <label
              htmlFor="systemThemeRadioBtn"
              tabIndex={0}
              className={`theme-change-radio-btn hover:bg-background-color mb-2 flex cursor-pointer flex-col items-center rounded-md bg-background-color-2/75 p-6 outline-2 outline-offset-1 focus-within:!outline dark:bg-dark-background-color-2/75 dark:hover:bg-dark-background-color-2 ${
                theme.useSystemTheme &&
                '!bg-background-color-3 dark:!bg-dark-background-color-3'
              } `}
              onKeyDown={focusInput}
            >
              <input
                type="radio"
                name="theme"
                className="peer invisible absolute -left-[9999px] mr-4"
                value="systemTheme"
                id="systemThemeRadioBtn"
                defaultChecked={theme.useSystemTheme}
                onClick={() => window.api.changeAppTheme('system')}
              />
              <Img src={HomeImgLightDark} className="w-40 shadow-md" />
              <span className="mt-4 peer-checked:!text-font-color-black dark:peer-checked:!text-font-color-black">
                System Theme
              </span>
            </label>
          </div>
        </li>
      </ul>
    </>
  ) : null;
};

export default ThemeSettings;
