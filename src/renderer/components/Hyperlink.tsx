import React from 'react';
import { AppContext } from 'renderer/contexts/AppContext';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import OpenLinkConfirmPrompt from './OpenLinkConfirmPrompt';

interface HyperlinkProp {
  link: string;
  linkTitle: string;
  noValidityCheck?: boolean;
  label: string | React.ReactElement;
  className?: string;
}

const Hyperlink = (props: HyperlinkProp) => {
  const { userData } = React.useContext(AppContext);
  const { changePromptMenuData } = React.useContext(AppUpdateContext);
  const { link, linkTitle, label, className, noValidityCheck } = props;

  const openLinkConfirmPrompt = React.useCallback(() => {
    if (noValidityCheck || userData?.preferences.doNotVerifyWhenOpeningLinks) {
      window.api.openInBrowser(link);
    } else
      changePromptMenuData(
        true,
        <OpenLinkConfirmPrompt link={link} title={linkTitle} />,
        'confirm-link-direct'
      );
  }, [
    changePromptMenuData,
    link,
    linkTitle,
    noValidityCheck,
    userData?.preferences.doNotVerifyWhenOpeningLinks,
  ]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <span
      className={`about-link w-fit cursor-pointer text-font-color-highlight-2 outline-1 outline-offset-1 hover:underline focus:!outline dark:text-dark-font-color-highlight-2 ${className}`}
      title={link}
      onClick={openLinkConfirmPrompt}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openLinkConfirmPrompt()}
    >
      {label}
    </span>
  );
};

Hyperlink.defaultProps = {
  noValidityCheck: false,
};

export default Hyperlink;
