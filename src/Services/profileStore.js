const subscribers = new Set();
let profile = null;

export const profileStore = {
  getProfile() {
    return profile;
  },
  setProfile(nextProfile) {
    profile = nextProfile;
    subscribers.forEach((listener) => {
      try {
        listener(profile);
      } catch (error) {
        console.error('profileStore listener error', error);
      }
    });
  },
  clearProfile() {
    profile = null;
    subscribers.forEach((listener) => {
      try {
        listener(profile);
      } catch (error) {
        console.error('profileStore listener error', error);
      }
    });
  },
  subscribe(listener) {
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
    };
  },
};