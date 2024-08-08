import React from 'react';
import { Meteor } from 'meteor/meteor';
import { AppContext } from './App';

export const Stat = ({ community }) => {
  const { REFRESH } = React.useContext(AppContext);
  const [stats, setStats] = React.useState({
    checkInMissing: 0,
    onEvent: 0,
    listPeopleByCompany: [],
  });

  React.useEffect(() => {
    Meteor.call('stats', { community }, (_err, data) => {
      if (data) {
        setStats(data);
      }
    });
  }, [community, REFRESH]);

  return (
    <div className="my-10">
      <p>
        People not checked in:{' '}
        <span className="font-bold">{stats.checkInMissing}</span>
      </p>
      <p>
        People in the event right now:{' '}
        <span className="font-bold">{stats.onEvent}</span>
      </p>
      <p>
        People by company in the event right now:{' '}
        <span className="text-sm">
          {stats.listPeopleByCompany.map(
            (item) => `${item._id ?? 'Unknown'} (${item.total}), `
          )}
        </span>
      </p>
    </div>
  );
};
