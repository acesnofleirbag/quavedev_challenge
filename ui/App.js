import React, { createContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Communities } from '../communities/communities';
import { List } from './List';
import { Stat } from './Stat';

export const AppContext = createContext({
  REFRESH: false,
  SET_REFRESH: () => {},
});

const AppProvider = ({ children }) => {
  // WARN(workaround): Maybe MeteorJS.Tracker resolve
  const [REFRESH, SET_REFRESH] = React.useState(false);

  const value = React.useMemo(
    () => ({
      REFRESH,
      SET_REFRESH,
    }),
    [REFRESH]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const App = () => {
  const [community, setCommunity] = React.useState();

  const { data: communities, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('communities::list');

    return {
      data: Communities.find().fetch(),
      isLoading: !subscription.ready(),
    };
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold">Event Check-in</h1>

      <div className="flex items-center justify-center">
        <select
          id=""
          name=""
          className="rounded px-4 py-2"
          onChange={(e) => setCommunity(e.target.value)}
          defaultValue=""
        >
          <option disabled value="">
            Select an event
          </option>
          {communities.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {community && (
        <AppProvider>
          <Stat community={community} />
          <List community={community} />
        </AppProvider>
      )}
    </div>
  );
};
