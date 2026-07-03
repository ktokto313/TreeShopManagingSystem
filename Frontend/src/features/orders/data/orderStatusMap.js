const makeStyle = (color) =>
  `bg-${color}-500/10 text-${color}-600 border border-${color}-500/20`;

/** @type {Record<string, { bg: string, label: string }>} */
const ORDER_STATUS_MAP = {
  PENDING:        { bg: makeStyle('yellow'), label: 'Chờ xử lý' },
  PROCESSING:     { bg: makeStyle('blue'),   label: 'Đang xử lý' },
  DELIVERING:     { bg: makeStyle('cyan'),   label: 'Đang giao' },
  ARRIVED:        { bg: makeStyle('emerald'),label: 'Đã đến nơi' },
  RECEIVED:       { bg: makeStyle('green'),  label: 'Đã nhận' },
  RETURN_PENDING: { bg: makeStyle('orange'), label: 'Chờ hoàn trả' },
  RETURNING:      { bg: makeStyle('purple'), label: 'Đang hoàn trả' },
  FAILED:         { bg: makeStyle('red'),    label: 'Thất bại/Đã hủy' },
};

export default ORDER_STATUS_MAP;