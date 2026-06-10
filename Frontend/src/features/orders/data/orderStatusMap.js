const makeStyle = (color) =>
  `bg-${color}-500/10 text-${color}-600 border border-${color}-500/20`;

/** @type {Record<string, { bg: string, label: string }>} */
const ORDER_STATUS_MAP = {
  PENDING:        { bg: makeStyle('yellow'), label: 'Pending' },
  PROCESSING:     { bg: makeStyle('blue'),   label: 'Processing' },
  DELIVERING:     { bg: makeStyle('cyan'),   label: 'Delivering' },
  ARRIVED:        { bg: makeStyle('emerald'),label: 'Arrived' },
  RECEIVED:       { bg: makeStyle('green'),  label: 'Received' },
  RETURN_PENDING: { bg: makeStyle('orange'), label: 'Return Pending' },
  RETURNING:      { bg: makeStyle('purple'), label: 'Returning' },
  FAILED:         { bg: makeStyle('red'),    label: 'Failed' },
};

export default ORDER_STATUS_MAP;