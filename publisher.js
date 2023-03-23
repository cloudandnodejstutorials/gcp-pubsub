const { PubSub } = require('@google-cloud/pubsub');
const pubsub = new PubSub();

async function publishMessage(topicName, data) {
    const dataBuffer = Buffer.from(JSON.stringify(data));
    const messageId = await pubsub
        .topic(topicName)
        .publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
}
if (process.env.NODE_ENV !== "test")
    publishMessage('TOPIC_NAME', { message: 'Hello World' });
module.exports = {
    publishMessage
}
