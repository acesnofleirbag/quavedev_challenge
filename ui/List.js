import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { People } from '../people/people';
import { Meteor } from 'meteor/meteor';
import { AppContext } from './App';

const DateUtility = {
  fmt(date) {
    return (
      date &&
      new Date(date).toLocaleTimeString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hourCycle: 'h23',
        minute: '2-digit',
        hour: '2-digit',
      })
    );
  },
  isDate5SecondsOnFuture(date) {
    return new Date(date + 5000).getTime() < new Date().getTime();
  },
};

export const List = ({ community }) => {
  const { SET_REFRESH } = React.useContext(AppContext);
  const [, setFlag] = React.useState(false);
  const { data: people, isLoading } = useTracker(() => {
    const subscription = Meteor.subscribe('people::byCommunity', community);

    return {
      data: People.find({ communityId: community }).fetch(),
      isLoading: !subscription.ready(),
    };
  }, [community]);

  function handleCheckIn(id) {
    Meteor.call('checkIn', { personId: id });
  }

  function handleCheckOut(id) {
    Meteor.call('checkOut', { personId: id });
  }

  // WARN(workaround): Maybe MeteorJS.Tracker resolve
  function tracker() {
    setTimeout(() => setFlag((state) => !state), 5000);
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <table className="w-full border-separate rounded border border-solid border-neutral-200 p-2">
      <thead>
        <tr>
          <th className="text-left">Name</th>
          <th className="text-left">Company</th>
          <th className="text-left">Title</th>
          <th className="min-w-[200px] text-left">Check-In</th>
          <th className="min-w-[200px] text-left">Check-Out</th>
          <th className="min-w-[200px]">{}</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person, index) => (
          <tr
            key={person._id}
            className={`${index % 2 === 0 && 'bg-neutral-100'} cursor-default hover:bg-neutral-300`}
          >
            <td className="p-2">
              {person.firstName} {person.lastName}
            </td>
            <td className="p-2">{person.companyName}</td>
            <td className="p-2">{person.title}</td>
            <td className="p-2">{DateUtility.fmt(person.checkIn) ?? 'N/A'}</td>
            <td className="p-2">{DateUtility.fmt(person.checkOut) ?? 'N/A'}</td>
            <td className="flex justify-center p-2">
              {person.checkIn &&
                DateUtility.isDate5SecondsOnFuture(person.checkIn) &&
                !person.checkOut && (
                  <button
                    className="rounded bg-yellow-700 px-4 py-1 font-bold text-white"
                    onClick={() => {
                      handleCheckOut(person._id);
                      SET_REFRESH((state) => !state);
                    }}
                  >
                    Check-Out
                  </button>
                )}

              {!person.checkIn && (
                <button
                  className="rounded bg-lime-700 px-4 py-1 font-bold text-white"
                  onClick={() => {
                    handleCheckIn(person._id);
                    tracker();
                    SET_REFRESH((state) => !state);
                  }}
                >
                  Check-In
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
