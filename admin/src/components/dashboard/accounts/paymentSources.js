// How a payment source identifies the payer on the payment form
export const SOURCE_LINK_TYPES = [
  { value: 'client', label: 'Client & Project', hint: 'Pick a client, then one of their projects' },
  { value: 'none', label: 'Free Text', hint: 'Type the payer name by hand' },
];

// Built-in source: payments from clients settle against a client project, so it cannot be removed
export const CLIENT_PAYMENT_SOURCE = {
  id: 'ps-client',
  name: 'Client',
  description: 'Payment received from a client against one of their projects.',
  linkType: 'client',
  status: 'Active',
  system: true,
  linkedPaymentsCount: 0,
  totalReceived: 0,
};

export const getSourceLinkLabel = (linkType) =>
  SOURCE_LINK_TYPES.find((lt) => lt.value === linkType)?.label || 'Free Text';

// Display name for a client record, whichever naming field the API filled
export const getClientName = (c) => c?.business_name || c?.client_name || c?.name || c?.client_key || 'Unnamed Client';

export const getClientProjects = (c) => (Array.isArray(c?.projects) ? c.projects : []);
