const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        supportFile: '/scenarios/default-greenframe-config/support/e2e.ts',
    },
});
