module.exports = {
    baseServicePort: process.env.BASE_SERVICE_PORT || 8000,
    gatewayPort: process.env.GATEWAY_PORT || 9000,
    gatewayPath: process.env.GATEWAY_PATH || '~/code/graphql-gateway',
    staticSessionName: process.env.STATIC_SESSION_NAME || 'orchestrator',
    randomiseSessionName: !!parseInt(process.env.RANDOMISE_SESSION_NAME) || false,
};
