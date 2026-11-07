// Step-scoped MCP tool visibility and execution admission.
let controller;
export function setMcpToolAdmission(check) {
  if (typeof check !== 'function') throw new TypeError('MCP admission controller must be a function');
  const previous = controller;
  controller = check;
  return () => { if (controller === check) controller = previous; };
}
export function isMcpToolAdmitted(name, sessionId) {
  return controller === undefined || controller(name, sessionId) === true;
}
