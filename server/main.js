import { Meteor } from 'meteor/meteor';
import { loadInitialData } from '../infra/initial-data';
import { Communities } from '../communities/communities';
import { People } from '../people/people';
import { check } from 'meteor/check';

Meteor.startup(async () => {
  // DON'T CHANGE THE NEXT LINE
  await loadInitialData();

  // YOU CAN DO WHATEVER YOU WANT HERE
});

Meteor.publish('communities::list', () => Communities.find());
Meteor.publish('people::byCommunity', (community) =>
  People.find({ communityId: community })
);
Meteor.methods({
  checkIn({ personId }) {
    check(personId, String);

    People.updateAsync(personId, {
      $set: {
        checkIn: new Date().getTime(),
      },
    });
  },
  checkOut({ personId }) {
    check(personId, String);

    People.updateAsync(personId, {
      $set: {
        checkOut: new Date().getTime(),
      },
    });
  },
  async stats({ community }) {
    check(community, String);

    const pipeline0 = [
      {
        $match: {
          communityId: community,
          checkIn: { $exists: true },
          checkOut: { $exists: false },
        },
      },
      {
        $group: {
          _id: '$companyName',
          total: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];

    const pipeline1 = [
      {
        $match: {
          communityId: community,
          checkIn: { $exists: false },
        },
      },
      {
        $count: 'total',
      },
    ];

    const pipeline2 = [
      {
        $match: {
          communityId: community,
          checkIn: { $exists: true },
          checkOut: { $exists: false },
        },
      },
      {
        $count: 'total',
      },
    ];

    const raw = People.rawCollection();

    const [listPeopleByCompany, checkInMissing, onEvent] = await Promise.all([
      raw.aggregate(pipeline0).toArray(),
      raw.aggregate(pipeline1).toArray(),
      raw.aggregate(pipeline2).toArray(),
    ]);

    return {
      listPeopleByCompany,
      checkInMissing: checkInMissing[0]?.total,
      onEvent: onEvent[0]?.total,
    };
  },
});
