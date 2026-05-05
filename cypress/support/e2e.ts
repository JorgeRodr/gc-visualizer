/// <reference types="cypress" />

// Suppress benign uncaught exceptions thrown by ResizeObserver inside React Flow
// during drag operations — they are not real failures.
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("ResizeObserver loop") ||
    err.message.includes("ResizeObserver is not defined")
  ) {
    return false;
  }
  return undefined;
});
