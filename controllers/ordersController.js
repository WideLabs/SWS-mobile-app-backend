const ordersDbService = require("../db/services/ordersService");
const httpStatusCodes = require("../utils/httpStatusCodes");

const addNewOrder = async (req, res, next) => {
  const { id_column_order, id_customer_order, id_takt, order_no, quantity } =
    req.body;

  if (
    !id_customer_order ||
    !id_column_order ||
    !id_takt ||
    !order_no ||
    !quantity
  ) {
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "Missing parameters in body.",
    });
  }

  await ordersDbService.addNewCustomerOrder(id_customer_order);

  await ordersDbService.addNewColumnOrder(
    id_column_order,
    id_customer_order,
    order_no,
    quantity
  );

  return res.status(httpStatusCodes.OK).json({ message: "Uspesno dodano" });
};

const getBlinds = async (req, res, next) => {
  try {
    const { id_column_order, id_takt } = req.query;

    const result = await ordersDbService.getTotalBlinds({
      id_column_order,
      id_takt,
    });

    const total = await ordersDbService.getFinishedBlinds({
      id_column_order,
      id_takt,
    });

    return res
      .status(httpStatusCodes.OK)
      .json({ blinds: result, totalFin: total });
  } catch (err) {
    next(err);
  }
};

const getBlindsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ message: "Missing query parameters. Both params required." });
    }

    const result = await eventsDbService.getBlindStatus(id);

    return res.status(httpStatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

const updateOrder = async (req, res, next) => {
  const { id_column_order, id_customer_order, id_takt } = req.body;
};

const getColumnOrderStatus = async (req, res, next) => {
  const { id_column_order, id_takt } = req.query;

  if (!id_column_order || !id_takt) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ message: "Missing query parameters. Both params required." });
  }

  const result = await ordersDbService.getColumnOrderStatus({
    id_column_order,
    id_takt,
  });

  if (result.length < 1) {
    return res
      .status(httpStatusCodes.OK)
      .json({ status: eventsStatusMap.mapActionToStatus("missing") });
  }

  return res.status(httpStatusCodes.OK).json(result);
};

module.exports = {
  addNewOrder,
  updateOrder,
  getBlinds,
};
