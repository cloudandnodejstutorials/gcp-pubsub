const { PubSub } = require('@google-cloud/pubsub');
const { publishMessage } = require('../publisher');

// Mock PubSub
jest.mock('@google-cloud/pubsub', () => {
    const actualPubSub = jest.requireActual('@google-cloud/pubsub');
    const mockTopic = {
        publish: jest.fn().mockResolvedValue(['mockMessageId']),
    };
    const mockPubSub = {
        topic: jest.fn().mockReturnValue(mockTopic),
    };
    return {
        ...actualPubSub,
        PubSub: jest.fn().mockImplementation(() => mockPubSub),
    };
});

describe('publishMessage', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should publish a message to a topic', async () => {
        // Arrange
        const topicName = 'my-topic';
        const data = { message: 'Hello, World!' };

        // Act
        await publishMessage(topicName, data);

        // Assert
        expect(PubSub).toHaveBeenCalledTimes(1);
        expect(PubSub).toHaveBeenCalledWith();
        expect(PubSub().topic).toHaveBeenCalledTimes(1);
        expect(PubSub().topic).toHaveBeenCalledWith(topicName);
        expect(PubSub().topic().publish).toHaveBeenCalledTimes(1);
        expect(PubSub().topic().publish).toHaveBeenCalledWith(Buffer.from(JSON.stringify(data)));
    });

    it('should log the message ID after publishing a message', async () => {
        // Arrange
        const topicName = 'my-topic';
        const data = 'Hello, World!';
        const consoleSpy = jest.spyOn(console, 'log');

        // Act
        await publishMessage(topicName, data);

        // Assert
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(`Message mockMessageId published.`);
    });
});
