export const COOKIES = {
  // Add your cookies here, e.g.:
  // COOKIE_BANNER_ACCEPTED: {
  //   name: 'cookie_banner_accepted',
  //   value: 'true',
  //   domain: 'example.com',
  //   path: '/',
  //   httpOnly: false,
  //   secure: true,
  // },
};

export const COOKIE_SCENARIOS: Record<string, Array<keyof typeof COOKIES>> = {
  // Add your cookies scenarios here, e.g.:
  //    privacyMinimal: ['COOKIE_BANNER_ACCEPTED'],
  //    fullTracking: [
  //      'COOKIE_BANNER_ACCEPTED',
  //      'MARKETING_CONSENT_GIVEN',
  //      'REMEMBER_ME_ENABLED',
  //   ],
};
