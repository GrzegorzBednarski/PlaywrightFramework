const dev = {
  users: {
    sampleUser_1: {
      name: 'James Miller',
      email: 'sampleUser_1@yopmail.com',
      firstName: 'James',
      lastName: 'Miller',
      title: 'Mr',
      company: 'Acme Technologies Inc.',
      address1: '742 Evergreen Terrace',
      address2: 'Apt 3B',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles',
      zipcode: '90036',
      mobilenumber: '+1 213 555 0198',
    },
    sampleUser_2: {
      name: 'Olivia Johnson',
      email: 'sampleUser_2@yopmail.com',
      firstName: 'Olivia',
      lastName: 'Johnson',
      title: 'Mrs',
      company: 'Northwind Solutions LLC',
      address1: '1200 Market Street',
      address2: 'Suite 450',
      country: 'United States',
      state: 'New York',
      city: 'New York',
      zipcode: '10001',
      mobilenumber: '+1 646 555 0142',
    },
  },
} as const;

const byEnv = {
  dev,
} as const;

type EnvKey = keyof typeof byEnv;
const env = (process.env.ENV as EnvKey) || 'dev';

export const data = byEnv[env];
