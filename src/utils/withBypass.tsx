import React, {
  Context,
  FC,
  useState,
  useContext,
  useMemo,
  useEffect,
  Dispatch,
  ComponentType,
  PropsWithChildren,
} from 'react';

interface BypassRef<T> {
  outbound: T;
  dispatch: Dispatch<T>;
}
const dummyDispatch = () => {};

export default function withBypass<P extends PropsWithChildren<any>>(
  bypass: Context<any>[],
  Component: ComponentType<P>,
) {
  const bypassLength = bypass.length || 0;

  const proxies = bypass.map((context) => {
    return function BypassProxy({ bypass }: { bypass: BypassRef<any> }) {
      /** 1. get value from outbound reconciler and set it to BypassRef.outbound as mutable value */
      const outbound = (bypass.outbound = useContext(context));
      /** 5. update inbound state if outbound value is changed */
      useEffect(() => bypass.dispatch(outbound), [outbound]);
      return null;
    };
  });

  const providers = bypass.map<FC<{ bypass: BypassRef<any> }>>((context) => {
    return function BypassProvider({ bypass, children }) {
      /** 2. create state with latest BypassRef.outbound as initial value */
      const [inbound, dispatch] = useState(bypass.outbound);
      /** 3. set dispatcher to BypassRef */
      bypass.dispatch = dispatch;
      /** 4. provide current inbound value */
      return <context.Provider value={inbound} children={children} />;
    };
  });

  return function ComponentWithBypass({ children, ...props }: P) {
    const refs = useMemo(() => {
      return Array.from({ length: bypassLength }).map<BypassRef<any>>(() => ({
        outbound: null as any,
        dispatch: dummyDispatch,
      }));
    }, []);

    const wrapped = providers.reduce((curr, Provider, i) => {
      return <Provider bypass={refs[i]} children={curr} />;
    }, <>{children}</>);
    return (
      <>
        {useMemo(() => proxies.map((Proxy, i) => <Proxy key={i} bypass={refs[i]} />), [])}
        <Component {...(props as P)} children={wrapped} />
      </>
    );
  };
}
