const { withGradleProperties } = require("@expo/config-plugins");

module.exports = function withNewArchEnabled(config) {
  return withGradleProperties(config, (config) => {
    const props = config.modResults;

    // remove any existing newArchEnabled entries
    const filtered = props.filter(
      (p) => !(p.type === "property" && p.key === "newArchEnabled")
    );

    // set newArchEnabled=true
    filtered.push({ type: "property", key: "newArchEnabled", value: "true" });

    config.modResults = filtered;
    return config;
  });
};
