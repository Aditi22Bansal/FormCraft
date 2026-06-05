const success = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, data, message });

const fail = (res, message = 'Error', status = 400) =>
  res.status(status).json({ success: false, data: null, message });

module.exports = { success, fail };
