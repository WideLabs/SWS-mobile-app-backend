const eventsStatusMap = {
  missing: "none",
  start: "inProgress",
  pause: "paused",
  finish: "finished",
  mapActionToStatus(action) {
    return eventsStatusMap[action.toLowerCase()];
  },
};

module.exports = eventsStatusMap;
