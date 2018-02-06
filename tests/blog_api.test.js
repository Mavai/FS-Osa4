const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, blogsInDb, nonExistingId } = require('./test_helper')

describe('when there is initially some blogs saved', async () => {

  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('all blogs are returned as JSON by GET /api/blogs', async () => {
    const blogsInDatabase = await blogsInDb()
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
    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('404 is returned by GET /api/blogs/:id with malformatted id', async () => {
    const malformattedId = '1'
    await api
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

describe('deletion of a blog', async () => {
  let addedBlog

  beforeAll(async () => {
    await Blog.remove({})

    addedBlog = new Blog({
      author: 'test author',
      title: 'test title',
      url: 'test_url'
    })
    await addedBlog.save()
  })

  test('DELETE /api/blogs/:id succeeds with a proper statuscode', async () => {
    const blogsAtStart = await blogsInDb()

    await api
      .delete(`/api/blogs/${addedBlog._id}`)
      .expect(204)

    const blogsAfterOperation = await blogsInDb()
    expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1)

    const titles = blogsAfterOperation.map(blog => blog.title)
    expect(titles).not.toContain(addedBlog.title)
  })
})

describe('editing a blog', async () => {
  let addedBlog

  beforeAll(async () => {
    await Blog.remove({})

    addedBlog = new Blog({
      author: 'test author',
      title: 'test title',
      url: 'test_url'
    })
    await addedBlog.save()
  })

  test('PUT /api/blogs/:id succeeds with a proper statuscode', async () => {
    const editedBlog = { ...addedBlog._doc, likes: 2 }

    await api
      .put(`/api/blogs/${addedBlog._id}`)
      .send(editedBlog)
      .expect(200)

    const editedBlogAfterOperation = await Blog.findById(editedBlog._id)

    expect(editedBlogAfterOperation.likes).toBe(2)
  })

})

afterAll(() => {
  server.close()
})
