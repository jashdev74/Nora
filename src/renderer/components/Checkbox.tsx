/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import React from 'react';

interface CheckboxProp {
  id: string;
  className?: string;
  isChecked: boolean;
  checkedStateUpdateFunction: (_state: boolean) => void;
  labelContent?: string;
  isDisabled?: boolean;
}

const Checkbox = React.memo((props: CheckboxProp) => {
  const {
    id,
    checkedStateUpdateFunction,
    isChecked,
    labelContent,
    className,
    isDisabled = false,
  } = props;

  const focusInput = React.useCallback(
    (e: React.KeyboardEvent<HTMLLabelElement>) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        const inputId = e.currentTarget.htmlFor;
        const inputElement = document.getElementById(inputId);
        inputElement?.click();
      }
    },
    []
  );

  return (
    <label
      htmlFor={id}
      className={`checkbox-and-labels-container mt-4 ml-2 flex !w-fit items-center outline-1 outline-offset-1 transition-opacity focus-visible:!outline ${
        isDisabled && 'pointer-events-none !cursor-pointer opacity-50'
      } ${className}`}
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={focusInput}
    >
      <input
        type="checkbox"
        name={id}
        id={id}
        className="peer hidden"
        checked={isChecked}
        onChange={(e) => checkedStateUpdateFunction(e.currentTarget.checked)}
      />
      <label
        className="checkmark flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 border-font-color-highlight bg-[transparent] shadow-lg peer-checked:bg-font-color-highlight dark:border-dark-font-color-highlight dark:peer-checked:bg-dark-font-color-highlight"
        htmlFor={id}
      >
        <span className="material-icons-round icon text-lg text-font-color-white opacity-0 dark:text-font-color-black">
          check
        </span>
      </label>
      {labelContent && (
        <label htmlFor={id} className="info ml-4 cursor-pointer">
          {labelContent}
        </label>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
