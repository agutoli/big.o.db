
const O = require('./lib');

const MyTable = O.Table('GraphExample');

const Account = O.Model('Account', {
  ID: O.HashID({ partitionKey: true }),
  email: O.String({ required: true })
}, { table: MyTable });

const Skill = O.Model('Skill', {
  ID: O.HashID({ partitionKey: true }),
  name: O.String({ required: true }),
}, { table: MyTable });

const Address = O.Model('Address', {
  ID: O.HashID({ partitionKey: true }),
  name: O.String({ required: true }),
}, { table: MyTable });

const User = O.Model('User', {
  ID: O.HashID({ partitionKey: true }),
  name: O.String({ required: true }),
  status: O.Boolean({ default: false }),
  gender: O.Enum(['Male', 'Female']),
  skills: O.has.Many(Skill),
  account: O.has.One(Account),
  address: O.has.One(Address)
}, { table: MyTable });


// find one item
// User.findOne({ ID: 'my-id' })
//   .then(user => {
//     console.log('user: ', user);
//   }).catch(err => console.log(err));
//
// Account.findOne({ ID: 'my-id' })
//   .then(user => {
//     console.log('user: ', user.sayHi);
//   }).catch(err => console.log(err));

// find one item
// User.all()
//   .then(users => {
//     console.log(users.debug());
//     // console.log('users: ', JSON.stringify(users, null, 2));
//   }).catch(err => console.log(err));

// Account.all()
//   .then(users => {
//     console.log(users);
//     // console.log('users: ', JSON.stringify(users, null, 2));
//   }).catch(err => console.log(err));

// // example how to create new
// User.create({ name: "Bruno Agutoli" })
//   .then(user => {
//     // console.log('user: ', user);
//   }).catch(err => console.log(err));

// Account.create({ email: "Bruno Agutoli" })
//   .then(user => {
//     // console.log('user: ', user);
//   }).catch(err => console.log(err));
//
// // update one
User.findOne({ ID: 'my-id' })
  .then(user => Promise.all([
    user.skills.all(),
    user.address.get(),
    user.account.get(),
  ]))
  .then(([ skills, address, account ]) => {
    console.log(account);
    console.log(address);
    console.log(skills[1]);
  })
//
// // create many
// User.bulkCreate([
//   { name: 'Fulano' },
//   { name: 'Beltrano' },
// ])
// .then(users => {
//   // console.log('users: ', users);
// });
