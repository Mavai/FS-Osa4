const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, blogsInDb, nonExistingId } = require('./test_helper')

beforeAll(async () => {
  await Blog.remove({})

  const blogObjects = initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})
describe('where there is initially some blogs saved', async () => {
  test('all blogs are returned as JSON by GET /api/blogs', async () => {
    const blogsInDatabase = await blogsInDb();
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    expect(response.body.length).toBe(blogsInDatabase.length)
  })

  test('individual note is returned as JSON by GET /api/blogs/:id', async () => {
    const blogsInDatabase = await blogsInDb()
    const response = await api
      .get(`/api/blogs/${blogsInDatabase[0].id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.title).toBe(blogsInDatabase[0].title)
  })

  test('404 is returned by GET /api/blogs/:id with nonexisting valid id', async () => {
    const validNonexistingId = await nonExistingId()
    const responnse = await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('404 is returned by GET /api/blogs/:id with malformatted id', async () => {
    const malformattedId = '1'
    const response = await api
      .get(`/api/blogs/${malformattedId}`)
      .expect(400)
  })
})

describe('addition of a new blog', async () => {

  test('POST /api/blogs succeeds with valid data', async () => {
    const blogsAtStart = await blogsInDb()

    const newBlog = {
      author: 'test author',
      title: 'test title',
      url: 'test_url'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = await blogsInDb()
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

    const titles = blogsAfterOperation.map(blog => blog.title)
    expect(titles).toContain(newBlog.title)
  })

  test('POST /api/blogs succeeds and likes is set to 0 if not given', async () => {
    const blogsAtStart = await blogsInDb()

    const newBlog = {
      author: 'test author',
      title: 'test title',
      url: 'test_url'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfterOperation = await blogsInDb()
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length + 1)

    expect(response.body.likes).toBe(0)
  })

  test('POST /api/blogs fails with proper statuscode if title is missing', async () => {
    const newBlogWithoutTitle = {
      author: 'test author',
      url: 'test_url'
    }

    const blogsAtStart = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlogWithoutTitle)
      .expect(400)

    const blogsAfterOperation = await blogsInDb()
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
  })

  test('POST /api/blogs fails with proper statuscode if url is missing', async () => {
    const newBlogWithoutTitle = {
      author: 'test author',
      title: 'test title'
    }

    const blogsAtStart = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlogWithoutTitle)
      .expect(400)

    const blogsAfterOperation = await blogsInDb()
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length)
  })
})

afterAll(() => {
  server.close()
})
