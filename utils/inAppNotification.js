import InAppNotification from "../models/inAppNotification.model";
import ApplicationErrorHandler from "./errorHandler";

// Send an in-app notification (Good to have)
export const sendInAppNotification = async (eventId, notificationMessage) => {
  try {
    const event = await EventModel.findById(eventId);
    if (!event) throw new ApplicationErrorHandler('Event not found', 404);

    // Retrieve all RSVPs to get the users
    const rsvps = await RsvpModel.find({ event: eventId }).populate('user');
    const notificationPromises = rsvps.map(rsvp => {
      const notification = new InAppNotification({
        event: eventId,
        user: rsvp.user._id,
        message: notificationMessage,
      });
      return notification.save();
    });

    await Promise.all(notificationPromises);

    return { message: 'In-app notifications sent successfully' };
  } catch (error) {
    throw new ApplicationErrorHandler('Error sending in-app notification', 500);
  }
}