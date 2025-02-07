/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import { AppContext } from '../../contexts/AppContext';
import Button from '../Button';
import MainContainer from '../MainContainer';

const PromptMenu = () => {
  const { PromptMenuData } = React.useContext(AppContext);
  const { changePromptMenuData } = React.useContext(AppUpdateContext);
  const promptMenuRef =
    React.useRef() as React.MutableRefObject<HTMLDialogElement>;

  const [isContentVisible, setIsContentVisible] = React.useState(
    PromptMenuData.isVisible
  );

  React.useEffect(() => {
    if (PromptMenuData.isVisible) setIsContentVisible(true);
  }, [PromptMenuData.isVisible]);

  React.useEffect(() => {
    if (PromptMenuData && promptMenuRef.current) {
      const { isVisible } = PromptMenuData;
      if (isVisible) {
        if (!promptMenuRef.current.open) promptMenuRef.current.showModal();
      }
    }
  }, [PromptMenuData]);

  React.useEffect(() => {
    const dialog = promptMenuRef.current;
    const manageDialogClose = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInDialog) changePromptMenuData(false, undefined, '');
    };

    const manageDialogAnimationEnd = () => {
      if (dialog && !PromptMenuData.isVisible) {
        dialog.close();
        setIsContentVisible(false);
      }
    };

    if (promptMenuRef.current) {
      promptMenuRef.current.addEventListener('click', manageDialogClose);
      promptMenuRef.current.addEventListener(
        'animationend',
        manageDialogAnimationEnd
      );
    }
    return () => {
      if (dialog) {
        dialog.removeEventListener('click', manageDialogClose);
        dialog.removeEventListener('animationend', manageDialogAnimationEnd);
      }
    };
  }, [PromptMenuData.isVisible, changePromptMenuData]);

  return (
    <dialog
      className={`dialog-menu relative top-1/2 left-1/2 h-fit max-h-[80%] min-h-[300px] w-[80%] min-w-[800px] max-w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-background-color-1 py-10 shadow-[rgba(100,100,111,0.2)_0px_7px_29px_0px] transition-[transform,visibility,opacity] duration-200 ease-in-out backdrop:backdrop-blur-[2px] open:backdrop:transition-[background,backdrop-filter] dark:bg-dark-background-color-1 
      ${
        PromptMenuData.isVisible
          ? 'open:animate-dialog-appear-ease-in-out open:backdrop:bg-[hsla(228deg,7%,14%,0.75)] open:backdrop:dark:bg-[hsla(228deg,7%,14%,0.75)]'
          : 'animate-dialog-dissappear-ease-in-out backdrop:bg-[hsla(228deg,7%,14%,0)] backdrop:dark:bg-[hsla(228deg,7%,14%,0)]'
      }
      `}
      id="prompt-menu"
      onClick={(e) => {
        e.stopPropagation();
      }}
      ref={promptMenuRef}
    >
      <Button
        className="prompt-menu-close-btn absolute top-4 right-4 !m-0 !rounded-none !border-0 !p-0 text-font-color-black outline-1 outline-offset-1 focus-visible:!outline dark:text-font-color-white"
        iconName="close"
        iconClassName="!leading-none !text-xl"
        clickHandler={(e) => {
          e.stopPropagation();
          changePromptMenuData(false, undefined, '');
        }}
      />
      <MainContainer
        className={`prompt-menu-inner relative max-h-full px-8 pb-2 text-font-color-black dark:text-font-color-white ${
          PromptMenuData.className ?? ''
        }`}
      >
        {isContentVisible && PromptMenuData.content}
      </MainContainer>
    </dialog>
  );
};

export default PromptMenu;
