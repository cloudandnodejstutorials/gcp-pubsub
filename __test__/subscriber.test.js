
const assert = require('assert');
const { PubSub } = require('@google-cloud/pubsub');
const { subscribeToSubscription } = require("../subscriber")

describe('subscribeToSubscription', () => {
    let pubsubStub;
    let subscriptionStub;
    let messageHandler;
    let getSubscriptionStub;
    beforeEach(() => {
        messageHandler = null;
        subscriptionStub = {
            on: jest.fn((event, handler) => {
                if (event === 'message') {
                    messageHandler = handler;
                }
            }),
        }
        getSubscriptionStub = {
            get: jest.fn().mockResolvedValue([subscriptionStub])
        };
        pubsubStub = jest.spyOn(PubSub.prototype, 'subscription').mockReturnValue(getSubscriptionStub);
    });

    afterEach(() => {
        pubsubStub.mockRestore();
    });

    it('should subscribe to an existing subscription and receive messages', async () => {
        // Arrange
        const subscriptionName = 'my-subscription';
        const messageId = '123';
        const data = 'Hello, World!';
        const message = {
            id: messageId,
            data: Buffer.from(data),
            ack: jest.fn(),
        };

        // Act
        await subscribeToSubscription(subscriptionName);
        messageHandler(message);

        // Assert
        expect(pubsubStub).toHaveBeenCalledWith(subscriptionName);
        expect(getSubscriptionStub.get).toHaveBeenCalledTimes(1)
        expect(subscriptionStub.on).toHaveBeenCalledWith('message', expect.any(Function));
        expect(message.ack).toHaveBeenCalledTimes(1);
    });

    it('should handle errors while subscribing', async () => {
        // Arrange
        const subscriptionName = 'my-subscription';
        const errorMessage = 'Subscription not found';
        pubsubStub.mockImplementation(() => {
            throw new Error(errorMessage);
        });

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        // Act
        await subscribeToSubscription(subscriptionName);

        // Assert
        expect(pubsubStub).toHaveBeenCalledWith(subscriptionName);
        expect(consoleErrorSpy).toHaveBeenCalledWith(`Received error while subscribing: ${errorMessage}`);

        consoleErrorSpy.mockRestore();
    });
});
