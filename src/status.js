function getStatusMessage(name = 'Codex') {
  const target = (name && name.trim()) || 'Codex';
  return `Status: ${target} systems nominal.`;
}

module.exports = { getStatusMessage };
