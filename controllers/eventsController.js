const moment = require("moment");
const eventsDbService = require("../db/services/eventsService");
const usersDbService = require("../db/services/usersService");
const httpStatusCodes = require("../utils/httpStatusCodes");
const eventsStatusMap = require("../utils/eventsStatusMap");
const { calcElapsedTimeBetweenEvents } = require("../utils/dateAndTimeUtils");

// Route GET /events
// Desc Returns all event in db
const getEvents = async (req, res, next) => {
  try {
    const results = await eventsDbService.getAllEvents();
    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

// Route GET /events/:id
// Desc Return event with specified id
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await eventsDbService.getEventById(id);

    if (results.length < 1) {
      return res
        .status(httpStatusCodes.NOT_FOUND)
        .json({ message: `Event not found by id: {${id}}.` });
    }

    return res.status(httpStatusCodes.OK).json(results);
  } catch (error) {}
};

// Route GET /events/query/all
// Desc Returns all event specified with query params (atleast one param must be provided)
// Params id_work_order, id_column_order, id_takt
const getEventsByQueryParams = async (req, res, next) => {
  try {
    const { id_work_order, id_column_order, id_takt } = req.query;

    // Check if atleast on query param is provided
    if (!id_work_order && !id_column_order && !id_takt) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        message:
          "Missing query parameters. Atleast one param must be provided.",
      });
    }

    let results = await eventsDbService.getAllEventsWithParams({
      id_work_order,
      id_column_order,
      id_takt,
    });

    // Format times
    // TODO sth with the time formats?
    if (results.length > 0) {
      results = results.map(({ time, ...rest }) => {
        return { ...rest, time: moment(time).format("YYYY-MM-DD HH:mm:ss") };
      });
    }

    // If no results return empty array.
    return res.status(httpStatusCodes.OK).json(results);
  } catch (error) {
    next(error);
  }
};

// Route GET /events/query/recent
// Desc Returns the most recent event specified with query params (atleast one param must be provided)
// Params id_work_order, id_column_order, id_takt
const getMostRecentEventByQueryParams = async (req, res, next) => {
  try {
    const { id_column_order, id_takt } = req.query;

    // Check if atleast on query param is provided
    if (!id_column_order && !id_takt)
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        message:
          "Missing query parameters. Atleast one param must be provided.",
      });

    const result = await eventsDbService.getMostRecentEventWithParams({
      id_column_order,
      id_takt,
    });

    if (!result) {
      return res
        .status(httpStatusCodes.NOT_FOUND)
        .json({ message: "No events found with specified query params." });
    }

    const timeFormated = moment(result.time).format("YYYY-MM-DD HH:mm:ss");
    result.time = timeFormated;

    return res.status(httpStatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

// Route GET /events/query/all/time
// Desc Calc elapsed time of results
const getElapsedTimeOfEventsWithQueryParams = async (req, res, next) => {
  try {
    const { id_blind } = req.query;

    if (!id_blind) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ message: "Missing query parameters. Both params required" });
    }

    const results = await eventsDbService.getAllEventsWithParams({
      id_blind,
    });

    if (results.length < 2) {
      return res
        .status(httpStatusCodes.NOT_FOUND)
        .json({ message: "Not enough results." });
    }

    const total_elapsed_time = calcElapsedTimeBetweenEvents(results);
    return res.status(httpStatusCodes.OK).json({
      results,
      total_elapsed_time,
      total_elapsed_time_str: total_elapsed_time.toString(),
    });
  } catch (error) {
    next(error);
  }
};

// Route GET /events/status
// Desc Returns the status specified with query params (all params must be provided)
// Params id_column_order, id_takt
const getStatusOfTaskByQueryParams = async (req, res, next) => {
  try {
    const { id_column_order, id_takt, piece_num } = req.query;

    if (!id_column_order || !id_takt || !piece_num) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ message: "Missing query parameters. Both params required." });
    }

    const result = await eventsDbService.getRecentEvent({
      id_column_order,
      id_takt,
      piece_num,
    });

    // No event for specified task found. Work hasnt started yet.
    if (!result) {
      return res
        .status(httpStatusCodes.OK)
        .json({ status: eventsStatusMap.mapActionToStatus("missing") });
    }
    const user = await usersDbService.getUserById(result.id_mobile_user);

    return res.status(httpStatusCodes.OK).json({
      status: eventsStatusMap.mapActionToStatus(result.action),
      user: {
        id_user: result.id_mobile_user,
        username: user.username,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getStatusOfBlind = async (req, res, next) => {
  const { id } = req.params;

  const result = await eventsDbService.getRecentEvent({ id });

  if (!result) {
    res.json({ lastAction: "none", startTime: null });
  } else {
    const start = await eventsDbService.getStartTime({ id });

    console.log(start);

    console.log(result);

    res.json({ lastAction: result.action, startTime: start.time });
  }
};

const getRecentUserEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const blinds = await eventsDbService.getUnifinishedUserBlinds({
      id_mobile_user: id,
    });

    console.log(blinds);

    res.status(httpStatusCodes.OK).json({ blinds: blinds });
  } catch (err) {
    next(err);
  }
};

// Route POST /events
// Desc Adds new event based on values provided in request body
const addEvent = async (req, res, next) => {
  try {
    const {
      id_customer_order,
      id_column_order,
      id_takt,
      action,
      id_mobile_user,
      order_no,
      quantity,
      id_blind,
    } = req.body;

    if (
      !id_column_order ||
      !id_takt ||
      !action ||
      !id_mobile_user ||
      !id_customer_order ||
      !order_no ||
      !quantity ||
      !id_blind
    ) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ message: "Bad request. Missing properties in body." });
    }

    if (!["start", "pause", "finish"].includes(action.toLowerCase())) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ message: "Bad request. Invalid action." });
    }

    const TIME_FORMATED = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");

    const lastAddedEvent = await eventsDbService.getRecentEvent({
      id_blind,
    });

    console.log("last event", lastAddedEvent);

    // No previous event for task. Start new task.
    if (!lastAddedEvent) {
      // Tried to pause/end task that hasnt started yet.
      if (action.toLowerCase() !== "start") {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          message:
            "Bad request. Can't pause/finish task that has not started yet.",
        });
      }

      const newEventId = await eventsDbService.addNewEvent(
        id_customer_order,
        id_column_order,
        id_takt,
        id_mobile_user,
        TIME_FORMATED,
        "START",
        id_blind
      );
      return res.status(httpStatusCodes.OK).json({
        message: "New event added successfuly.",
        action: "START",
        at: TIME_FORMATED,
        id_timed_event: newEventId,
        new_start: true,
      });
    } // TODO MAYBE ELSE {}

    // If previous event was to finish task.
    if (lastAddedEvent.action.toLowerCase() === "finish") {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ message: "Bad request. Task is already finished." });
    }

    // If previous action was start, only next allowed actions are "PAUSE" and "FINISH"
    if (lastAddedEvent.action.toLowerCase() === "start") {
      // If current action is "start" return
      if (action.toLowerCase() === "start") {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          message: "Bad request. Action is same as previous on task.",
        });
      }
      // If current action is "pause" add new pause event.
      if (action.toLowerCase() === "pause") {
        const newEventId = await eventsDbService.addNewEvent(
          id_customer_order,
          id_column_order,
          id_takt,
          id_mobile_user,
          TIME_FORMATED,
          "PAUSE",
          id_blind
        );
        return res.status(httpStatusCodes.OK).json({
          message: "New event added successfuly.",
          action: "PAUSE",
          at: TIME_FORMATED,
          id_timed_event: newEventId,
        });
      }
      // If current action is "finish" add new finish event and calculate elapse time.
      // TODO ELAPSED TIME CALC UTIL
      const newEventId = await eventsDbService.addNewEvent(
        id_customer_order,
        id_column_order,
        id_takt,
        id_mobile_user,
        TIME_FORMATED,
        "FINISH",
        id_blind
      );

      /* await eventsDbService.finishColumnOrder({ id_column_order, id_takt }); */

      const correspondingEvents = await eventsDbService.getAllEventsWithParams({
        id_blind,
      });
      // Safeguard but with proper use this should never happen
      if (correspondingEvents.length < 2) {
        return next(
          new Error("Elapsed time calculation failed. Unexpected server error.")
        );
      }

      const total_elapsed_time =
        calcElapsedTimeBetweenEvents(correspondingEvents);
      return res.status(httpStatusCodes.OK).json({
        message: "New event added successfuly.",
        action: "FINISH",
        at: TIME_FORMATED,
        id_timed_event: newEventId,
        all_events: correspondingEvents,
        total_elapsed_time,
        total_elapsed_time_str: total_elapsed_time.toString(),
      });
    }
    // Only action that remains to be checked on last event is pause
    if (lastAddedEvent.action.toLowerCase() === "pause") {
      // Can't pause an already paused event.
      if (action.toLowerCase() === "pause") {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          message: "Bad request. Action is same as previous on task.",
        });
      }
      // Can't finish an event currently on pause.
      if (action.toLowerCase() === "finish") {
        return res.status(httpStatusCodes.BAD_REQUEST).json({
          message: "Bad request. Can't finish task that is on pause.",
        });
      }
      const newEventId = await eventsDbService.addNewEvent(
        id_customer_order,
        id_column_order,
        id_takt,
        id_mobile_user,
        TIME_FORMATED,
        "START",
        id_blind
      );
      return res.status(httpStatusCodes.OK).json({
        message: "New event added successfuly.",
        action: "START",
        at: TIME_FORMATED,
        id_timed_event: newEventId,
        new_start: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  getEventsByQueryParams,
  getRecentUserEvent,
  getMostRecentEventByQueryParams,
  getElapsedTimeOfEventsWithQueryParams,
  getStatusOfTaskByQueryParams,
  addEvent,
  getStatusOfBlind,
};
