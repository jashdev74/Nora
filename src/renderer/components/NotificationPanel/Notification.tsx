import React from 'react';
import { AppContext } from 'renderer/contexts/AppContext';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import Button from '../Button';

const Notification = (props: AppNotification) => {
  const {
    id,
    content,
    delay,
    buttons,
    icon,
    type = 'DEFAULT',
    progressBarData = { max: 100, value: 50 },
  } = props;
  const { userData } = React.useContext(AppContext);
  const { updateNotifications } = React.useContext(AppUpdateContext);

  const notificationRef = React.useRef(null as HTMLDivElement | null);
  const notificationTimeoutIdRef = React.useRef(
    undefined as NodeJS.Timeout | undefined
  );
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  const notificationPanelStyles: any = {};
  notificationPanelStyles['--loading-bar-width'] = `${dimensions.width - 35}px`;
  notificationPanelStyles['--loading-bar-progress'] = `${
    (progressBarData.value / progressBarData.max) * 100
  }%`;

  const removeNotification = React.useCallback(() => {
    if (notificationTimeoutIdRef.current)
      clearTimeout(notificationTimeoutIdRef.current);
    if (notificationRef.current && !userData?.preferences?.isReducedMotion) {
      notificationRef.current.classList.add('disappear-to-bottom');
      notificationRef.current.addEventListener('animationend', () =>
        updateNotifications((currNotifications) =>
          currNotifications.filter((x) => x.id !== id)
        )
      );
    } else
      updateNotifications((currNotifications) =>
        currNotifications.filter((x) => x.id !== id)
      );
  }, [id, updateNotifications, userData?.preferences?.isReducedMotion]);

  React.useLayoutEffect(() => {
    if (notificationRef.current) {
      setDimensions({
        width: notificationRef.current.offsetWidth,
        height: notificationRef.current.offsetHeight,
      });
      notificationTimeoutIdRef.current = setTimeout(
        removeNotification,
        delay ?? 5000
      );
    }
    return () => {
      if (notificationTimeoutIdRef.current)
        clearTimeout(notificationTimeoutIdRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (notificationRef?.current?.classList.contains('disappear-to-bottom')) {
        clearTimeout(notificationTimeoutIdRef.current);
        updateNotifications((currNotifications) =>
          currNotifications.filter((x) => x.id !== id)
        );
      }
    };
  }, [delay, id, removeNotification, updateNotifications]);
  return (
    <div
      className="notification appear-from-bottom group mt-4 flex h-fit max-h-32 min-h-[50px] w-fit min-w-[300px] max-w-sm justify-between rounded-2xl bg-context-menu-background py-2 text-sm font-light text-font-color-black shadow-[5px_25px_50px_0px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-[opacity,transform,visibility] ease-in-out dark:bg-dark-context-menu-background dark:text-font-color-white"
      id="notificationPanelsContainer"
      ref={notificationRef}
      style={notificationPanelStyles}
    >
      <div
        className={`notification-info-and-buttons-container mr-4 flex w-fit flex-col px-2 group-hover:mr-0 ${
          !(Array.isArray(buttons) && buttons.length > 0) && 'items-center'
        }`}
      >
        <div className="notification-info-container flex flex-row items-center">
          <div className="icon-container mx-3 flex items-center justify-center [&>img]:aspect-square [&>img]:h-4 [&>span]:text-xl">
            {icon}
          </div>
          <div className="message-container overflow-hidden text-ellipsis py-1">
            {content}
          </div>
        </div>
        {Array.isArray(buttons) && buttons.length > 0 && (
          <div className="buttons-container flex justify-end">
            {buttons.map((button) => (
              <Button
                key={`notificationPanelButton-${button.label}`}
                label={button.label}
                iconName={button.iconName}
                iconClassName={button.iconClassName}
                className={`mt-2 mb-1 mr-0 ml-4 border-2 px-2 py-1 font-medium text-background-color-3 dark:border-background-color-2 dark:text-background-color-2 ${button.className}`}
                clickHandler={(e, setIsDisabled, setIsPending) => {
                  removeNotification();
                  button.clickHandler(e, setIsDisabled, setIsPending);
                }}
              />
            ))}
          </div>
        )}
        {type === 'WITH_PROGRESS_BAR' && progressBarData && (
          <div className="notification-loading-bar relative mt-2 ml-4 h-1 w-[97%] flex-grow overflow-hidden rounded-sm bg-font-color-highlight/10 before:absolute before:h-1 before:w-[var(--loading-bar-progress)] before:rounded-sm before:bg-font-color-highlight/50 before:content-[''] dark:bg-dark-font-color-highlight/20 dark:before:bg-dark-font-color-highlight" />
        )}
      </div>
      <div className="close-button-container relative flex w-0 flex-col items-center justify-center overflow-hidden transition-[width] delay-200 group-hover:w-12 ">
        <span
          className="material-icons-round icon rounded-md p-2 text-lg hover:bg-background-color-dimmed hover:text-[crimson] dark:hover:bg-dark-background-color-1 dark:hover:text-[crimson]"
          onClick={removeNotification}
          onKeyDown={removeNotification}
          role="button"
          tabIndex={0}
        >
          close
        </span>
      </div>
      {/* {type === 'WITH_PROGRESS_BAR' && progressBarData && (
        <div className="progress-indicator relative bottom-0 h-2 w-full rounded-sm bg-font-color-highlight dark:bg-dark-font-color-highlight" />
      )} */}
    </div>
  );
};

Notification.displayName = 'Notification';
export default Notification;
