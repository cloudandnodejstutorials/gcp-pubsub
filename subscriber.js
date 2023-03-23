const { PubSub } = require('@google-cloud/pubsub');

// Instantiates a client
const pubsub = new PubSub();

// Subscribe to a subscription
async function subscribeToSubscription(subscriptionName) {
    try {
        // Check if subscription exists
        const [subscription] = await pubsub.subscription(subscriptionName).get();
        if (!subscription) {
            console.error(`Subscription ${subscriptionName} not found.`);
            process.exitCode = 1;
            return;
        }

        // Listen for new messages
        subscription.on('message', message => {
            console.log(`Received message ${message.id}: ${message.data}`);
            message.ack();
        });
    } catch (error) {
        console.error(`Received error while subscribing: ${error.message}`);
        process.exitCode = 1;
    }
}
if (process.env.NODE_ENV !== "test")
    subscribeToSubscription('SUBSCRIPTION_NAME');

module.exports = {
    subscribeToSubscription
}