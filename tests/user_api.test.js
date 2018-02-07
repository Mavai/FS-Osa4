const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const User = require('../models/user')
const { usersInDb } = require('./test_helper')

describe('when there is initially one user in db', async () => {
  beforeAll(async () => {
    await User.remove({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
  })

  test('POST /api/users succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'test',
      name: 'Test User',
      password: 'sekred'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersAtStart.length + 1)

    const usernames = usersAfterOperation.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('POST /api/users fails with proper statuscode if username already exists', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'test user',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAfterOperation = await usersInDb()
    expect(usersAfterOperation.length).toBe(usersAtStart.length)
  })
})

afterAll(() => {
  server.close()
})