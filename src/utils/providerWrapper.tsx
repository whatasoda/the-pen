import React, { FC, useMemo } from 'react';

const providerWrapper = (providers: FC[]): FC => {
  return function WrappedProvider({ children }) {
    return useMemo(() => {
      return providers.reduce<JSX.Element>((child, Provider) => {
        return <Provider children={child} />;
      }, children as JSX.Element);
    }, [children]);
  };
};

export default providerWrapper;
