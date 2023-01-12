const moment = require("moment");

const elapsedTimeObject = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  add(h, m, s) {
    this.hours += h;
    this.minutes += m;
    if (this.minutes > 60) {
      this.hours += 1;
      this.minutes -= 60;
    }
    this.seconds += s;
    if (this.seconds > 60) {
      this.minutes += 1;
      this.seconds -= 60;
    }
  },
  toString() {
    return [this.hours, this.minutes, this.seconds]
      .map((val) => {
        return val < 10 ? "0".concat(val.toString()) : val.toString();
      })
      .join(":");
  },
};

const formatDateAndTime = (dateTime) => {
  return moment(dateTime, "YYYY-MM-DD HH:mm:ss");
};

const getDifferenceOfTwoDateTimes = (dateTime1, dateTime2) => {
  dateTime1 = moment.isMoment(dateTime1) ? dateTime1 : moment(dateTime1);
  dateTime2 = moment.isMoment(dateTime2) ? dateTime2 : moment(dateTime2);

  return moment.duration(dateTime2.diff(dateTime1));
};

const calcElapsedTimeBetweenEvents = (events) => {
  let totalElapsedTime = Object.create(elapsedTimeObject);

  for (let i = 0; i < events.length - 1; i++) {
    const event1 = events[i];
    if (event1.action.toLowerCase() === "finish") break;
    if (event1.action.toLowerCase() === "pause") continue;
    const event2 = events[i + 1];

    const diff = getDifferenceOfTwoDateTimes(event1.time, event2.time);

    totalElapsedTime.add(diff.hours(), diff.minutes(), diff.seconds());
  }

  return totalElapsedTime;
};

module.exports = {
  formatDateAndTime,
  getDifferenceOfTwoDateTimes,
  calcElapsedTimeBetweenEvents,
};
